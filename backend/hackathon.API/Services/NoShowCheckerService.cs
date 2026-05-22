using hackathon.API.Data;
using hackathon.API.Models;
using Microsoft.EntityFrameworkCore;

namespace hackathon.API.Services;

/// <summary>
/// Background service that runs every minute and marks Confirmed bookings as NoShow
/// if the grace period has passed without an active charging session starting.
///
/// Grace period is read from SystemConfig["GRACE_PERIOD_MINUTES"] (default: 15 minutes).
/// </summary>
public class NoShowCheckerService : BackgroundService
{
    private static readonly TimeSpan CheckInterval = TimeSpan.FromMinutes(1);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<NoShowCheckerService> _logger;

    public NoShowCheckerService(IServiceScopeFactory scopeFactory, ILogger<NoShowCheckerService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("NoShowCheckerService started.");

        // Stagger startup slightly
        await Task.Delay(TimeSpan.FromSeconds(20), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckForNoShowsAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "NoShowCheckerService encountered an error. Will retry in {Interval}m.", CheckInterval.TotalMinutes);
            }

            await Task.Delay(CheckInterval, stoppingToken);
        }

        _logger.LogInformation("NoShowCheckerService stopped.");
    }

    private async Task CheckForNoShowsAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var audit = scope.ServiceProvider.GetRequiredService<IAuditLogService>();

        // Read grace period from system config
        var gracePeriodMinutes = await GetGracePeriodMinutes(db);
        var cutoffTime = DateTime.UtcNow.AddMinutes(-gracePeriodMinutes);

        // Find Confirmed bookings whose slot started more than grace period ago
        // and have no active or completed charging session
        var overdueBookings = await db.Bookings
            .Include(b => b.ChargingSession)
            .Include(b => b.Charger)
            .Where(b => b.State == BookingState.Confirmed
                && b.StartTime <= cutoffTime
                && (b.ChargingSession == null
                    || (b.ChargingSession.State == SessionState.NotStarted
                        || b.ChargingSession.State == SessionState.Authenticating)))
            .ToListAsync(ct);

        if (!overdueBookings.Any())
        {
            _logger.LogDebug("NoShowCheckerService: no no-show candidates found.");
            return;
        }

        _logger.LogInformation("NoShowCheckerService: found {Count} no-show candidate(s).", overdueBookings.Count);

        foreach (var booking in overdueBookings)
        {
            try
            {
                booking.State = BookingState.NoShow;
                booking.UpdatedAt = DateTime.UtcNow;

                // Return charger to Available if it was Reserved
                if (booking.Charger != null && booking.Charger.Status == ChargerStatus.Reserved)
                {
                    booking.Charger.Status = ChargerStatus.Available;
                    booking.Charger.UpdatedAt = DateTime.UtcNow;
                }

                // Mark placeholder session as Expired
                if (booking.ChargingSession != null
                    && (booking.ChargingSession.State == SessionState.NotStarted
                        || booking.ChargingSession.State == SessionState.Authenticating))
                {
                    booking.ChargingSession.State = SessionState.Expired;
                    booking.ChargingSession.StopTime = DateTime.UtcNow;
                    booking.ChargingSession.UpdatedAt = DateTime.UtcNow;
                }

                _logger.LogInformation("NoShowCheckerService: booking {BookingId} marked as NoShow (grace={Grace}m).",
                    booking.Id, gracePeriodMinutes);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "NoShowCheckerService: failed to mark booking {BookingId} as NoShow.", booking.Id);
            }
        }

        await db.SaveChangesAsync(ct);

        // Audit log one batch entry
        foreach (var booking in overdueBookings)
        {
            await audit.LogAsync(
                "system", "System",
                "BookingAutoNoShow", "Booking",
                booking.Id.ToString(), "System",
                reason: $"Grace period of {gracePeriodMinutes} minutes exceeded with no session started.");
        }
    }

    private static async Task<int> GetGracePeriodMinutes(AppDbContext db)
    {
        var config = await db.SystemConfigs.FindAsync("GRACE_PERIOD_MINUTES");
        return int.TryParse(config?.Value, out var minutes) ? minutes : 15;
    }
}
