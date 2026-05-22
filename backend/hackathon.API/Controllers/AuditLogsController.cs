using hackathon.API.Data;
using hackathon.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace hackathon.API.Controllers;

[ApiController]
[Route("api/v1/audit-logs")]
[Authorize(Roles = "Admin,Security,Workplace")]
public class AuditLogsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AuditLogsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAuditLogs([FromQuery] AuditLogQuery query)
    {
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";
        var q = _db.AuditLogs.AsQueryable();

        // Security and Workplace see operational scope only
        if (role is "Security" or "Workplace")
        {
            var allowedTypes = new[] { "Booking", "Charger", "MaintenanceBlock", "Csms" };
            q = q.Where(a => allowedTypes.Contains(a.EntityType));
        }

        if (!string.IsNullOrWhiteSpace(query.ActorUserId)) q = q.Where(a => a.ActorUserId == query.ActorUserId);

        if (!string.IsNullOrWhiteSpace(query.Action))
        {
            var actions = query.Action.Split(',').ToList();
            q = q.Where(a => actions.Contains(a.Action));
        }

        if (!string.IsNullOrWhiteSpace(query.EntityType))
        {
            var types = query.EntityType.Split(',').ToList();
            q = q.Where(a => types.Contains(a.EntityType));
        }

        if (!string.IsNullOrWhiteSpace(query.EntityId)) q = q.Where(a => a.EntityId == query.EntityId);
        if (!string.IsNullOrWhiteSpace(query.Source)) q = q.Where(a => a.Source == query.Source);
        if (query.DateFrom.HasValue) q = q.Where(a => a.Timestamp >= query.DateFrom.Value);
        if (query.DateTo.HasValue) q = q.Where(a => a.Timestamp < query.DateTo.Value);

        q = query.SortOrder == "asc" ? q.OrderBy(a => a.Timestamp) : q.OrderByDescending(a => a.Timestamp);

        var limit = Math.Min(Math.Max(1, query.Limit), 100);
        var page = Math.Max(1, query.Page);
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * limit).Take(limit).ToListAsync();

        return Ok(new PagedResponse<AuditLogDto>
        {
            Data = items.Select(a => new AuditLogDto
            {
                Id = a.Id,
                Timestamp = a.Timestamp,
                ActorUserId = a.ActorUserId,
                ActorRole = a.ActorRole,
                Action = a.Action,
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                BeforeState = a.BeforeState,
                AfterState = a.AfterState,
                Reason = a.Reason,
                Source = a.Source
            }).ToList(),
            Pagination = new PaginationInfo { Page = page, Limit = limit, Total = total, TotalPages = (int)Math.Ceiling((double)total / limit) }
        });
    }
}
