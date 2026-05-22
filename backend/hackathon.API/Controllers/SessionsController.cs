using hackathon.API.Data;
using hackathon.API.DTOs;
using hackathon.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace hackathon.API.Controllers;

[ApiController]
[Route("api/v1/sessions")]
[Authorize]
public class SessionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SessionsController(AppDbContext db) => _db = db;

    [HttpGet]
    [Authorize(Roles = "Admin,Workplace,Security,ReportingESGViewer")]
    public async Task<IActionResult> GetSessions([FromQuery] SessionListQuery query)
    {
        var q = _db.ChargingSessions
            .Include(s => s.User)
            .Include(s => s.Charger).ThenInclude(c => c.Location)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.State))
        {
            var states = query.State.Split(',').ToList();
            q = q.Where(s => states.Contains(s.State.ToString()));
        }
        if (query.ChargerId.HasValue) q = q.Where(s => s.ChargerId == query.ChargerId.Value);
        if (query.UserId.HasValue) q = q.Where(s => s.UserId == query.UserId.Value);
        if (!string.IsNullOrWhiteSpace(query.LocationCode)) q = q.Where(s => s.Charger.Location.Code == query.LocationCode);
        if (query.DateFrom.HasValue) q = q.Where(s => s.StartTime >= query.DateFrom.Value);
        if (query.DateTo.HasValue) q = q.Where(s => s.StartTime < query.DateTo.Value);
        if (!string.IsNullOrWhiteSpace(query.Source)) q = q.Where(s => s.Source == query.Source);

        q = query.SortBy.ToLower() == "energykwh"
            ? (query.SortOrder == "asc" ? q.OrderBy(s => s.EnergyKwh) : q.OrderByDescending(s => s.EnergyKwh))
            : (query.SortOrder == "asc" ? q.OrderBy(s => s.StartTime) : q.OrderByDescending(s => s.StartTime));

        var limit = Math.Min(Math.Max(1, query.Limit), 100);
        var page = Math.Max(1, query.Page);
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * limit).Take(limit).ToListAsync();

        return Ok(new PagedResponse<SessionDto>
        {
            Data = items.Select(MapToDto).ToList(),
            Pagination = new PaginationInfo { Page = page, Limit = limit, Total = total, TotalPages = (int)Math.Ceiling((double)total / limit) }
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetSession(Guid id)
    {
        var userId = GetCurrentUserId();
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";

        var session = await _db.ChargingSessions
            .Include(s => s.User)
            .Include(s => s.Charger).ThenInclude(c => c.Location)
            .Include(s => s.Booking)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (session == null)
            return NotFound(new ApiError { Message = "Session not found.", Errors = new List<ApiErrorDetail> { new() { Code = "NotFound", Message = "Session not found." } } });

        var isOwner = session.UserId == userId;
        var isPrivileged = role is "Admin" or "Workplace" or "Security";
        if (!isOwner && !isPrivileged) return Forbid();

        return Ok(MapToDto(session));
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : Guid.Empty;
    }

    private static SessionDto MapToDto(ChargingSession s) => new()
    {
        Id = s.Id,
        BookingId = s.BookingId,
        ChargerId = s.ChargerId,
        ChargerDisplayName = s.Charger?.DisplayName ?? string.Empty,
        UserId = s.UserId,
        UserDisplayName = s.User?.DisplayName ?? string.Empty,
        VehicleMake = s.VehicleMake,
        VehicleModel = s.VehicleModel,
        State = s.State.ToString(),
        StartTime = s.StartTime,
        StopTime = s.StopTime,
        EnergyKwh = s.EnergyKwh,
        Source = s.Source,
        CsmsSessionId = s.CsmsSessionId
    };
}
