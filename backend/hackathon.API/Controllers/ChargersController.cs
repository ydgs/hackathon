using hackathon.API.Data;
using hackathon.API.DTOs;
using hackathon.API.Models;
using hackathon.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace hackathon.API.Controllers;

[ApiController]
[Route("api/v1/chargers")]
[Authorize]
public class ChargersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IAuditLogService _audit;
    private readonly IChargerService _chargerService;

    public ChargersController(AppDbContext db, IAuditLogService audit, IChargerService chargerService)
    {
        _db = db;
        _audit = audit;
        _chargerService = chargerService;
    }

    /// <summary>GET /chargers — List all chargers with CSMS-merged status.</summary>
    [HttpGet]
    public async Task<IActionResult> GetChargers([FromQuery] string? locationCode, [FromQuery] string? status)
    {
        // Refresh DB statuses from CSMS before serving (graceful: never fails the request)
        await _chargerService.SyncStatusesFromCsmsAsync();

        var query = _db.Chargers.Include(c => c.Location).AsQueryable();

        if (!string.IsNullOrWhiteSpace(locationCode))
            query = query.Where(c => c.Location.Code == locationCode);

        var chargers = await query.OrderBy(c => c.DisplayName).ToListAsync();
        var userRole = User.FindFirstValue(ClaimTypes.Role) ?? "";
        var isPrivileged = userRole is "Admin" or "Security" or "Workplace";

        // Apply status filter after computing effective status (sequential — DbContext is not thread-safe)
        var dtos = new List<ChargerDto>();
        foreach (var c in chargers)
            dtos.Add(await MapChargerDto(c, isPrivileged));

        if (!string.IsNullOrWhiteSpace(status))
        {
            var statuses = status.Split(',', StringSplitOptions.RemoveEmptyEntries);
            var filtered = dtos.Where(d => statuses.Contains(d.Status)).ToList();
            return Ok(new ListResponse<ChargerDto> { Data = filtered });
        }

        return Ok(new ListResponse<ChargerDto> { Data = dtos.ToList() });
    }

    /// <summary>GET /chargers/{id} — Single charger detail.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetCharger(Guid id)
    {
        var charger = await _db.Chargers.Include(c => c.Location).FirstOrDefaultAsync(c => c.Id == id);
        if (charger == null)
            return NotFound(new ApiError { Message = "Charger not found.", Errors = new List<ApiErrorDetail> { new() { Code = "NotFound", Message = "Charger not found." } } });

        var userRole = User.FindFirstValue(ClaimTypes.Role) ?? "";
        var isPrivileged = userRole is "Admin" or "Security" or "Workplace";

        return Ok(await MapChargerDto(charger, isPrivileged));
    }

    /// <summary>PUT /chargers/{id}/status — Override charger status.</summary>
    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "Admin,Security,Workplace")]
    public async Task<IActionResult> UpdateChargerStatus(Guid id, [FromBody] UpdateChargerStatusRequest request)
    {
        var errors = new List<ApiErrorDetail>();
        if (string.IsNullOrWhiteSpace(request.Status))
            errors.Add(new() { Field = "status", Code = "RequiredFieldMissing", Message = "Status is required." });
        if (string.IsNullOrWhiteSpace(request.Reason))
            errors.Add(new() { Field = "reason", Code = "ReasonRequired", Message = "Reason is required." });

        if (errors.Any()) return BadRequest(new ApiError { Message = "Validation failed.", Errors = errors });

        // Validate status value — Reserved and Charging are CSMS-driven, not settable here
        var allowedStatuses = new[] { "Available", "Unavailable", "Faulted", "BlockedForMaintenance" };
        if (!allowedStatuses.Contains(request.Status))
            return BadRequest(new ApiError
            {
                Message = "Validation failed.",
                Errors = new List<ApiErrorDetail> { new() { Field = "status", Code = "InvalidEnumValue", Message = "Status must be one of: Available, Unavailable, Faulted, BlockedForMaintenance." } }
            });

        var charger = await _db.Chargers.Include(c => c.Location).FirstOrDefaultAsync(c => c.Id == id);
        if (charger == null)
            return NotFound(new ApiError { Message = "Charger not found.", Errors = new List<ApiErrorDetail> { new() { Code = "NotFound", Message = "Charger not found." } } });

        var beforeStatus = charger.Status.ToString();
        charger.Status = Enum.Parse<ChargerStatus>(request.Status);

        await _db.SaveChangesAsync();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? "unknown";
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "Unknown";
        await _audit.LogAsync(userId, role, "ChargerStatusChanged", "Charger", charger.Id.ToString(),
            "Admin", $"{{\"status\":\"{beforeStatus}\"}}", $"{{\"status\":\"{charger.Status}\"}}", request.Reason);

        return Ok(await MapChargerDto(charger, true));
    }

    private async Task<ChargerDto> MapChargerDto(Charger c, bool isPrivileged)
    {
        ActiveSessionDto? activeSession = null;

        if (c.Status == ChargerStatus.Charging)
        {
            var session = await _db.ChargingSessions
                .Include(s => s.User)
                .Include(s => s.Booking)
                .Where(s => s.ChargerId == c.Id && s.State == SessionState.Charging)
                .OrderByDescending(s => s.StartTime)
                .FirstOrDefaultAsync();

            if (session != null)
            {
                var elapsed = session.StartTime.HasValue
                    ? (int)(DateTime.UtcNow - session.StartTime.Value).TotalMinutes
                    : 0;

                activeSession = new ActiveSessionDto
                {
                    Id = session.Id,
                    UserDisplayName = isPrivileged ? session.User.DisplayName : "***",
                    VehicleMake = isPrivileged ? (session.VehicleMake ?? "***") : "***",
                    VehicleModel = isPrivileged ? (session.VehicleModel ?? "***") : "***",
                    StartTime = session.StartTime,
                    EnergyKwh = session.EnergyKwh,
                    ElapsedMinutes = elapsed
                };
            }
        }

        var effectiveStatus = await _chargerService.GetEffectiveStatusAsync(c);

        return new ChargerDto
        {
            Id = c.Id,
            ExternalStationId = c.ExternalStationId,
            DisplayName = c.DisplayName,
            ConnectorId = c.ConnectorId,
            Status = effectiveStatus,
            Location = new LocationDto { Id = c.Location.Id, Name = c.Location.Name, Code = c.Location.Code },
            LastCsmsSyncAt = c.LastCsmsSyncAt,
            ActiveSession = activeSession
        };
    }
}
