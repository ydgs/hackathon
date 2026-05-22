using hackathon.API.Data;
using hackathon.API.Models;
using Microsoft.EntityFrameworkCore;

namespace hackathon.API.Services;

/// <summary>
/// US-023: Background service that sends intervention alerts to Security/Workplace/Admin for:
/// - Repeated no-shows (>= NO_SHOW_ALERT_THRESHOLD in INTERVENTION_WINDOW_DAYS days)
/// - Sessions running past booking end + grace period (late release)
/// - Charger faults detected during an active session
///
/// Runs every 5 minutes (less frequent than reminder scheduler — these are operational exceptions).
/// Deduplicates via CorrelationId per interval window.
/// </summary>
public class InterventionAlertService : BackgroundService
{
    private static readonly TimeSpan CheckInterval = TimeSpan.FromMinutes(5);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<InterventionAlertService> _logger;

    public InterventionAlertService(IServiceScopeFactory scopeFactory, ILogger<InterventionAlertService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("InterventionAlertService started.");

        // Stagger startup to spread background service load
        await Task.Delay(TimeSpan.FromSeconds(45), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckForInterventionsAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "InterventionAlertService encountered an error. Will retry in {Interval}m.", CheckInterval.TotalMinutes);
            }

            await Task.Delay(CheckInterval, stoppingToken);
        }

        _logger.LogInformation("InterventionAlertService stopped.");
    }

    private async Task CheckForInterventionsAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var (gracePeriodMinutes, noShowThreshold, interventionWindowDays) = await GetConfig(db);

        var now = DateTime.UtcNow;
        var operatorUserIds = await GetOperatorUserIds(db, ct);

        if (!operatorUserIds.Any())
        {
            _logger.LogDebug("InterventionAlertService: no Security/Workplace/Admin users found.");
            return;
        }

        await CheckRepeatedNoShows(db, now, noShowThreshold, interventionWindowDays, operatorUserIds, ct);
        await CheckLateReleases(db, now, gracePeriodMinutes, operatorUserIds, ct);
        await CheckChargerFaults(db, now, operatorUserIds, ct);

        await db.SaveChangesAsync(ct);
    }

    /// <summary>Alert when a user has >= threshold no-show bookings in the intervention window.</summary>
    private async Task CheckRepeatedNoShows(
        AppDbContext db,
        DateTime now,
        int noShowThreshold,
        int interventionWindowDays,
        List<Guid> operatorUserIds,
        CancellationToken ct)
    {
        var windowStart = now.AddDays(-interventionWindowDays);

        // Group no-show bookings by user in the window
        var noShowsByUser = await db.Bookings
            .Where(b => b.State == BookingState.NoShow
                && b.UpdatedAt >= windowStart)
            .GroupBy(b => b.UserId)
            .Where(g => g.Count() >= noShowThreshold)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        foreach (var entry in noShowsByUser)
        {
            // Use a daily deduplication key — short user ID prefix + day to keep within 100 char limit
            var dayKey = now.Date.ToString("yyyyMMdd");
            var userShort = entry.UserId.ToString()[..8];

            var offendingUser = await db.Users.FindAsync(entry.UserId);
            var displayName = offendingUser?.DisplayName ?? entry.UserId.ToString();
            var body = $"User {displayName} has {entry.Count} no-show booking(s) in the last {interventionWindowDays} days. Consider taking operational action or reviewing their eligibility.";

            foreach (var operatorId in operatorUserIds)
            {
                // Correlation: rns-{userShort}-{dayKey}-{opShort} stays well within 100 chars
                var opShort = operatorId.ToString()[..8];
                var correlationId = $"rns-{userShort}-{dayKey}-{opShort}";

                if (await db.Notifications.AnyAsync(n => n.CorrelationId == correlationId, ct))
                    continue;

                db.Notifications.Add(new Notification
                {
                    Id = Guid.NewGuid(),
                    AudienceUserId = operatorId,
                    TriggerEvent = NotificationTrigger.AdminSecurityWorkplaceInterventionAlert,
                    Channel = NotificationChannel.InApp,
                    Severity = NotificationSeverity.Warning,
                    Title = $"Repeated no-shows: {displayName}",
                    Body = body,
                    DeliveryStatus = NotificationDeliveryStatus.Sent,
                    ReadState = false,
                    CorrelationId = correlationId,
                    Timestamp = now,
                    CreatedAt = now,
                    UpdatedAt = now
                });
            }

            _logger.LogInformation("InterventionAlertService: repeated no-show alert for user {UserId} ({Count} no-shows)", entry.UserId, entry.Count);
        }
    }

    /// <summary>Alert when an Active booking is running past its end time + grace period (late release).</summary>
    private async Task CheckLateReleases(
        AppDbContext db,
        DateTime now,
        int gracePeriodMinutes,
        List<Guid> operatorUserIds,
        CancellationToken ct)
    {
        var cutoff = now.AddMinutes(-gracePeriodMinutes);

        var lateBookings = await db.Bookings
            .Include(b => b.User)
            .Include(b => b.Charger).ThenInclude(c => c.Location)
            .Where(b => b.State == BookingState.Active
                && b.EndTime <= cutoff)
            .ToListAsync(ct);

        foreach (var booking in lateBookings)
        {
            var dayKey = now.Date.ToString("yyyyMMdd");
            var bookingShort = booking.Id.ToString()[..8];
            var userName = booking.User?.DisplayName ?? booking.UserId.ToString();
            var overrunMinutes = (int)(now - booking.EndTime).TotalMinutes;

            foreach (var operatorId in operatorUserIds)
            {
                // Correlation: lr-{bookingShort}-{dayKey}-{opShort} stays within 100 chars
                var opShort = operatorId.ToString()[..8];
                var correlationId = $"lr-{bookingShort}-{dayKey}-{opShort}";

                if (await db.Notifications.AnyAsync(n => n.CorrelationId == correlationId, ct))
                    continue;

                db.Notifications.Add(new Notification
                {
                    Id = Guid.NewGuid(),
                    AudienceUserId = operatorId,
                    TriggerEvent = NotificationTrigger.AdminSecurityWorkplaceInterventionAlert,
                    Channel = NotificationChannel.InApp,
                    Severity = NotificationSeverity.Warning,
                    Title = $"Late release: {booking.Charger?.DisplayName ?? "charger"}",
                    Body = $"{userName} has not released charger {booking.Charger?.DisplayName ?? "unknown"} at {booking.Charger?.Location?.Name ?? "the station"}. Booking ended {overrunMinutes} minutes ago (grace period: {gracePeriodMinutes} minutes). Consider manually releasing the booking.",
                    DeliveryStatus = NotificationDeliveryStatus.Sent,
                    ReadState = false,
                    CorrelationId = correlationId,
                    LinkedBookingId = booking.Id,
                    LinkedChargerId = booking.ChargerId,
                    Timestamp = now,
                    CreatedAt = now,
                    UpdatedAt = now
                });
            }

            _logger.LogInformation("InterventionAlertService: late release alert for booking {BookingId} (user {UserId}, overrun {Overrun}m)",
                booking.Id, booking.UserId, overrunMinutes);
        }
    }

    /// <summary>Alert when a charger is Faulted and has an associated Active session.</summary>
    private async Task CheckChargerFaults(
        AppDbContext db,
        DateTime now,
        List<Guid> operatorUserIds,
        CancellationToken ct)
    {
        var faultedChargersWithActiveSessions = await db.Chargers
            .Include(c => c.Location)
            .Where(c => c.Status == ChargerStatus.Faulted)
            .ToListAsync(ct);

        foreach (var charger in faultedChargersWithActiveSessions)
        {
            // Check if there's an active booking or charging session on this charger
            var activeSession = await db.ChargingSessions
                .Include(s => s.Booking)
                .Where(s => s.ChargerId == charger.Id
                    && (s.State == SessionState.Charging || s.State == SessionState.Authenticating))
                .FirstOrDefaultAsync(ct);

            if (activeSession == null) continue;

            var dayKey = now.Date.ToString("yyyyMMdd");
            var chargerShort = charger.Id.ToString()[..8];

            // Notify the session user first (Critical alert)
            if (activeSession.UserId != Guid.Empty)
            {
                var sessionShort = activeSession.Id.ToString()[..8];
                var userCorrelationId = $"cf-user-{sessionShort}-{dayKey}";
                if (!await db.Notifications.AnyAsync(n => n.CorrelationId == userCorrelationId, ct))
                {
                    db.Notifications.Add(new Notification
                    {
                        Id = Guid.NewGuid(),
                        AudienceUserId = activeSession.UserId,
                        TriggerEvent = NotificationTrigger.AdminSecurityWorkplaceInterventionAlert,
                        Channel = NotificationChannel.InApp,
                        Severity = NotificationSeverity.Critical,
                        Title = "Charger fault — session affected",
                        Body = $"Charger {charger.DisplayName} at {charger.Location?.Name ?? "the station"} has reported a fault during your active session. Security/Workplace has been notified. Please contact site staff.",
                        DeliveryStatus = NotificationDeliveryStatus.Sent,
                        ReadState = false,
                        CorrelationId = userCorrelationId,
                        LinkedSessionId = activeSession.Id,
                        LinkedChargerId = charger.Id,
                        Timestamp = now,
                        CreatedAt = now,
                        UpdatedAt = now
                    });
                }
            }

            // Notify operators
            foreach (var operatorId in operatorUserIds)
            {
                var opShort = operatorId.ToString()[..8];
                var correlationId = $"cf-{chargerShort}-{dayKey}-{opShort}";

                if (await db.Notifications.AnyAsync(n => n.CorrelationId == correlationId, ct))
                    continue;

                db.Notifications.Add(new Notification
                {
                    Id = Guid.NewGuid(),
                    AudienceUserId = operatorId,
                    TriggerEvent = NotificationTrigger.AdminSecurityWorkplaceInterventionAlert,
                    Channel = NotificationChannel.InApp,
                    Severity = NotificationSeverity.Critical,
                    Title = "Critical: charger fault during active session",
                    Body = $"Charger {charger.DisplayName} at {charger.Location?.Name ?? "the station"} is Faulted with an active charging session in progress. Investigate immediately.",
                    DeliveryStatus = NotificationDeliveryStatus.Sent,
                    ReadState = false,
                    CorrelationId = correlationId,
                    LinkedChargerId = charger.Id,
                    Timestamp = now,
                    CreatedAt = now,
                    UpdatedAt = now
                });
            }

            _logger.LogInformation("InterventionAlertService: charger fault alert for charger {ChargerId}", charger.Id);
        }
    }

    /// <summary>Get Security, Workplace, and Admin user IDs to fan-out operator alerts.</summary>
    private static async Task<List<Guid>> GetOperatorUserIds(AppDbContext db, CancellationToken ct)
    {
        return await db.Users
            .Where(u => u.Role == UserRole.Security || u.Role == UserRole.Workplace || u.Role == UserRole.Admin)
            .Select(u => u.Id)
            .ToListAsync(ct);
    }

    private static async Task<(int gracePeriodMinutes, int noShowThreshold, int interventionWindowDays)> GetConfig(AppDbContext db)
    {
        // Config keys match DataSeeder seed keys
        var gracePeriodConfig = await db.SystemConfigs.FindAsync("GRACE_PERIOD_MINUTES");
        var noShowThresholdConfig = await db.SystemConfigs.FindAsync("NO_SHOW_THRESHOLD_COUNT");
        var interventionWindowConfig = await db.SystemConfigs.FindAsync("NO_SHOW_THRESHOLD_DAYS");

        var gracePeriod = int.TryParse(gracePeriodConfig?.Value, out var g) ? g : 15;
        var noShowThreshold = int.TryParse(noShowThresholdConfig?.Value, out var n) ? n : 2;
        var interventionWindow = int.TryParse(interventionWindowConfig?.Value, out var w) ? w : 7;

        return (gracePeriod, noShowThreshold, interventionWindow);
    }
}
