using hackathon.API.Data;
using hackathon.API.DTOs;
using hackathon.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace hackathon.API.Controllers;

[ApiController]
[Route("api/v1/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public NotificationsController(AppDbContext db) => _db = db;

    /// <summary>GET /notifications — Current user's in-app notification feed.</summary>
    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] NotificationListQuery query)
    {
        var userId = GetCurrentUserId();

        var q = _db.Notifications
            .Where(n => n.AudienceUserId == userId && n.Channel == NotificationChannel.InApp)
            .AsQueryable();

        if (query.UnreadOnly == true) q = q.Where(n => !n.ReadState);
        if (!string.IsNullOrWhiteSpace(query.Severity)) q = q.Where(n => n.Severity.ToString() == query.Severity);
        if (!string.IsNullOrWhiteSpace(query.TriggerEvent)) q = q.Where(n => n.TriggerEvent.ToString() == query.TriggerEvent);

        q = query.SortOrder == "asc" ? q.OrderBy(n => n.Timestamp) : q.OrderByDescending(n => n.Timestamp);

        var limit = Math.Min(Math.Max(1, query.Limit), 100);
        var page = Math.Max(1, query.Page);
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * limit).Take(limit).ToListAsync();

        return Ok(new PagedResponse<NotificationDto>
        {
            Data = items.Select(MapToDto).ToList(),
            Pagination = new PaginationInfo { Page = page, Limit = limit, Total = total, TotalPages = (int)Math.Ceiling((double)total / limit) }
        });
    }

    /// <summary>GET /notifications/unread-count</summary>
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = GetCurrentUserId();
        var count = await _db.Notifications.CountAsync(n =>
            n.AudienceUserId == userId && n.Channel == NotificationChannel.InApp && !n.ReadState);

        return Ok(new UnreadCountResponse { UnreadCount = count });
    }

    /// <summary>PUT /notifications/{id}/read</summary>
    [HttpPut("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id)
    {
        var userId = GetCurrentUserId();
        var notification = await _db.Notifications.FirstOrDefaultAsync(n => n.Id == id);

        if (notification == null)
            return NotFound(new ApiError { Message = "Notification not found.", Errors = new List<ApiErrorDetail> { new() { Code = "NotFound", Message = "Notification not found." } } });

        if (notification.AudienceUserId != userId)
            return StatusCode(403, new ApiError { Message = "Forbidden.", Errors = new List<ApiErrorDetail> { new() { Code = "Forbidden", Message = "You can only mark your own notifications as read." } } });

        notification.ReadState = true;
        await _db.SaveChangesAsync();

        return Ok(MapToDto(notification));
    }

    /// <summary>GET /notifications/audit — Admin/operational view across all channels.</summary>
    [HttpGet("audit")]
    [Authorize(Roles = "Admin,Security,Workplace")]
    public async Task<IActionResult> GetAuditNotifications([FromQuery] NotificationAuditQuery query)
    {
        var q = _db.Notifications.Include(n => n.AudienceUser).AsQueryable();

        if (query.AudienceUserId.HasValue) q = q.Where(n => n.AudienceUserId == query.AudienceUserId.Value);

        if (!string.IsNullOrWhiteSpace(query.Channel))
        {
            var channels = query.Channel.Split(',').ToList();
            q = q.Where(n => channels.Contains(n.Channel.ToString()));
        }

        if (!string.IsNullOrWhiteSpace(query.DeliveryStatus))
            q = q.Where(n => n.DeliveryStatus.ToString() == query.DeliveryStatus);

        if (!string.IsNullOrWhiteSpace(query.TriggerEvent))
        {
            var events = query.TriggerEvent.Split(',').ToList();
            q = q.Where(n => events.Contains(n.TriggerEvent.ToString()));
        }

        if (!string.IsNullOrWhiteSpace(query.CorrelationId)) q = q.Where(n => n.CorrelationId == query.CorrelationId);
        if (query.DateFrom.HasValue) q = q.Where(n => n.Timestamp >= query.DateFrom.Value);
        if (query.DateTo.HasValue) q = q.Where(n => n.Timestamp < query.DateTo.Value);

        q = query.SortOrder == "asc" ? q.OrderBy(n => n.Timestamp) : q.OrderByDescending(n => n.Timestamp);

        var limit = Math.Min(Math.Max(1, query.Limit), 100);
        var page = Math.Max(1, query.Page);
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * limit).Take(limit).ToListAsync();

        return Ok(new PagedResponse<NotificationAuditDto>
        {
            Data = items.Select(n => new NotificationAuditDto
            {
                Id = n.Id,
                AudienceUserId = n.AudienceUserId,
                AudienceUserDisplayName = n.AudienceUser?.DisplayName ?? string.Empty,
                TriggerEvent = n.TriggerEvent.ToString(),
                Channel = n.Channel.ToString(),
                Severity = n.Severity.ToString(),
                Title = n.Title,
                Body = n.Body,
                Payload = n.Payload,
                DeliveryStatus = n.DeliveryStatus.ToString(),
                ReadState = n.ReadState,
                CorrelationId = n.CorrelationId,
                LinkedBookingId = n.LinkedBookingId,
                LinkedSessionId = n.LinkedSessionId,
                LinkedChargerId = n.LinkedChargerId,
                Timestamp = n.Timestamp
            }).ToList(),
            Pagination = new PaginationInfo { Page = page, Limit = limit, Total = total, TotalPages = (int)Math.Ceiling((double)total / limit) }
        });
    }

    private Guid GetCurrentUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var id) ? id : Guid.Empty;
    }

    private static NotificationDto MapToDto(Notification n) => new()
    {
        Id = n.Id,
        TriggerEvent = n.TriggerEvent.ToString(),
        Channel = n.Channel.ToString(),
        Severity = n.Severity.ToString(),
        Title = n.Title,
        Body = n.Body,
        ReadState = n.ReadState,
        LinkedBookingId = n.LinkedBookingId,
        LinkedSessionId = n.LinkedSessionId,
        LinkedChargerId = n.LinkedChargerId,
        Timestamp = n.Timestamp
    };
}
