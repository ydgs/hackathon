using hackathon.API.Data;
using hackathon.API.DTOs;
using hackathon.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace hackathon.API.Controllers;

[ApiController]
[Route("api/v1/ai")]
[Authorize(Roles = "Admin,ReportingESGViewer,Management")]
public class AiController : ControllerBase
{
    private readonly AppDbContext _db;

    public AiController(AppDbContext db) => _db = db;

    /// <summary>GET /ai/insights — Grounded AI insights based on session/booking data.</summary>
    [HttpGet("insights")]
    public async Task<IActionResult> GetInsights([FromQuery] ReportingQuery query)
    {
        // Gather grounding data
        var sessionsQuery = _db.ChargingSessions
            .Include(s => s.Charger).ThenInclude(c => c.Location)
            .Where(s => s.State == SessionState.Completed);

        if (query.DateFrom.HasValue) sessionsQuery = sessionsQuery.Where(s => s.StartTime >= query.DateFrom.Value);
        if (query.DateTo.HasValue) sessionsQuery = sessionsQuery.Where(s => s.StartTime < query.DateTo.Value);
        if (!string.IsNullOrWhiteSpace(query.LocationCode)) sessionsQuery = sessionsQuery.Where(s => s.Charger.Location.Code == query.LocationCode);

        var sessions = await sessionsQuery.ToListAsync();
        var sessionCount = sessions.Count;
        var totalKwh = sessions.Sum(s => s.EnergyKwh);
        var hasSimulated = sessions.Any(s => s.Source == "CSMS-Simulator");

        var confidence = sessionCount switch { >= 50 => "High", >= 10 => "Medium", _ => "Low" };

        var noShowBookings = await _db.Bookings
            .Where(b => b.State == BookingState.NoShow)
            .CountAsync();
        var totalBookings = await _db.Bookings.CountAsync();
        var noShowRate = totalBookings > 0 ? Math.Round((decimal)noShowBookings / totalBookings, 2) : 0;

        var avgDuration = sessions
            .Where(s => s.StartTime.HasValue && s.StopTime.HasValue)
            .Select(s => (s.StopTime!.Value - s.StartTime!.Value).TotalMinutes)
            .DefaultIfEmpty(0).Average();

        // Peak hour bucket
        var peakHour = sessions
            .Where(s => s.StartTime.HasValue)
            .GroupBy(s => s.StartTime!.Value.Hour)
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key)
            .FirstOrDefault();

        // Top charger
        var topChargerId = sessions
            .GroupBy(s => s.ChargerId)
            .OrderByDescending(g => g.Count())
            .Select(g => (Guid?)g.Key)
            .FirstOrDefault();

        var grounding = new
        {
            sessionCount,
            totalKwh = Math.Round(totalKwh, 2),
            topChargerId,
            peakHourBucket = peakHour,
            noShowRate,
            avgDurationMinutes = Math.Round((decimal)avgDuration, 1)
        };

        // Generate demand forecast (only for Medium/High confidence)
        var forecast = new List<object>();
        if (confidence != "Low")
        {
            var hourGroups = sessions
                .Where(s => s.StartTime.HasValue)
                .GroupBy(s => s.StartTime!.Value.Hour)
                .OrderByDescending(g => g.Count())
                .Take(3)
                .Select(g => new { hourBucket = g.Key, demandScore = Math.Round((decimal)g.Count() / sessionCount, 2) });
            forecast.AddRange(hourGroups);
        }

        // Build NL summary
        var simLabel = hasSimulated ? " (based on simulated demo data)" : "";
        var nlSummary = sessionCount == 0
            ? "No charging sessions found in the selected period. Ensure the date range includes completed sessions."
            : $"In the selected period{simLabel}, {sessionCount} charging sessions delivered {Math.Round(totalKwh, 1)} kWh total. Average session duration was {Math.Round((decimal)avgDuration, 0)} minutes. Peak demand was at hour {peakHour:D2}:00. No-show rate was {noShowRate * 100:F0}%.";

        // Patterns and recommendations
        var patterns = new List<object>();
        var recommendations = new List<object>();

        if (noShowRate > 0.15m)
            patterns.Add(new { patternType = "HighNoShowRate", entityId = (string?)null, supportingCount = noShowBookings, severity = "Warning" });

        if (sessionCount >= 10)
            recommendations.Add(new
            {
                text = "Maintain the 1-hour-per-user-per-day rule to ensure fair access. Consider sending reminders 10 minutes before session start to reduce no-shows.",
                metric = "NoShowRate",
                thresholdReason = $"No-show rate: {noShowRate * 100:F0}%"
            });

        return Ok(new
        {
            nlSummary,
            demandForecast = forecast,
            patterns,
            anomalies = new List<object>(),
            recommendations,
            grounding,
            confidence,
            simulatedDataLabel = hasSimulated ? "Based on simulated demo data" : null
        });
    }
}
