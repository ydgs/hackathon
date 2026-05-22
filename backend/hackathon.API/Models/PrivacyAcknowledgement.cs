namespace hackathon.API.Models;

public class PrivacyAcknowledgement
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid PrivacyNoticeId { get; set; }
    public string Version { get; set; } = string.Empty;
    public DateTime AcknowledgedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public PrivacyNotice PrivacyNotice { get; set; } = null!;
}
