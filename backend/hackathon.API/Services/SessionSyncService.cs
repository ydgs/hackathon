using hackathon.API.Data;
using hackathon.API.Infrastructure;
using hackathon.API.Models;
using Microsoft.EntityFrameworkCore;

namespace hackathon.API.Services;

/// <summary>
/// Background service that polls the CSMS every 30 seconds to sync active session
/// state into local charging_sessions and bookings records.
/// Runs only when Csms:MockMode is false (or not set).
/// </summary>
public class SessionSyncService : BackgroundService
{
    private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(30);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SessionSyncService> _logger;
    private readonly IConfiguration _config;

    public SessionSyncService(
        IServiceScopeFactory scopeFactory,
        ILogger<SessionSyncService> logger,
        IConfiguration config)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _config = config;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("SessionSyncService started. Polling interval: {Interval}s", PollInterval.TotalSeconds);

        // Stagger startup to avoid hammering CSMS at the same moment as other services
        await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SyncSessionsAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SessionSyncService encountered an error during sync cycle. Will retry in {Interval}s.", PollInterval.TotalSeconds);
            }

            await Task.Delay(PollInterval, stoppingToken);
        }

        _logger.LogInformation("SessionSyncService stopped.");
    }

    private async Task SyncSessionsAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var csms = scope.ServiceProvider.GetRequiredService<ICsmsClient>();
        var audit = scope.ServiceProvider.GetRequiredService<IAuditLogService>();

        // Fetch active sessions from CSMS
        var csmsSessions = await csms.GetActiveSessionsAsync();
        if (!csmsSessions.Any())
        {
            _logger.LogDebug("SessionSyncService: no active CSMS sessions found.");
            return;
        }

        _logger.LogDebug("SessionSyncService: syncing {Count} active CSMS sessions.", csmsSessions.Count);

        foreach (var csmsSession in csmsSessions)
        {
            try
            {
                await SyncSingleSessionAsync(db, audit, csmsSession, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "SessionSyncService: failed to sync CSMS session {SessionId}", csmsSession.Id);
            }
        }

        await db.SaveChangesAsync(ct);

        // Mark local sessions as Completed if they are no longer active in CSMS
        await MarkOrphanedSessionsCompleted(db, csmsSessions, ct);
    }

    private async Task SyncSingleSessionAsync(
        AppDbContext db,
        IAuditLogService audit,
        CsmsSession csmsSession,
        CancellationToken ct)
    {
        // Find the charger by external station ID
        var charger = await db.Chargers
            .FirstOrDefaultAsync(c => c.ExternalStationId == csmsSession.StationIdentity, ct);

        if (charger == null)
        {
            _logger.LogDebug("SessionSyncService: no charger found for station {Station}", csmsSession.StationIdentity);
            return;
        }

        // Find existing local session by CSMS session ID
        var localSession = await db.ChargingSessions
            .Include(s => s.Booking)
            .FirstOrDefaultAsync(s => s.CsmsSessionId == csmsSession.Id, ct);

        if (localSession != null)
        {
            // Update existing session energy and status
            var newState = MapCsmsStatusToSessionState(csmsSession.Status);
            if (localSession.State != newState || localSession.EnergyKwh != csmsSession.EnergyKwh)
            {
                localSession.EnergyKwh = csmsSession.EnergyKwh;
                localSession.State = newState;
                if (csmsSession.StopTime.HasValue && localSession.StopTime == null)
                    localSession.StopTime = csmsSession.StopTime;
                localSession.UpdatedAt = DateTime.UtcNow;

                _logger.LogDebug("SessionSyncService: updated session {SessionId} state={State} energy={Kwh}kWh",
                    csmsSession.Id, newState, csmsSession.EnergyKwh);
            }
        }
        else
        {
            // New CSMS session — try to link to a confirmed/active booking by idTag
            var booking = await db.Bookings
                .Where(b => b.ChargerId == charger.Id
                    && (b.State == BookingState.Confirmed || b.State == BookingState.Active)
                    && b.CsmsIdTag == csmsSession.IdTag)
                .OrderBy(b => b.StartTime)
                .FirstOrDefaultAsync(ct);

            // ChargingSession.BookingId is non-nullable — we can only create a session if a booking exists
            if (booking == null)
            {
                _logger.LogDebug("SessionSyncService: CSMS session {CsmsId} has no matching booking — skipping record creation.",
                    csmsSession.Id);

                // Still update charger status to Charging so the dashboard reflects activity
                if (charger.Status == ChargerStatus.Reserved || charger.Status == ChargerStatus.Available)
                    charger.Status = ChargerStatus.Charging;

                return;
            }

            // Transition booking to Active
            if (booking.State == BookingState.Confirmed)
            {
                booking.State = BookingState.Active;
                booking.UpdatedAt = DateTime.UtcNow;
            }

            // Update existing placeholder session (state NotStarted) if it already exists
            var placeholder = await db.ChargingSessions
                .FirstOrDefaultAsync(s => s.BookingId == booking.Id && s.State == SessionState.NotStarted, ct);

            if (placeholder != null)
            {
                placeholder.CsmsSessionId = csmsSession.Id;
                placeholder.State = SessionState.Charging;
                placeholder.StartTime = csmsSession.StartTime ?? DateTime.UtcNow;
                placeholder.EnergyKwh = csmsSession.EnergyKwh;
                placeholder.Source = "CSMS";
                placeholder.UpdatedAt = DateTime.UtcNow;

                _logger.LogInformation("SessionSyncService: linked CSMS session {CsmsId} to booking {BookingId} (updated placeholder).",
                    csmsSession.Id, booking.Id);
                return;
            }

            // Create new session record linked to the booking
            var newSession = new ChargingSession
            {
                Id = Guid.NewGuid(),
                BookingId = booking.Id,
                ChargerId = charger.Id,
                UserId = booking.UserId,
                CsmsSessionId = csmsSession.Id,
                State = MapCsmsStatusToSessionState(csmsSession.Status),
                StartTime = csmsSession.StartTime ?? DateTime.UtcNow,
                StopTime = csmsSession.StopTime,
                EnergyKwh = csmsSession.EnergyKwh,
                Source = "CSMS",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            db.ChargingSessions.Add(newSession);

            // Update charger status to Charging
            if (charger.Status == ChargerStatus.Reserved || charger.Status == ChargerStatus.Available)
                charger.Status = ChargerStatus.Charging;

            _logger.LogInformation("SessionSyncService: created new session for CSMS session {CsmsId} on charger {ChargerId}",
                csmsSession.Id, charger.Id);
        }
    }

    private async Task MarkOrphanedSessionsCompleted(
        AppDbContext db,
        List<CsmsSession> activeCsmsSessions,
        CancellationToken ct)
    {
        var activeCsmsIds = activeCsmsSessions.Select(s => s.Id).ToHashSet();

        // Find local Charging sessions whose CSMS session ID is no longer in the active list
        var orphanedSessions = await db.ChargingSessions
            .Include(s => s.Booking)
            .Include(s => s.Charger)
            .Where(s => s.State == SessionState.Charging
                && !s.CsmsSessionId.StartsWith("PENDING-")
                && !activeCsmsIds.Contains(s.CsmsSessionId))
            .ToListAsync(ct);

        foreach (var session in orphanedSessions)
        {
            session.State = SessionState.Completed;
            session.StopTime ??= DateTime.UtcNow;
            session.UpdatedAt = DateTime.UtcNow;

            // Transition linked booking to Completed
            if (session.Booking != null && session.Booking.State == BookingState.Active)
            {
                session.Booking.State = BookingState.Completed;
                session.Booking.UpdatedAt = DateTime.UtcNow;
            }

            // Return charger to Available if it was Charging
            if (session.Charger != null && session.Charger.Status == ChargerStatus.Charging)
            {
                session.Charger.Status = ChargerStatus.Available;
                session.Charger.UpdatedAt = DateTime.UtcNow;
            }

            _logger.LogInformation("SessionSyncService: marked session {SessionId} as Completed (CSMS session no longer active).",
                session.Id);
        }

        if (orphanedSessions.Any())
            await db.SaveChangesAsync(ct);
    }

    private static SessionState MapCsmsStatusToSessionState(string csmsStatus) => csmsStatus?.ToLower() switch
    {
        "charging" or "active" => SessionState.Charging,
        "completed" or "stopped" => SessionState.Completed,
        "faulted" or "error" => SessionState.Faulted,
        _ => SessionState.Charging // default active sessions to Charging
    };
}
