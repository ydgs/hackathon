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
[Route("api/v1/privacy-notice")]
public class PrivacyController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IAuditLogService _audit;

    public PrivacyController(AppDbContext db, IAuditLogService audit)
    {
        _db = db;
        _audit = audit;
    }

    /// <summary>GET /privacy-notice — Return the current published privacy notice text. No auth required.</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetCurrentNotice()
    {
        var notice = await _db.PrivacyNotices.FirstOrDefaultAsync(p => p.IsCurrentVersion);
        if (notice == null)
            return StatusCode(500, new ApiError { Message = "No privacy notice found.", Errors = new() });

        return Ok(new PrivacyNoticeDto
        {
            Id = notice.Id,
            Version = notice.Version,
            EffectiveDate = notice.EffectiveDate.ToString("yyyy-MM-dd"),
            Content = notice.Content
        });
    }

    /// <summary>POST /privacy-notice/acknowledge — Record current user's acknowledgement.</summary>
    [HttpPost("acknowledge")]
    [Authorize]
    public async Task<IActionResult> Acknowledge([FromBody] AcknowledgePrivacyRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Version))
            return BadRequest(new ApiError
            {
                Message = "Validation failed.",
                Errors = new List<ApiErrorDetail> { new() { Field = "version", Code = "RequiredFieldMissing", Message = "Version is required." } }
            });

        var currentNotice = await _db.PrivacyNotices.FirstOrDefaultAsync(p => p.IsCurrentVersion);
        if (currentNotice == null || currentNotice.Version != request.Version)
            return BadRequest(new ApiError
            {
                Message = "Version mismatch.",
                Errors = new List<ApiErrorDetail> { new() { Field = "version", Code = "VersionMismatch", Message = "Submitted version does not match the current published version." } }
            });

        var userId = GetCurrentUserId();
        if (userId == Guid.Empty) return Unauthorized();

        // Check if already acknowledged
        var existing = await _db.PrivacyAcknowledgements.AnyAsync(
            a => a.UserId == userId && a.PrivacyNoticeId == currentNotice.Id);

        if (existing)
            return Conflict(new ApiError
            {
                Message = "Already acknowledged.",
                Errors = new List<ApiErrorDetail> { new() { Code = "AlreadyAcknowledged", Message = "You have already acknowledged this version of the privacy notice." } }
            });

        var ack = new PrivacyAcknowledgement
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PrivacyNoticeId = currentNotice.Id,
            Version = currentNotice.Version,
            AcknowledgedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.PrivacyAcknowledgements.Add(ack);

        // Update denormalized status on eligible_ev_users
        var eligibleUser = await _db.EligibleEvUsers.FirstOrDefaultAsync(e => e.UserId == userId);
        if (eligibleUser != null)
        {
            eligibleUser.PrivacyAcknowledgementStatus = PrivacyAcknowledgementStatus.Acknowledged;
        }

        await _db.SaveChangesAsync();

        var role = User.FindFirstValue(ClaimTypes.Role) ?? "Unknown";
        await _audit.LogAsync(userId.ToString(), role, "PrivacyAcknowledgementCreated",
            "PrivacyAcknowledgement", ack.Id.ToString(), "User");

        return CreatedAtAction(nameof(GetCurrentNotice), new PrivacyAcknowledgementDto
        {
            Id = ack.Id,
            UserId = ack.UserId,
            Version = ack.Version,
            AcknowledgedAt = ack.AcknowledgedAt
        });
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : Guid.Empty;
    }
}
