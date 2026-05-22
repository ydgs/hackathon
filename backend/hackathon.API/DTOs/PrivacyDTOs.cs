namespace hackathon.API.DTOs;

public class PrivacyNoticeDto
{
    public Guid Id { get; set; }
    public string Version { get; set; } = string.Empty;
    public string EffectiveDate { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}

public class AcknowledgePrivacyRequest
{
    public string Version { get; set; } = string.Empty;
}

public class PrivacyAcknowledgementDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Version { get; set; } = string.Empty;
    public DateTime AcknowledgedAt { get; set; }
}
