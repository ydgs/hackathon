using hackathon.API.Data;
using hackathon.API.Models;
using Microsoft.EntityFrameworkCore;

namespace hackathon.API.Services;

/// <summary>
/// Background service that runs every minute and sends in-app notifications:
/// - SessionStartingSoon: X minutes before a Confirmed booking starts
/// - ChargingSessionEndingSoon: Y minutes before a booking's end time (session still active)
/// - MoveVehiclePrompt: when a Charging booking approaches its end time
///
/// Timings are read from SystemConfig (PRE_SESSION_REMINDER_MINUTES, SESSION_ENDING_REMINDER_MINUTES).
/// Notifications are deduplicated by CorrelationId so they are only sent once.
/// </summary>
public class ReminderSchedulerService : BackgroundService
{
    private static readonly TimeSpan CheckInterval = TimeSpan.FromMinutes(1);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ReminderSchedulerService> _logger;

    public ReminderSchedulerService(IServiceScopeFactory scopeFactory, ILogger<ReminderSchedulerService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ReminderSchedulerService started.");

        // Stagger startup
        await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SendRemindersAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ReminderSchedulerService encountered an error. Will retry in {Interval}m.", CheckInterval.TotalMinutes);
            }

            await Task.Delay(CheckInterval, stoppingToken);
        }

        _logger.LogInformation("ReminderSchedulerService stopped.");
    }

    private async Task SendRemindersAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var (preSessionMinutes, sessionEndingMinutes, gracePeriodMinutes) = await GetReminderMinutes(db);

        var now = DateTime.UtcNow;

        await SendPreSessionReminders(db, now, preSessionMinutes, ct);
        await SendGracePeriodWarnings(db, now, gracePeriodMinutes, ct);
        await SendSessionEndingReminders(db, now, sessionEndingMinutes, ct);
        await SendSessionEndedNotifications(db, now, ct);
        await SendSlotReleasePrompts(db, now, gracePeriodMinutes, ct);

        await db.SaveChangesAsync(ct);
    }

    /// <summary>Send "your session is starting in X minutes" to users with upcoming Confirmed bookings.</summary>
    private async Task SendPreSessionReminders(
        AppDbContext db, DateTime now, int preSessionMinutes, CancellationToken ct)
    {
        // Window: bookings starting between (now + preSessionMinutes - 1 min) and (now + preSessionMinutes)
        var windowStart = now.AddMinutes(preSessionMinutes - 1);
        var windowEnd = now.AddMinutes(preSessionMinutes);

        var upcomingBookings = await db.Bookings
            .Include(b => b.User)
            .Include(b => b.Charger).ThenInclude(c => c.Location)
            .Where(b => b.State == BookingState.Confirmed
                && b.StartTime >= windowStart
                && b.StartTime < windowEnd)
            .ToListAsync(ct);

        foreach (var booking in upcomingBookings)
        {
            var correlationId = $"reminder-start-{booking.Id}";

            // Skip if already sent
            if (await db.Notifications.AnyAsync(n => n.CorrelationId == correlationId, ct))
                continue;

            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                AudienceUserId = booking.UserId,
                TriggerEvent = NotificationTrigger.SessionStartingSoon,
                Channel = NotificationChannel.InApp,
                Severity = NotificationSeverity.Info,
                Title = "Your charging session is starting soon",
                Body = $"Your booking at {booking.Charger?.Location?.Name ?? "the charging station"} ({booking.Charger?.DisplayName ?? "charger"}) starts in {preSessionMinutes} minutes. Please proceed to the charger.",
                DeliveryStatus = NotificationDeliveryStatus.Sent,
                ReadState = false,
                CorrelationId = correlationId,
                LinkedBookingId = booking.Id,
                LinkedChargerId = booking.ChargerId,
                Timestamp = now,
                CreatedAt = now,
                UpdatedAt = now
            };

            db.Notifications.Add(notification);

            _logger.LogInformation("ReminderSchedulerService: sent SessionStartingSoon to user {UserId} for booking {BookingId}",
                booking.UserId, booking.Id);
        }
    }

    /// <summary>Send "your session ends in X minutes" to users with Active bookings nearing their end time.</summary>
    private async Task SendSessionEndingReminders(
        AppDbContext db, DateTime now, int sessionEndingMinutes, CancellationToken ct)
    {
        var windowStart = now.AddMinutes(sessionEndingMinutes - 1);
        var windowEnd = now.AddMinutes(sessionEndingMinutes);

        var endingBookings = await db.Bookings
            .Include(b => b.User)
            .Include(b => b.Charger).ThenInclude(c => c.Location)
            .Where(b => b.State == BookingState.Active
                && b.EndTime >= windowStart
                && b.EndTime < windowEnd)
            .ToListAsync(ct);

        foreach (var booking in endingBookings)
        {
            var correlationId = $"reminder-end-{booking.Id}";

            if (await db.Notifications.AnyAsync(n => n.CorrelationId == correlationId, ct))
                continue;

            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                AudienceUserId = booking.UserId,
                TriggerEvent = NotificationTrigger.ChargingSessionEndingSoon,
                Channel = NotificationChannel.InApp,
                Severity = NotificationSeverity.Warning,
                Title = "Your charging session is ending soon",
                Body = $"Your charging slot at {booking.Charger?.Location?.Name ?? "the charging station"} ends in {sessionEndingMinutes} minutes. Please return to your vehicle and disconnect.",
                DeliveryStatus = NotificationDeliveryStatus.Sent,
                ReadState = false,
                CorrelationId = correlationId,
                LinkedBookingId = booking.Id,
                LinkedChargerId = booking.ChargerId,
                Timestamp = now,
                CreatedAt = now,
                UpdatedAt = now
            };

            db.Notifications.Add(notification);

            _logger.LogInformation("ReminderSchedulerService: sent ChargingSessionEndingSoon to user {UserId} for booking {BookingId}",
                booking.UserId, booking.Id);
        }
    }

    /// <summary>US-022: Send "grace period warning" when booking started ~5 min ago and no active CSMS session exists.</summary>
    private async Task SendGracePeriodWarnings(
        AppDbContext db, DateTime now, int gracePeriodMinutes, CancellationToken ct)
    {
        // Warn at 5 minutes after start (midpoint in default 15-min grace period)
        var warningOffsetMinutes = Math.Max(1, gracePeriodMinutes / 3);
        var windowStart = now.AddMinutes(-(warningOffsetMinutes + 1));
        var windowEnd = now.AddMinutes(-warningOffsetMinutes);

        var overdueBookings = await db.Bookings
            .Include(b => b.User)
            .Include(b => b.Charger).ThenInclude(c => c.Location)
            .Include(b => b.ChargingSession)
            .Where(b => b.State == BookingState.Confirmed
                && b.StartTime >= windowStart
                && b.StartTime < windowEnd
                && (b.ChargingSession == null
                    || b.ChargingSession.State == SessionState.NotStarted
                    || b.ChargingSession.State == SessionState.Authenticating))
            .ToListAsync(ct);

        foreach (var booking in overdueBookings)
        {
            var correlationId = $"grace-warning-{booking.Id}";
            if (await db.Notifications.AnyAsync(n => n.CorrelationId == correlationId, ct))
                continue;

            db.Notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                AudienceUserId = booking.UserId,
                TriggerEvent = NotificationTrigger.BookingGracePeriodWarning,
                Channel = NotificationChannel.InApp,
                Severity = NotificationSeverity.Warning,
                Title = "Your session has not started yet",
                Body = $"Your booking at {booking.Charger?.Location?.Name ?? "the charging station"} started {warningOffsetMinutes} minutes ago but no active session was detected. Please proceed to the charger and start charging within the grace period ({gracePeriodMinutes} minutes total) to avoid an automatic no-show.",
                DeliveryStatus = NotificationDeliveryStatus.Sent,
                ReadState = false,
                CorrelationId = correlationId,
                LinkedBookingId = booking.Id,
                LinkedChargerId = booking.ChargerId,
                Timestamp = now,
                CreatedAt = now,
                UpdatedAt = now
            });

            _logger.LogInformation("ReminderSchedulerService: sent GracePeriodWarning to user {UserId} for booking {BookingId}",
                booking.UserId, booking.Id);
        }
    }

    /// <summary>US-022: Send "session ended" and "move vehicle" notifications when session transitions to Completed.</summary>
    private async Task SendSessionEndedNotifications(AppDbContext db, DateTime now, CancellationToken ct)
    {
        // Find sessions that completed in the last 2 minutes (to catch them in the polling window)
        var windowStart = now.AddMinutes(-2);

        var justCompletedSessions = await db.ChargingSessions
            .Include(s => s.Booking).ThenInclude(b => b.Charger).ThenInclude(c => c.Location)
            .Where(s => s.State == SessionState.Completed
                && s.StopTime.HasValue
                && s.StopTime.Value >= windowStart
                && s.StopTime.Value < now)
            .ToListAsync(ct);

        foreach (var session in justCompletedSessions)
        {
            var booking = session.Booking;
            if (booking == null) continue;

            // ChargingSessionEnded notification
            var endedCorrelationId = $"session-ended-{session.Id}";
            if (!await db.Notifications.AnyAsync(n => n.CorrelationId == endedCorrelationId, ct))
            {
                var energyDisplay = session.EnergyKwh > 0 ? $" Energy delivered: {session.EnergyKwh:F2} kWh." : "";
                db.Notifications.Add(new Notification
                {
                    Id = Guid.NewGuid(),
                    AudienceUserId = booking.UserId,
                    TriggerEvent = NotificationTrigger.ChargingSessionEnded,
                    Channel = NotificationChannel.InApp,
                    Severity = NotificationSeverity.Info,
                    Title = "Charging session ended",
                    Body = $"Your charging session at {booking.Charger?.Location?.Name ?? "the charging station"} ({booking.Charger?.DisplayName ?? "charger"}) has ended.{energyDisplay} Thank you for using the service.",
                    DeliveryStatus = NotificationDeliveryStatus.Sent,
                    ReadState = false,
                    CorrelationId = endedCorrelationId,
                    LinkedBookingId = booking.Id,
                    LinkedSessionId = session.Id,
                    LinkedChargerId = booking.ChargerId,
                    Timestamp = now,
                    CreatedAt = now,
                    UpdatedAt = now
                });

                _logger.LogInformation("ReminderSchedulerService: sent ChargingSessionEnded to user {UserId} for session {SessionId}",
                    booking.UserId, session.Id);
            }

            // MoveVehiclePrompt notification
            var moveCorrelationId = $"move-vehicle-{session.Id}";
            if (!await db.Notifications.AnyAsync(n => n.CorrelationId == moveCorrelationId, ct))
            {
                db.Notifications.Add(new Notification
                {
                    Id = Guid.NewGuid(),
                    AudienceUserId = booking.UserId,
                    TriggerEvent = NotificationTrigger.MoveVehiclePrompt,
                    Channel = NotificationChannel.InApp,
                    Severity = NotificationSeverity.Warning,
                    Title = "Please move your vehicle",
                    Body = $"Your charging session at {booking.Charger?.Location?.Name ?? "the charging station"} has completed. Please disconnect and move your vehicle to free the charger for other users.",
                    DeliveryStatus = NotificationDeliveryStatus.Sent,
                    ReadState = false,
                    CorrelationId = moveCorrelationId,
                    LinkedBookingId = booking.Id,
                    LinkedSessionId = session.Id,
                    LinkedChargerId = booking.ChargerId,
                    Timestamp = now,
                    CreatedAt = now,
                    UpdatedAt = now
                });

                _logger.LogInformation("ReminderSchedulerService: sent MoveVehiclePrompt to user {UserId} for session {SessionId}",
                    booking.UserId, session.Id);
            }
        }
    }

    /// <summary>US-022: Send "slot release prompt" when Active booking is past its end time + grace period.</summary>
    private async Task SendSlotReleasePrompts(AppDbContext db, DateTime now, int gracePeriodMinutes, CancellationToken ct)
    {
        var cutoff = now.AddMinutes(-gracePeriodMinutes);

        var overrunBookings = await db.Bookings
            .Include(b => b.User)
            .Include(b => b.Charger).ThenInclude(c => c.Location)
            .Where(b => b.State == BookingState.Active
                && b.EndTime <= cutoff)
            .ToListAsync(ct);

        foreach (var booking in overrunBookings)
        {
            var correlationId = $"slot-release-{booking.Id}";
            if (await db.Notifications.AnyAsync(n => n.CorrelationId == correlationId, ct))
                continue;

            db.Notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                AudienceUserId = booking.UserId,
                TriggerEvent = NotificationTrigger.SlotReleasePrompt,
                Channel = NotificationChannel.InApp,
                Severity = NotificationSeverity.Critical,
                Title = "Please release your charging slot",
                Body = $"Your booking at {booking.Charger?.Location?.Name ?? "the charging station"} ended {gracePeriodMinutes} minutes ago. Please disconnect and release the slot for other users. Failure to do so may impact your future booking eligibility.",
                DeliveryStatus = NotificationDeliveryStatus.Sent,
                ReadState = false,
                CorrelationId = correlationId,
                LinkedBookingId = booking.Id,
                LinkedChargerId = booking.ChargerId,
                Timestamp = now,
                CreatedAt = now,
                UpdatedAt = now
            });

            _logger.LogInformation("ReminderSchedulerService: sent SlotReleasePrompt to user {UserId} for booking {BookingId}",
                booking.UserId, booking.Id);
        }
    }

    private static async Task<(int preSessionMinutes, int sessionEndingMinutes, int gracePeriodMinutes)> GetReminderMinutes(AppDbContext db)
    {
        var preSessionConfig = await db.SystemConfigs.FindAsync("PRE_SESSION_REMINDER_MINUTES");
        var sessionEndingConfig = await db.SystemConfigs.FindAsync("SESSION_ENDING_REMINDER_MINUTES");
        var gracePeriodConfig = await db.SystemConfigs.FindAsync("GRACE_PERIOD_MINUTES");

        var preSessionMinutes = int.TryParse(preSessionConfig?.Value, out var pre) ? pre : 10;
        var sessionEndingMinutes = int.TryParse(sessionEndingConfig?.Value, out var end) ? end : 5;
        var gracePeriodMinutes = int.TryParse(gracePeriodConfig?.Value, out var grace) ? grace : 15;

        return (preSessionMinutes, sessionEndingMinutes, gracePeriodMinutes);
    }
}
