namespace hackathon.API.DTOs;

public class AuditLogDto
{
    public Guid Id { get; set; }
    public DateTime Timestamp { get; set; }
    public string ActorUserId { get; set; } = string.Empty;
    public string ActorRole { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string? BeforeState { get; set; }
    public string? AfterState { get; set; }
    public string? Reason { get; set; }
    public string Source { get; set; } = string.Empty;
}

public class AuditLogQuery
{
    public string? ActorUserId { get; set; }
    public string? Action { get; set; }
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
    public string? Source { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public string SortBy { get; set; } = "timestamp";
    public string SortOrder { get; set; } = "desc";
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 20;
}
