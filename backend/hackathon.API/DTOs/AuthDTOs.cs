namespace hackathon.API.DTOs;

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UserSummaryDto User { get; set; } = new();
}

public class UserSummaryDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class MeResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public EligibilityInfo? Eligibility { get; set; }
    public PrivacyInfo? Privacy { get; set; }
}

public class EligibilityInfo
{
    public bool IsEligible { get; set; }
    public string EligibilityStatus { get; set; } = string.Empty;
    public string WorkplaceRegistryEid { get; set; } = string.Empty;
    public string BadgeId { get; set; } = string.Empty;
    public string? VehicleMake { get; set; }
    public string? VehicleModel { get; set; }
    public string SiteContext { get; set; } = string.Empty;
}

public class PrivacyInfo
{
    public bool HasAcknowledgedCurrentVersion { get; set; }
    public string? AcknowledgedVersion { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
}
