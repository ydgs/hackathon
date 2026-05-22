using System.Text.Json;

namespace hackathon.API.DTOs;

public class NotificationDto
{
    public Guid Id { get; set; }
    public string TriggerEvent { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool ReadState { get; set; }
    public Guid? LinkedBookingId { get; set; }
    public Guid? LinkedSessionId { get; set; }
    public Guid? LinkedChargerId { get; set; }
    public DateTime Timestamp { get; set; }
}

public class NotificationAuditDto : NotificationDto
{
    public Guid AudienceUserId { get; set; }
    public string AudienceUserDisplayName { get; set; } = string.Empty;
    public JsonDocument? Payload { get; set; }
    public string DeliveryStatus { get; set; } = string.Empty;
    public string CorrelationId { get; set; } = string.Empty;
}

public class UnreadCountResponse
{
    public int UnreadCount { get; set; }
}

public class NotificationListQuery
{
    public bool? UnreadOnly { get; set; }
    public string? Severity { get; set; }
    public string? TriggerEvent { get; set; }
    public string SortBy { get; set; } = "timestamp";
    public string SortOrder { get; set; } = "desc";
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 20;
}

public class NotificationAuditQuery
{
    public Guid? AudienceUserId { get; set; }
    public string? Channel { get; set; }
    public string? DeliveryStatus { get; set; }
    public string? TriggerEvent { get; set; }
    public string? CorrelationId { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public string SortBy { get; set; } = "timestamp";
    public string SortOrder { get; set; } = "desc";
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 20;
}
