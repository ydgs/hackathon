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
[Route("api/v1/bookings")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IBookingService _bookingService;

    public BookingsController(AppDbContext db, IBookingService bookingService)
    {
        _db = db;
        _bookingService = bookingService;
    }

    /// <summary>GET /bookings — List bookings filtered by role.</summary>
    [HttpGet]
    public async Task<IActionResult> GetBookings([FromQuery] BookingListQuery query)
    {
        var userId = GetCurrentUserId();
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";

        // ReportingESGViewer blocked
        if (role == "ReportingESGViewer")
            return Forbid();

        var q = _db.Bookings
            .Include(b => b.User)
            .Include(b => b.Charger).ThenInclude(c => c.Location)
            .AsQueryable();

        // Standard users see only their own bookings
        if (role == "StandardUser")
            q = q.Where(b => b.UserId == userId);
        else if (query.UserId.HasValue)
            q = q.Where(b => b.UserId == query.UserId.Value);

        // Apply filters
        if (!string.IsNullOrWhiteSpace(query.State))
        {
            var states = query.State.Split(',').Select(s => s.Trim()).ToList();
            q = q.Where(b => states.Contains(b.State.ToString()));
        }
        if (query.ChargerId.HasValue) q = q.Where(b => b.ChargerId == query.ChargerId.Value);
        if (!string.IsNullOrWhiteSpace(query.LocationCode)) q = q.Where(b => b.Charger.Location.Code == query.LocationCode);
        if (query.DateFrom.HasValue) q = q.Where(b => b.StartTime >= query.DateFrom.Value);
        if (query.DateTo.HasValue) q = q.Where(b => b.StartTime < query.DateTo.Value);
        if (!string.IsNullOrWhiteSpace(query.CsmsSyncStatus))
        {
            var syncStatuses = query.CsmsSyncStatus.Split(',').Select(s => s.Trim()).ToList();
            q = q.Where(b => syncStatuses.Contains(b.CsmsSyncStatus.ToString()));
        }

        // Sort
        q = query.SortBy.ToLower() switch
        {
            "createdat" => query.SortOrder == "asc" ? q.OrderBy(b => b.CreatedAt) : q.OrderByDescending(b => b.CreatedAt),
            "state" => query.SortOrder == "asc" ? q.OrderBy(b => b.State) : q.OrderByDescending(b => b.State),
            _ => query.SortOrder == "asc" ? q.OrderBy(b => b.StartTime) : q.OrderByDescending(b => b.StartTime)
        };

        var limit = Math.Min(Math.Max(1, query.Limit), 100);
        var page = Math.Max(1, query.Page);
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * limit).Take(limit).ToListAsync();

        return Ok(new PagedResponse<BookingDto>
        {
            Data = items.Select(MapToDto).ToList(),
            Pagination = new PaginationInfo { Page = page, Limit = limit, Total = total, TotalPages = (int)Math.Ceiling((double)total / limit) }
        });
    }

    /// <summary>GET /bookings/{id} — Single booking detail with linked charging session.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetBooking(Guid id)
    {
        var userId = GetCurrentUserId();
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";

        if (role == "ReportingESGViewer") return Forbid();

        var booking = await _db.Bookings
            .Include(b => b.User)
            .Include(b => b.Charger).ThenInclude(c => c.Location)
            .Include(b => b.ChargingSession)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking == null)
            return NotFound(new ApiError { Message = "Booking not found.", Errors = new List<ApiErrorDetail> { new() { Code = "NotFound", Message = "Booking not found." } } });

        // Access check
        var isOwner = booking.UserId == userId;
        var isPrivileged = role is "Admin" or "Security" or "Workplace";
        if (!isOwner && !isPrivileged)
            return NotFound(new ApiError { Message = "Booking not found.", Errors = new List<ApiErrorDetail> { new() { Code = "NotFound", Message = "Booking not found." } } });

        var dto = new BookingDetailDto
        {
            Id = booking.Id,
            UserId = booking.UserId,
            UserDisplayName = booking.User.DisplayName,
            ChargerId = booking.ChargerId,
            ChargerDisplayName = booking.Charger.DisplayName,
            LocationCode = booking.Charger.Location?.Code ?? string.Empty,
            StartTime = booking.StartTime,
            EndTime = booking.EndTime,
            State = booking.State.ToString(),
            VehicleMake = booking.VehicleMake,
            VehicleModel = booking.VehicleModel,
            CsmsIdTag = booking.CsmsIdTag,
            CsmsSyncStatus = booking.CsmsSyncStatus.ToString(),
            ReasonForOverride = booking.ReasonForOverride,
            ActorUserId = booking.ActorUserId,
            CreatedAt = booking.CreatedAt,
            UpdatedAt = booking.UpdatedAt,
            ChargingSession = booking.ChargingSession != null ? new ChargingSessionSummaryDto
            {
                Id = booking.ChargingSession.Id,
                State = booking.ChargingSession.State.ToString(),
                StartTime = booking.ChargingSession.StartTime,
                StopTime = booking.ChargingSession.StopTime,
                EnergyKwh = booking.ChargingSession.EnergyKwh,
                Source = booking.ChargingSession.Source
            } : null
        };

        return Ok(dto);
    }

    /// <summary>POST /bookings — Create a booking.</summary>
    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
    {
        var userId = GetCurrentUserId();
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";

        var (booking, error, statusCode) = await _bookingService.CreateBookingAsync(userId, role, request);

        if (error != null) return StatusCode(statusCode, error);

        return CreatedAtAction(nameof(GetBooking), new { id = booking!.Id }, booking);
    }

    /// <summary>PUT /bookings/{id}/cancel — Cancel a booking.</summary>
    [HttpPut("{id:guid}/cancel")]
    public async Task<IActionResult> CancelBooking(Guid id, [FromBody] CancelBookingRequest request)
    {
        var userId = GetCurrentUserId();
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";

        var (booking, error, statusCode) = await _bookingService.CancelBookingAsync(id, userId, role, request);

        if (error != null) return StatusCode(statusCode, error);
        return Ok(booking);
    }

    /// <summary>PUT /bookings/{id}/release — Release an active booking.</summary>
    [HttpPut("{id:guid}/release")]
    public async Task<IActionResult> ReleaseBooking(Guid id, [FromBody] ReleaseBookingRequest request)
    {
        var userId = GetCurrentUserId();
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";

        var (booking, error, statusCode) = await _bookingService.ReleaseBookingAsync(id, userId, role, request);

        if (error != null) return StatusCode(statusCode, error);
        return Ok(booking);
    }

    /// <summary>PUT /bookings/{id}/override — Admin/Security/Workplace booking override.</summary>
    [HttpPut("{id:guid}/override")]
    [Authorize(Roles = "Admin,Security,Workplace")]
    public async Task<IActionResult> OverrideBooking(Guid id, [FromBody] OverrideBookingRequest request)
    {
        var userId = GetCurrentUserId();
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";

        var (booking, error, statusCode) = await _bookingService.OverrideBookingAsync(id, userId, role, request);

        if (error != null) return StatusCode(statusCode, error);
        return Ok(booking);
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : Guid.Empty;
    }

    private static BookingDto MapToDto(Booking b)
    {
        return new BookingDto
        {
            Id = b.Id,
            UserId = b.UserId,
            UserDisplayName = b.User?.DisplayName ?? string.Empty,
            ChargerId = b.ChargerId,
            ChargerDisplayName = b.Charger?.DisplayName ?? string.Empty,
            LocationCode = b.Charger?.Location?.Code ?? string.Empty,
            StartTime = b.StartTime,
            EndTime = b.EndTime,
            State = b.State.ToString(),
            VehicleMake = b.VehicleMake,
            VehicleModel = b.VehicleModel,
            CsmsIdTag = b.CsmsIdTag,
            CsmsSyncStatus = b.CsmsSyncStatus.ToString(),
            ReasonForOverride = b.ReasonForOverride,
            ActorUserId = b.ActorUserId,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt
        };
    }
}
