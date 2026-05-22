using System.Text.Json;

namespace hackathon.API.Models;

public class Notification
{
    public Guid Id { get; set; }
    public Guid AudienceUserId { get; set; }
    public Guid? LinkedBookingId { get; set; }
    public Guid? LinkedSessionId { get; set; }
    public Guid? LinkedChargerId { get; set; }
    public NotificationTrigger TriggerEvent { get; set; }
    public NotificationChannel Channel { get; set; }
    public NotificationSeverity Severity { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public JsonDocument? Payload { get; set; }
    public NotificationDeliveryStatus DeliveryStatus { get; set; } = NotificationDeliveryStatus.Previewed;
    public bool ReadState { get; set; } = false;
    public string CorrelationId { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public User AudienceUser { get; set; } = null!;
    public Booking? LinkedBooking { get; set; }
    public ChargingSession? LinkedSession { get; set; }
    public Charger? LinkedCharger { get; set; }
}
