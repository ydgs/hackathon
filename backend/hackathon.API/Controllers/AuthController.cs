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
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITokenService _tokenService;
    private readonly IAuditLogService _audit;

    public AuthController(AppDbContext db, ITokenService tokenService, IAuditLogService audit)
    {
        _db = db;
        _tokenService = tokenService;
        _audit = audit;
    }

    /// <summary>POST /auth/login — Authenticate a seeded user and issue a JWT.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new ApiError
            {
                Message = "Validation failed.",
                Errors = new List<ApiErrorDetail>
                {
                    new() { Field = "email", Code = "RequiredFieldMissing", Message = "Email is required." }
                }
            });
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email.ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new ApiError
            {
                Message = "Invalid email or password.",
                Errors = new List<ApiErrorDetail>
                {
                    new() { Code = "Unauthenticated", Message = "Invalid email or password." }
                }
            });
        }

        var (token, expiresAt) = _tokenService.GenerateToken(user);

        return Ok(new LoginResponse
        {
            Token = token,
            ExpiresAt = expiresAt,
            User = new UserSummaryDto
            {
                Id = user.Id,
                Email = user.Email,
                DisplayName = user.DisplayName,
                Role = user.Role.ToString()
            }
        });
    }

    /// <summary>POST /auth/logout — Audit-log a logout event. Token discard is client-side.</summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? "unknown";
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "Unknown";

        await _audit.LogAsync(userId, role, "UserLogout", "User", userId, "User");

        return NoContent();
    }

    /// <summary>GET /auth/me — Resolve the current user from the JWT.</summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var user = await _db.Users
            .Include(u => u.EligibleEvUser)
            .Include(u => u.PrivacyAcknowledgements)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return Unauthorized();

        var currentNotice = await _db.PrivacyNotices.FirstOrDefaultAsync(p => p.IsCurrentVersion);

        bool hasAcknowledged = false;
        string? ackVersion = null;
        DateTime? ackAt = null;

        if (currentNotice != null)
        {
            var ack = await _db.PrivacyAcknowledgements
                .Where(a => a.UserId == userId && a.PrivacyNoticeId == currentNotice.Id)
                .OrderByDescending(a => a.AcknowledgedAt)
                .FirstOrDefaultAsync();

            if (ack != null)
            {
                hasAcknowledged = true;
                ackVersion = ack.Version;
                ackAt = ack.AcknowledgedAt;
            }
        }

        EligibilityInfo? eligibility = null;
        if (user.EligibleEvUser != null)
        {
            eligibility = new EligibilityInfo
            {
                IsEligible = user.EligibleEvUser.EligibilityStatus == EligibilityStatus.Active,
                EligibilityStatus = user.EligibleEvUser.EligibilityStatus.ToString(),
                WorkplaceRegistryEid = user.EligibleEvUser.WorkplaceRegistryEid,
                BadgeId = user.EligibleEvUser.BadgeId,
                VehicleMake = user.EligibleEvUser.VehicleMake,
                VehicleModel = user.EligibleEvUser.VehicleModel,
                SiteContext = user.EligibleEvUser.SiteContext.ToString()
            };
        }

        return Ok(new MeResponse
        {
            Id = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Role = user.Role.ToString(),
            Eligibility = eligibility,
            Privacy = new PrivacyInfo
            {
                HasAcknowledgedCurrentVersion = hasAcknowledged,
                AcknowledgedVersion = ackVersion,
                AcknowledgedAt = ackAt
            }
        });
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : Guid.Empty;
    }

}
