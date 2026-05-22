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
[Route("api/v1/eligible-users")]
[Authorize]
public class EligibleUsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IAuditLogService _audit;

    public EligibleUsersController(AppDbContext db, IAuditLogService audit)
    {
        _db = db;
        _audit = audit;
    }

    /// <summary>GET /eligible-users — List eligible EV users.</summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Security,Workplace")]
    public async Task<IActionResult> GetEligibleUsers([FromQuery] EligibleUserListQuery query)
    {
        var q = _db.EligibleEvUsers.Include(e => e.User).AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
            q = q.Where(e => e.User.DisplayName.Contains(query.Search) || e.WorkplaceRegistryEid.Contains(query.Search));

        if (!string.IsNullOrWhiteSpace(query.EligibilityStatus))
        {
            var statuses = query.EligibilityStatus.Split(',').Select(s => s.Trim()).ToList();
            q = q.Where(e => statuses.Contains(e.EligibilityStatus.ToString()));
        }

        if (!string.IsNullOrWhiteSpace(query.SiteContext))
            q = q.Where(e => e.SiteContext.ToString() == query.SiteContext);

        q = query.SortBy.ToLower() switch
        {
            "workplaceregistryeid" => query.SortOrder == "asc" ? q.OrderBy(e => e.WorkplaceRegistryEid) : q.OrderByDescending(e => e.WorkplaceRegistryEid),
            "lastupdatedat" => query.SortOrder == "asc" ? q.OrderBy(e => e.LastUpdatedAt) : q.OrderByDescending(e => e.LastUpdatedAt),
            _ => query.SortOrder == "asc" ? q.OrderBy(e => e.User.DisplayName) : q.OrderByDescending(e => e.User.DisplayName)
        };

        var limit = Math.Min(Math.Max(1, query.Limit), 100);
        var page = Math.Max(1, query.Page);
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * limit).Take(limit).ToListAsync();

        return Ok(new PagedResponse<EligibleUserDto>
        {
            Data = items.Select(MapToDto).ToList(),
            Pagination = new PaginationInfo { Page = page, Limit = limit, Total = total, TotalPages = (int)Math.Ceiling((double)total / limit) }
        });
    }

    /// <summary>GET /eligible-users/{id}</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetEligibleUser(Guid id)
    {
        var userId = GetCurrentUserId();
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";

        var item = await _db.EligibleEvUsers.Include(e => e.User).FirstOrDefaultAsync(e => e.Id == id);
        if (item == null)
            return NotFound(new ApiError { Message = "Eligible user not found.", Errors = new List<ApiErrorDetail> { new() { Code = "NotFound", Message = "Eligible user not found." } } });

        // Self can read own record; Admin/Security/Workplace can read any
        var isSelf = item.UserId == userId;
        var isPrivileged = role is "Admin" or "Security" or "Workplace";
        if (!isSelf && !isPrivileged) return Forbid();

        return Ok(MapToDto(item));
    }

    /// <summary>POST /eligible-users — Create eligible EV user (Admin only).</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateEligibleUser([FromBody] CreateEligibleUserRequest request)
    {
        var errors = new List<ApiErrorDetail>();
        if (string.IsNullOrWhiteSpace(request.Email)) errors.Add(new() { Field = "email", Code = "RequiredFieldMissing", Message = "Email is required." });
        if (string.IsNullOrWhiteSpace(request.DisplayName)) errors.Add(new() { Field = "displayName", Code = "RequiredFieldMissing", Message = "Display name is required." });
        if (string.IsNullOrWhiteSpace(request.WorkplaceRegistryEid)) errors.Add(new() { Field = "workplaceRegistryEid", Code = "RequiredFieldMissing", Message = "EID is required." });
        if (string.IsNullOrWhiteSpace(request.BadgeId)) errors.Add(new() { Field = "badgeId", Code = "RequiredFieldMissing", Message = "Badge ID is required." });
        if (string.IsNullOrWhiteSpace(request.Password)) errors.Add(new() { Field = "password", Code = "RequiredFieldMissing", Message = "Password is required." });
        if (errors.Any()) return BadRequest(new ApiError { Message = "Validation failed.", Errors = errors });

        // Uniqueness checks
        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            return Conflict(new ApiError { Message = "Conflict.", Errors = new List<ApiErrorDetail> { new() { Field = "email", Code = "DuplicateEmail", Message = "Email already exists." } } });

        if (await _db.EligibleEvUsers.AnyAsync(e => e.WorkplaceRegistryEid == request.WorkplaceRegistryEid))
            return Conflict(new ApiError { Message = "Conflict.", Errors = new List<ApiErrorDetail> { new() { Field = "workplaceRegistryEid", Code = "DuplicateEid", Message = "EID already exists." } } });

        if (await _db.EligibleEvUsers.AnyAsync(e => e.BadgeId == request.BadgeId))
            return Conflict(new ApiError { Message = "Conflict.", Errors = new List<ApiErrorDetail> { new() { Field = "badgeId", Code = "DuplicateBadge", Message = "Badge ID already exists." } } });

        if (!Enum.TryParse<UserRole>(request.Role, out var userRole))
            return BadRequest(new ApiError { Message = "Validation failed.", Errors = new List<ApiErrorDetail> { new() { Field = "role", Code = "InvalidEnumValue", Message = "Invalid role value." } } });

        var now = DateTime.UtcNow;
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email.ToLower(),
            DisplayName = request.DisplayName,
            Role = userRole,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            CreatedAt = now,
            UpdatedAt = now
        };
        _db.Users.Add(user);

        Enum.TryParse<EligibilityStatus>(request.EligibilityStatus ?? "Active", out var eligStatus);
        Enum.TryParse<SiteContext>(request.SiteContext ?? "Both", out var siteCtx);

        var eligible = new EligibleEvUser
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            WorkplaceRegistryEid = request.WorkplaceRegistryEid,
            BadgeId = request.BadgeId,
            EligibilityStatus = eligStatus,
            VehicleMake = request.VehicleMake,
            VehicleModel = request.VehicleModel,
            SiteContext = siteCtx,
            PrivacyAcknowledgementStatus = PrivacyAcknowledgementStatus.NotAcknowledged,
            LastUpdatedAt = now,
            CreatedAt = now,
            UpdatedAt = now
        };
        _db.EligibleEvUsers.Add(eligible);
        await _db.SaveChangesAsync();

        var actorId = GetCurrentUserId().ToString();
        var actorRole = User.FindFirstValue(ClaimTypes.Role) ?? "Admin";
        await _audit.LogAsync(actorId, actorRole, "EligibleUserCreated", "EligibleEvUser", eligible.Id.ToString(), "Admin");

        var dto = MapToDto(eligible);
        return CreatedAtAction(nameof(GetEligibleUser), new { id = eligible.Id }, dto);
    }

    /// <summary>PUT /eligible-users/{id} — Update eligible EV user.</summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateEligibleUser(Guid id, [FromBody] UpdateEligibleUserRequest request)
    {
        var userId = GetCurrentUserId();
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";

        var item = await _db.EligibleEvUsers.Include(e => e.User).FirstOrDefaultAsync(e => e.Id == id);
        if (item == null)
            return NotFound(new ApiError { Message = "Eligible user not found.", Errors = new List<ApiErrorDetail> { new() { Code = "NotFound", Message = "Eligible user not found." } } });

        var isSelf = item.UserId == userId;
        var isAdmin = role == "Admin";

        if (!isSelf && !isAdmin) return Forbid();

        // Standard user may only update vehicle fields
        if (!isAdmin && isSelf)
        {
            if (request.DisplayName != null || request.EligibilityStatus != null || request.SiteContext != null)
                return StatusCode(403, new ApiError
                {
                    Message = "Forbidden.",
                    Errors = new List<ApiErrorDetail> { new() { Code = "Forbidden", Message = "Standard users may only update vehicle fields." } }
                });
        }

        if (isAdmin)
        {
            if (request.DisplayName != null) item.User.DisplayName = request.DisplayName;
            if (request.EligibilityStatus != null && Enum.TryParse<EligibilityStatus>(request.EligibilityStatus, out var es)) item.EligibilityStatus = es;
            if (request.SiteContext != null && Enum.TryParse<SiteContext>(request.SiteContext, out var sc)) item.SiteContext = sc;
        }

        if (request.VehicleMake != null) item.VehicleMake = request.VehicleMake;
        if (request.VehicleModel != null) item.VehicleModel = request.VehicleModel;

        await _db.SaveChangesAsync();

        var actorAction = isSelf && !isAdmin ? "VehicleSelfUpdate" : "EligibleUserUpdated";
        await _audit.LogAsync(userId.ToString(), role, actorAction, "EligibleEvUser", item.Id.ToString(), isAdmin ? "Admin" : "User");

        return Ok(MapToDto(item));
    }

    /// <summary>DELETE /eligible-users/{id} — Soft-delete (set Inactive) or hard-delete.</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteEligibleUser(Guid id)
    {
        var item = await _db.EligibleEvUsers.Include(e => e.User).FirstOrDefaultAsync(e => e.Id == id);
        if (item == null)
            return NotFound(new ApiError { Message = "Eligible user not found.", Errors = new List<ApiErrorDetail> { new() { Code = "NotFound", Message = "Eligible user not found." } } });

        // Check for active bookings
        var hasActiveBookings = await _db.Bookings.AnyAsync(b =>
            b.UserId == item.UserId && (b.State == BookingState.Pending || b.State == BookingState.Confirmed || b.State == BookingState.Active));

        if (hasActiveBookings)
            return Conflict(new ApiError { Message = "Cannot delete user with active bookings.", Errors = new List<ApiErrorDetail> { new() { Code = "Conflict", Message = "User has active bookings. Cancel them before deleting." } } });

        // Soft delete — set Inactive
        item.EligibilityStatus = EligibilityStatus.Inactive;
        await _db.SaveChangesAsync();

        var userId = GetCurrentUserId().ToString();
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "Admin";
        await _audit.LogAsync(userId, role, "EligibleUserDeleted", "EligibleEvUser", item.Id.ToString(), "Admin");

        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : Guid.Empty;
    }

    private static EligibleUserDto MapToDto(EligibleEvUser e)
    {
        return new EligibleUserDto
        {
            Id = e.Id,
            UserId = e.UserId,
            DisplayName = e.User?.DisplayName ?? string.Empty,
            Email = e.User?.Email ?? string.Empty,
            WorkplaceRegistryEid = e.WorkplaceRegistryEid,
            BadgeId = e.BadgeId,
            EligibilityStatus = e.EligibilityStatus.ToString(),
            VehicleMake = e.VehicleMake,
            VehicleModel = e.VehicleModel,
            SiteContext = e.SiteContext.ToString(),
            PrivacyAcknowledgementStatus = e.PrivacyAcknowledgementStatus.ToString(),
            LastUpdatedAt = e.LastUpdatedAt
        };
    }
}
