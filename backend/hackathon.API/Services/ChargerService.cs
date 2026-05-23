using hackathon.API.Data;
using hackathon.API.Infrastructure;
using hackathon.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace hackathon.API.Services;

public interface IChargerService
{
    Task<string> GetEffectiveStatusAsync(Charger charger);
    Task SyncStatusesFromCsmsAsync();
}

public class ChargerService : IChargerService
{
    private readonly AppDbContext _db;
    private readonly ICsmsClient _csms;
    private readonly IMemoryCache _cache;
    private readonly ILogger<ChargerService> _logger;

    private const string StationsCacheKey = "csms_stations";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(5);

    public ChargerService(AppDbContext db, ICsmsClient csms, IMemoryCache cache, ILogger<ChargerService> logger)
    {
        _db = db;
        _csms = csms;
        _cache = cache;
        _logger = logger;
    }

    public async Task<string> GetEffectiveStatusAsync(Charger charger)
    {
        // Maintenance always wins regardless of CSMS
        if (charger.Status == ChargerStatus.BlockedForMaintenance)
            return "BlockedForMaintenance";

        var now = DateTime.UtcNow;
        var hasActiveMaintenance = await _db.MaintenanceBlocks.AnyAsync(m =>
            m.ChargerId == charger.Id && m.IsActive &&
            m.StartTime <= now && (m.EndTime == null || m.EndTime > now));

        if (hasActiveMaintenance)
            return "BlockedForMaintenance";

        // Fetch CSMS status (cached 5s)
        var csmsMap = await GetCsmsStatusMapAsync();
        if (csmsMap.TryGetValue(charger.ExternalStationId, out var csmsStatus))
        {
            // Charging/Faulted/Unavailable from CSMS override local DB
            var normalised = NormaliseCsmsStatus(csmsStatus);
            if (normalised is "Charging" or "Faulted" or "Unavailable")
                return normalised;
        }

        // Local reservation state (confirmed/active booking)
        var hasActiveBooking = await _db.Bookings.AnyAsync(b =>
            b.ChargerId == charger.Id &&
            (b.State == BookingState.Confirmed || b.State == BookingState.Active));

        if (hasActiveBooking)
            return "Reserved";

        // Fall back to CSMS Available or DB status
        if (csmsMap.TryGetValue(charger.ExternalStationId, out var fallback))
            return NormaliseCsmsStatus(fallback);

        return charger.Status.ToString();
    }

    public async Task SyncStatusesFromCsmsAsync()
    {
        try
        {
            var stations = await _csms.GetStationsAsync();
            if (!stations.Any()) return;

            var stationMap = stations.ToDictionary(s => s.Identity, s => s.Status, StringComparer.OrdinalIgnoreCase);
            var chargers = await _db.Chargers.ToListAsync();
            var now = DateTime.UtcNow;
            var changed = false;

            foreach (var charger in chargers)
            {
                if (!stationMap.TryGetValue(charger.ExternalStationId, out var csmsStatus))
                    continue;

                // Never override admin-set maintenance status from CSMS
                if (charger.Status == ChargerStatus.BlockedForMaintenance)
                    continue;

                var normalised = NormaliseCsmsStatus(csmsStatus);
                if (!Enum.TryParse<ChargerStatus>(normalised, out var newStatus))
                    continue;

                // Don't flip Reserved → Available: booking still holds the slot
                if (charger.Status == ChargerStatus.Reserved && newStatus == ChargerStatus.Available)
                    continue;

                if (newStatus != charger.Status)
                {
                    charger.Status = newStatus;
                    charger.LastCsmsSyncAt = now;
                    changed = true;
                }
            }

            if (changed)
            {
                _cache.Remove(StationsCacheKey);
                await _db.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "CSMS status sync failed — serving stale DB data");
        }
    }

    private async Task<Dictionary<string, string>> GetCsmsStatusMapAsync()
    {
        if (_cache.TryGetValue(StationsCacheKey, out Dictionary<string, string>? cached) && cached != null)
            return cached;

        var stations = await _csms.GetStationsAsync();
        var map = stations.ToDictionary(s => s.Identity, s => s.Status, StringComparer.OrdinalIgnoreCase);
        _cache.Set(StationsCacheKey, map, CacheTtl);
        return map;
    }

    private static string NormaliseCsmsStatus(string raw) => raw.ToLowerInvariant() switch
    {
        "available" => "Available",
        "charging" => "Charging",
        "reserved" => "Reserved",
        "faulted" => "Faulted",
        "unavailable" or "offline" or "disconnected" => "Unavailable",
        _ => "Unavailable"
    };
}
