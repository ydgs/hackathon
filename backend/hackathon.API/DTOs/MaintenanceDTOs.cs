namespace hackathon.API.DTOs;

public class MaintenanceBlockDto
{
    public Guid Id { get; set; }
    public Guid ChargerId { get; set; }
    public Guid ActorUserId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string Reason { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateMaintenanceBlockRequest
{
    public Guid ChargerId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string Reason { get; set; } = string.Empty;
    public bool ForceReleaseExistingBookings { get; set; } = false;
}
