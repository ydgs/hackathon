using hackathon.API.Data;
using hackathon.API.DTOs;
using hackathon.API.Infrastructure;
using hackathon.API.Models;
using hackathon.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace hackathon.API.Controllers;

[ApiController]
[Route("api/v1/maintenance-blocks")]
[Authorize(Roles = "Admin")]
public class MaintenanceBlocksController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICsmsClient _csms;
    private readonly IAuditLogService _audit;

    public MaintenanceBlocksController(AppDbContext db, ICsmsClient csms, IAuditLogService audit)
    {
        _db = db;
        _csms = csms;
        _audit = audit;
    }

    [HttpPost]
    public async Task<IActionResult> CreateBlock([FromBody] CreateMaintenanceBlockRequest request)
    {
        var errors = new List<ApiErrorDetail>();
        if (request.ChargerId == Guid.Empty) errors.Add(new() { Field = "chargerId", Code = "RequiredFieldMissing", Message = "Charger is required." });
        if (string.IsNullOrWhiteSpace(request.Reason)) errors.Add(new() { Field = "reason", Code = "ReasonRequired", Message = "Reason is required." });
        if (errors.Any()) return BadRequest(new ApiError { Message = "Validation failed.", Errors = errors });

        var charger = await _db.Chargers.FirstOrDefaultAsync(c => c.Id == request.ChargerId);
        if (charger == null)
            return NotFound(new ApiError { Message = "Charger not found.", Errors = new List<ApiErrorDetail> { new() { Code = "NotFound", Message = "Charger not found." } } });

        // Check for conflicting bookings
        var conflictingBookings = await _db.Bookings
            .Where(b => b.ChargerId == request.ChargerId
                && (b.State == BookingState.Pending || b.State == BookingState.Confirmed || b.State == BookingState.Active)
                && b.StartTime < (request.EndTime ?? DateTime.MaxValue)
                && b.EndTime > request.StartTime)
            .ToListAsync();

        if (conflictingBookings.Any() && !request.ForceReleaseExistingBookings)
            return Conflict(new ApiError
            {
                Message = "Maintenance block conflicts with existing bookings.",
                Errors = new List<ApiErrorDetail> { new() { Code = "MaintenanceBlockConflict", Message = $"{conflictingBookings.Count} booking(s) overlap this maintenance window. Set forceReleaseExistingBookings=true to override." } }
            });

        var userId = GetCurrentUserId();
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "Admin";

        if (conflictingBookings.Any() && request.ForceReleaseExistingBookings)
        {
            foreach (var b in conflictingBookings)
            {
                b.State = BookingState.Released;
                b.ReasonForOverride = $"Maintenance block: {request.Reason}";
                b.ActorUserId = userId;
            }
        }

        var block = new MaintenanceBlock
        {
            Id = Guid.NewGuid(),
            ChargerId = request.ChargerId,
            ActorUserId = userId,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Reason = request.Reason,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.MaintenanceBlocks.Add(block);

        charger.Status = ChargerStatus.BlockedForMaintenance;
        await _db.SaveChangesAsync();

        // Call CSMS
        await _csms.BlockConnectorAsync(charger.ExternalStationId, charger.ConnectorId);

        await _audit.LogAsync(userId.ToString(), role, "MaintenanceBlockCreated", "MaintenanceBlock",
            block.Id.ToString(), "Admin", reason: request.Reason);
        await _audit.LogAsync("system", "System", "CsmsConnectorBlocked", "Charger",
            charger.Id.ToString(), "System");

        return CreatedAtAction(nameof(CreateBlock), new { id = block.Id }, new MaintenanceBlockDto
        {
            Id = block.Id,
            ChargerId = block.ChargerId,
            ActorUserId = block.ActorUserId,
            StartTime = block.StartTime,
            EndTime = block.EndTime,
            Reason = block.Reason,
            IsActive = block.IsActive,
            CreatedAt = block.CreatedAt
        });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> RemoveBlock(Guid id)
    {
        var block = await _db.MaintenanceBlocks.Include(m => m.Charger).FirstOrDefaultAsync(m => m.Id == id);
        if (block == null)
            return NotFound(new ApiError { Message = "Block not found.", Errors = new List<ApiErrorDetail> { new() { Code = "NotFound", Message = "Maintenance block not found." } } });

        if (!block.IsActive)
            return Conflict(new ApiError { Message = "Block already inactive.", Errors = new List<ApiErrorDetail> { new() { Code = "Conflict", Message = "This maintenance block is already inactive." } } });

        block.IsActive = false;
        block.EndTime = DateTime.UtcNow;
        block.Charger.Status = ChargerStatus.Available;
        await _db.SaveChangesAsync();

        await _csms.UnblockConnectorAsync(block.Charger.ExternalStationId, block.Charger.ConnectorId);

        var userId = GetCurrentUserId().ToString();
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "Admin";
        await _audit.LogAsync(userId, role, "MaintenanceBlockRemoved", "MaintenanceBlock", block.Id.ToString(), "Admin");
        await _audit.LogAsync("system", "System", "CsmsConnectorUnblocked", "Charger", block.ChargerId.ToString(), "System");

        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : Guid.Empty;
    }
}
