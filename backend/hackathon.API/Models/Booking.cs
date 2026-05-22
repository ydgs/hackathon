namespace hackathon.API.Models;

public class Booking
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid ChargerId { get; set; }
    public Guid? ActorUserId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public BookingState State { get; set; } = BookingState.Pending;
    public string VehicleMake { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public string? CsmsIdTag { get; set; }
    public CsmsSyncStatus CsmsSyncStatus { get; set; } = CsmsSyncStatus.AuthorizationPending;
    public string? ReasonForOverride { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public Charger Charger { get; set; } = null!;
    public User? ActorUser { get; set; }
    public ChargingSession? ChargingSession { get; set; }
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
