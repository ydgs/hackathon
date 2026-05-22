namespace hackathon.API.Models;

public class AuditLog
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
