namespace hackathon.API.Models;

public class Charger
{
    public Guid Id { get; set; }
    public Guid LocationId { get; set; }
    public string ExternalStationId { get; set; } = string.Empty;
    public int ConnectorId { get; set; } = 1;
    public string DisplayName { get; set; } = string.Empty;
    public ChargerStatus Status { get; set; } = ChargerStatus.Available;
    public DateTime? LastCsmsSyncAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Location Location { get; set; } = null!;
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<ChargingSession> ChargingSessions { get; set; } = new List<ChargingSession>();
    public ICollection<MaintenanceBlock> MaintenanceBlocks { get; set; } = new List<MaintenanceBlock>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
