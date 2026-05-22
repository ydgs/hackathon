namespace hackathon.API.Models;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public EligibleEvUser? EligibleEvUser { get; set; }
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Booking> ActorBookings { get; set; } = new List<Booking>();
    public ICollection<PrivacyAcknowledgement> PrivacyAcknowledgements { get; set; } = new List<PrivacyAcknowledgement>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<MaintenanceBlock> MaintenanceBlocks { get; set; } = new List<MaintenanceBlock>();
}
