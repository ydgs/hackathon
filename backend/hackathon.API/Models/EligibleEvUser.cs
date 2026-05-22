namespace hackathon.API.Models;

public class EligibleEvUser
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string WorkplaceRegistryEid { get; set; } = string.Empty;
    public string BadgeId { get; set; } = string.Empty;
    public EligibilityStatus EligibilityStatus { get; set; } = EligibilityStatus.Active;
    public string? VehicleMake { get; set; }
    public string? VehicleModel { get; set; }
    public SiteContext SiteContext { get; set; } = SiteContext.Both;
    public PrivacyAcknowledgementStatus PrivacyAcknowledgementStatus { get; set; } = PrivacyAcknowledgementStatus.NotAcknowledged;
    public DateTime LastUpdatedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
