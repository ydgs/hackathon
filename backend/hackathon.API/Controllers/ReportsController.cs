using hackathon.API.Data;
using hackathon.API.DTOs;
using hackathon.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace hackathon.API.Controllers;

[ApiController]
[Route("api/v1/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReportsController(AppDbContext db) => _db = db;

    private async Task<decimal> GetEmissionFactor()
    {
        var cfg = await _db.SystemConfigs.FindAsync("EMISSION_FACTOR_KG_PER_KWH");
        return decimal.TryParse(cfg?.Value, out var f) ? f : 0.85m;
    }

    private async Task<bool> HasSimulatedData(IQueryable<ChargingSession> query)
    {
        return await query.AnyAsync(s => s.Source == "CSMS-Simulator");
    }

    private static string? GetSimulatedLabel(bool hasSimulated) =>
        hasSimulated ? "Based on simulated demo data" : null;

    private IQueryable<ChargingSession> ApplyCommonFilters(IQueryable<ChargingSession> q, ReportingQuery query)
    {
        if (query.DateFrom.HasValue) q = q.Where(s => s.StartTime >= query.DateFrom.Value);
        if (query.DateTo.HasValue) q = q.Where(s => s.StartTime < query.DateTo.Value);
        if (!string.IsNullOrWhiteSpace(query.LocationCode)) q = q.Where(s => s.Charger.Location.Code == query.LocationCode);
        if (query.ChargerId.HasValue) q = q.Where(s => s.ChargerId == query.ChargerId.Value);
        return q;
    }

    /// <summary>GET /reports/summary</summary>
    [HttpGet("summary")]
    [Authorize(Roles = "Admin,Workplace,ReportingESGViewer,Management")]
    public async Task<IActionResult> GetSummary([FromQuery] ReportingQuery query)
    {
        var sessions = _db.ChargingSessions.Include(s => s.Charger).ThenInclude(c => c.Location).AsQueryable();
        sessions = ApplyCommonFilters(sessions, query);
        var completedSessions = sessions.Where(s => s.State == SessionState.Completed);

        var total = await completedSessions.CountAsync();
        var totalKwh = await completedSessions.SumAsync(s => s.EnergyKwh);
        var emissionFactor = await GetEmissionFactor();
        var hasSimulated = await HasSimulatedData(completedSessions);

        return Ok(new ReportResponse<SummaryReportData>
        {
            Data = new SummaryReportData
            {
                TotalSessions = total,
                TotalKwh = Math.Round(totalKwh, 2),
                EstimatedCo2SavingsKg = Math.Round(totalKwh * emissionFactor, 2),
                EmissionFactorUsed = emissionFactor
            },
            SimulatedDataLabel = GetSimulatedLabel(hasSimulated),
            AppliedFilters = new AppliedFilters { DateFrom = query.DateFrom, DateTo = query.DateTo, LocationCode = query.LocationCode, ChargerId = query.ChargerId }
        });
    }

    /// <summary>GET /reports/sessions</summary>
    [HttpGet("sessions")]
    [Authorize(Roles = "Admin,Workplace,ReportingESGViewer")]
    public async Task<IActionResult> GetSessionsReport([FromQuery] ReportingQuery query)
    {
        var sessions = _db.ChargingSessions.Include(s => s.Charger).ThenInclude(c => c.Location).AsQueryable();
        sessions = ApplyCommonFilters(sessions, query);

        var allSessions = await sessions.ToListAsync();
        var completed = allSessions.Where(s => s.State == SessionState.Completed).ToList();
        var cancelled = await ApplyCommonFilters(_db.Bookings.Include(b => b.Charger).ThenInclude(c => c.Location).AsQueryable()
            .Where(b => b.State == BookingState.Cancelled), new ReportingQuery { DateFrom = query.DateFrom, DateTo = query.DateTo, LocationCode = query.LocationCode, ChargerId = query.ChargerId }).CountAsync();

        var avgDuration = completed.Any()
            ? completed.Where(s => s.StartTime.HasValue && s.StopTime.HasValue)
                .Select(s => (s.StopTime!.Value - s.StartTime!.Value).TotalMinutes).DefaultIfEmpty(0).Average()
            : 0;

        var hasSimulated = allSessions.Any(s => s.Source == "CSMS-Simulator");

        return Ok(new ReportResponse<SessionsReportData>
        {
            Data = new SessionsReportData
            {
                TotalSessions = allSessions.Count,
                CompletedCount = completed.Count,
                CancelledCount = cancelled,
                ReleasedCount = allSessions.Count(s => s.State == SessionState.StoppedByUser || s.State == SessionState.StoppedByAdmin),
                NoShowCount = allSessions.Count(s => s.State == SessionState.Expired),
                AvgDurationMinutes = Math.Round((decimal)avgDuration, 1),
                AvgKwh = completed.Any() ? Math.Round(completed.Average(s => s.EnergyKwh), 2) : 0
            },
            SimulatedDataLabel = GetSimulatedLabel(hasSimulated),
            AppliedFilters = new AppliedFilters { DateFrom = query.DateFrom, DateTo = query.DateTo, LocationCode = query.LocationCode, ChargerId = query.ChargerId }
        });
    }

    /// <summary>GET /reports/energy</summary>
    [HttpGet("energy")]
    [Authorize(Roles = "Admin,Workplace,ReportingESGViewer")]
    public async Task<IActionResult> GetEnergyReport([FromQuery] ReportingQuery query)
    {
        var sessions = _db.ChargingSessions.Include(s => s.Charger).ThenInclude(c => c.Location).AsQueryable();
        sessions = ApplyCommonFilters(sessions, query);
        var completed = sessions.Where(s => s.State == SessionState.Completed);

        var allCompleted = await completed.ToListAsync();
        var totalKwh = allCompleted.Sum(s => s.EnergyKwh);
        var avgKwh = allCompleted.Any() ? allCompleted.Average(s => s.EnergyKwh) : 0;

        var peakHours = allCompleted
            .Where(s => s.StartTime.HasValue)
            .GroupBy(s => s.StartTime!.Value.Hour)
            .OrderBy(g => g.Key)
            .Select(g => new HourDistributionEntry { Hour = g.Key, SessionCount = g.Count() })
            .ToList();

        var chargerRanking = allCompleted
            .GroupBy(s => new { s.ChargerId, s.Charger?.DisplayName })
            .OrderByDescending(g => g.Sum(s => s.EnergyKwh))
            .Select(g => new ChargerRankingEntry
            {
                ChargerId = g.Key.ChargerId,
                DisplayName = g.Key.DisplayName ?? string.Empty,
                SessionCount = g.Count(),
                TotalKwh = Math.Round(g.Sum(s => s.EnergyKwh), 2)
            }).ToList();

        var hasSimulated = allCompleted.Any(s => s.Source == "CSMS-Simulator");

        return Ok(new ReportResponse<EnergyReportData>
        {
            Data = new EnergyReportData
            {
                TotalKwh = Math.Round(totalKwh, 2),
                AvgKwhPerSession = Math.Round(avgKwh, 2),
                PeakHourDistribution = peakHours,
                ChargerRanking = chargerRanking
            },
            SimulatedDataLabel = GetSimulatedLabel(hasSimulated),
            AppliedFilters = new AppliedFilters { DateFrom = query.DateFrom, DateTo = query.DateTo, LocationCode = query.LocationCode, ChargerId = query.ChargerId }
        });
    }

    /// <summary>GET /reports/utilization</summary>
    [HttpGet("utilization")]
    [Authorize(Roles = "Admin,Workplace")]
    public async Task<IActionResult> GetUtilizationReport([FromQuery] ReportingQuery query)
    {
        var chargers = await _db.Chargers.Include(c => c.Location).ToListAsync();
        var sessions = _db.ChargingSessions.Include(s => s.Charger).ThenInclude(c => c.Location).AsQueryable();
        sessions = ApplyCommonFilters(sessions, query);

        var dateFrom = query.DateFrom ?? DateTime.UtcNow.AddDays(-7);
        var dateTo = query.DateTo ?? DateTime.UtcNow;
        var totalWindowMinutes = (dateTo - dateFrom).TotalMinutes;

        var allSessions = await sessions.Where(s => s.State == SessionState.Completed).ToListAsync();
        var maintenanceBlocks = await _db.MaintenanceBlocks
            .Where(m => m.StartTime < dateTo && (m.EndTime == null || m.EndTime > dateFrom))
            .ToListAsync();

        var chargerEntries = chargers.Select(c =>
        {
            var chargerSessions = allSessions.Where(s => s.ChargerId == c.Id).ToList();
            var chargerMinutes = chargerSessions
                .Where(s => s.StartTime.HasValue && s.StopTime.HasValue)
                .Sum(s => (s.StopTime!.Value - s.StartTime!.Value).TotalMinutes);
            var utilPct = totalWindowMinutes > 0 ? (decimal)(chargerMinutes / totalWindowMinutes * 100) : 0;

            var maintMins = maintenanceBlocks.Where(m => m.ChargerId == c.Id)
                .Sum(m =>
                {
                    var start = m.StartTime < dateFrom ? dateFrom : m.StartTime;
                    var end = m.EndTime.HasValue ? (m.EndTime.Value > dateTo ? dateTo : m.EndTime.Value) : dateTo;
                    return Math.Max(0, (end - start).TotalMinutes);
                });

            return new ChargerUtilizationEntry
            {
                ChargerId = c.Id,
                DisplayName = c.DisplayName,
                UtilizationPercent = Math.Round(utilPct, 1),
                BlockedForMaintenanceMinutes = (int)maintMins,
                FaultedEventCount = 0 // TODO: count from audit logs
            };
        }).ToList();

        var locationGroups = chargerEntries.GroupBy(c =>
        {
            var charger = chargers.FirstOrDefault(ch => ch.Id == c.ChargerId);
            return charger?.Location?.Code ?? "Unknown";
        }).ToDictionary(g => g.Key, g => new LocationUtilizationEntry
        {
            TotalSessions = allSessions.Count(s => chargers.Where(c => c.Location?.Code == g.Key).Select(c => c.Id).Contains(s.ChargerId)),
            TotalKwh = Math.Round(allSessions.Where(s => chargers.Where(c => c.Location?.Code == g.Key).Select(c => c.Id).Contains(s.ChargerId)).Sum(s => s.EnergyKwh), 2),
            AvgUtilizationPercent = g.Any() ? Math.Round(g.Average(e => e.UtilizationPercent), 1) : 0
        });

        return Ok(new ReportResponse<UtilizationReportData>
        {
            Data = new UtilizationReportData { Chargers = chargerEntries, LocationComparison = locationGroups },
            AppliedFilters = new AppliedFilters { DateFrom = query.DateFrom, DateTo = query.DateTo, LocationCode = query.LocationCode, ChargerId = query.ChargerId }
        });
    }

    /// <summary>GET /reports/sustainability</summary>
    [HttpGet("sustainability")]
    [Authorize(Roles = "Admin,ReportingESGViewer,Management")]
    public async Task<IActionResult> GetSustainabilityReport([FromQuery] ReportingQuery query)
    {
        var sessions = _db.ChargingSessions.Include(s => s.Charger).ThenInclude(c => c.Location).AsQueryable();
        sessions = ApplyCommonFilters(sessions, query);
        var completed = await sessions.Where(s => s.State == SessionState.Completed).ToListAsync();

        var emissionFactor = await GetEmissionFactor();
        var totalKwh = completed.Sum(s => s.EnergyKwh);

        // Group by vehicle make, roll-up groups with < 3 distinct users to "Other"
        var vehicleGroups = completed
            .GroupBy(s => s.VehicleMake ?? "Unknown")
            .Select(g => new
            {
                Make = g.Key,
                UserCount = g.Select(s => s.UserId).Distinct().Count(),
                SessionCount = g.Count(),
                TotalKwh = g.Sum(s => s.EnergyKwh)
            })
            .ToList();

        var vehicleCategories = vehicleGroups
            .Where(g => g.UserCount >= 3)
            .Select(g => new VehicleCategoryEntry { VehicleMake = g.Make, UserCount = g.UserCount, SessionCount = g.SessionCount, TotalKwh = Math.Round(g.TotalKwh, 2) })
            .ToList();

        var otherGroup = vehicleGroups.Where(g => g.UserCount < 3).ToList();
        if (otherGroup.Any())
        {
            vehicleCategories.Add(new VehicleCategoryEntry
            {
                VehicleMake = "Other",
                UserCount = otherGroup.SelectMany(_ => completed.Where(s => _.Make == (s.VehicleMake ?? "Unknown")).Select(s => s.UserId)).Distinct().Count(),
                SessionCount = otherGroup.Sum(g => g.SessionCount),
                TotalKwh = Math.Round(otherGroup.Sum(g => g.TotalKwh), 2)
            });
        }

        var hasSimulated = completed.Any(s => s.Source == "CSMS-Simulator");

        return Ok(new ReportResponse<SustainabilityReportData>
        {
            Data = new SustainabilityReportData
            {
                TotalKwh = Math.Round(totalKwh, 2),
                EstimatedCo2SavingsKg = Math.Round(totalKwh * emissionFactor, 2),
                EmissionFactorUsed = emissionFactor,
                UsageByVehicleCategory = vehicleCategories
            },
            SimulatedDataLabel = GetSimulatedLabel(hasSimulated),
            AppliedFilters = new AppliedFilters { DateFrom = query.DateFrom, DateTo = query.DateTo, LocationCode = query.LocationCode, ChargerId = query.ChargerId }
        });
    }

    private IQueryable<Booking> ApplyCommonFilters(IQueryable<Booking> q, ReportingQuery query)
    {
        if (query.DateFrom.HasValue) q = q.Where(b => b.StartTime >= query.DateFrom.Value);
        if (query.DateTo.HasValue) q = q.Where(b => b.StartTime < query.DateTo.Value);
        if (!string.IsNullOrWhiteSpace(query.LocationCode)) q = q.Where(b => b.Charger.Location.Code == query.LocationCode);
        if (query.ChargerId.HasValue) q = q.Where(b => b.ChargerId == query.ChargerId.Value);
        return q;
    }
}
