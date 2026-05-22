namespace hackathon.API.Models;

public class PrivacyNotice
{
    public Guid Id { get; set; }
    public string Version { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateOnly EffectiveDate { get; set; }
    public bool IsCurrentVersion { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public ICollection<PrivacyAcknowledgement> PrivacyAcknowledgements { get; set; } = new List<PrivacyAcknowledgement>();
}
