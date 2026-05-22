namespace hackathon.API.Models;

public class MaintenanceBlock
{
    public Guid Id { get; set; }
    public Guid ChargerId { get; set; }
    public Guid ActorUserId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string Reason { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Charger Charger { get; set; } = null!;
    public User ActorUser { get; set; } = null!;
}
