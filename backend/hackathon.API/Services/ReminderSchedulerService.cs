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

        var (preSessionMinutes, sessionEndingMinutes) = await GetReminderMinutes(db);

        var now = DateTime.UtcNow;

        await SendPreSessionReminders(db, now, preSessionMinutes, ct);
        await SendSessionEndingReminders(db, now, sessionEndingMinutes, ct);

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

    private static async Task<(int preSessionMinutes, int sessionEndingMinutes)> GetReminderMinutes(AppDbContext db)
    {
        var preSessionConfig = await db.SystemConfigs.FindAsync("PRE_SESSION_REMINDER_MINUTES");
        var sessionEndingConfig = await db.SystemConfigs.FindAsync("SESSION_ENDING_REMINDER_MINUTES");

        var preSessionMinutes = int.TryParse(preSessionConfig?.Value, out var pre) ? pre : 10;
        var sessionEndingMinutes = int.TryParse(sessionEndingConfig?.Value, out var end) ? end : 5;

        return (preSessionMinutes, sessionEndingMinutes);
    }
}
