namespace hackathon.API.Models;

public class ChargingSession
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public Guid ChargerId { get; set; }
    public Guid UserId { get; set; }
    public string CsmsSessionId { get; set; } = string.Empty;
    public string? VehicleMake { get; set; }
    public string? VehicleModel { get; set; }
    public SessionState State { get; set; } = SessionState.NotStarted;
    public DateTime? StartTime { get; set; }
    public DateTime? StopTime { get; set; }
    public decimal EnergyKwh { get; set; } = 0;
    public string Source { get; set; } = "CSMS";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Booking Booking { get; set; } = null!;
    public Charger Charger { get; set; } = null!;
    public User User { get; set; } = null!;
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
