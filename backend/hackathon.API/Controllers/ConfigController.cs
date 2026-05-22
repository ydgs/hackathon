using hackathon.API.Data;
using hackathon.API.DTOs;
using hackathon.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace hackathon.API.Controllers;

[ApiController]
[Route("api/v1/config")]
[Authorize(Roles = "Admin")]
public class ConfigController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IAuditLogService _audit;

    private static readonly HashSet<string> AllowedKeys = new()
    {
        "GRACE_PERIOD_MINUTES", "PRE_SESSION_REMINDER_MINUTES", "SESSION_ENDING_REMINDER_MINUTES",
        "GRACE_PERIOD_WARNING_OFFSET_MINUTES", "NO_SHOW_THRESHOLD_COUNT", "NO_SHOW_THRESHOLD_DAYS",
        "DAILY_CAP_MINUTES", "EMISSION_FACTOR_KG_PER_KWH", "CSMS_POLLING_INTERVAL_SECONDS"
    };

    public ConfigController(AppDbContext db, IAuditLogService audit)
    {
        _db = db;
        _audit = audit;
    }

    [HttpGet]
    public async Task<IActionResult> GetConfig()
    {
        var configs = await _db.SystemConfigs.OrderBy(c => c.Key).ToListAsync();
        return Ok(new { data = configs.Select(c => new SystemConfigDto { Key = c.Key, Value = c.Value, UpdatedAt = c.UpdatedAt, UpdatedBy = c.UpdatedBy }) });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateConfig([FromBody] UpdateConfigRequest request)
    {
        if (request.Updates == null || !request.Updates.Any())
            return BadRequest(new ApiError { Message = "No updates provided.", Errors = new List<ApiErrorDetail> { new() { Code = "ValidationFailed", Message = "Updates array cannot be empty." } } });

        var errors = new List<ApiErrorDetail>();
        foreach (var update in request.Updates)
        {
            if (!AllowedKeys.Contains(update.Key))
                errors.Add(new() { Field = "key", Code = "ValidationFailed", Message = $"Unknown config key: {update.Key}." });
        }
        if (errors.Any()) return BadRequest(new ApiError { Message = "Validation failed.", Errors = errors });

        var userId = GetCurrentUserId();
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "Admin";

        foreach (var update in request.Updates)
        {
            var config = await _db.SystemConfigs.FindAsync(update.Key);
            if (config != null)
            {
                var before = config.Value;
                config.Value = update.Value;
                config.UpdatedAt = DateTime.UtcNow;
                config.UpdatedBy = userId;

                await _audit.LogAsync(userId.ToString(), role, "SystemConfigUpdated", "SystemConfig",
                    update.Key, "Admin", $"{{\"value\":\"{before}\"}}", $"{{\"value\":\"{update.Value}\"}}");
            }
        }

        await _db.SaveChangesAsync();

        var allConfigs = await _db.SystemConfigs.OrderBy(c => c.Key).ToListAsync();
        return Ok(new { data = allConfigs.Select(c => new SystemConfigDto { Key = c.Key, Value = c.Value, UpdatedAt = c.UpdatedAt, UpdatedBy = c.UpdatedBy }) });
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : Guid.Empty;
    }
}
