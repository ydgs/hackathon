namespace hackathon.API.DTOs;

public class EligibleUserDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string WorkplaceRegistryEid { get; set; } = string.Empty;
    public string BadgeId { get; set; } = string.Empty;
    public string EligibilityStatus { get; set; } = string.Empty;
    public string? VehicleMake { get; set; }
    public string? VehicleModel { get; set; }
    public string SiteContext { get; set; } = string.Empty;
    public string PrivacyAcknowledgementStatus { get; set; } = string.Empty;
    public DateTime LastUpdatedAt { get; set; }
}

public class CreateEligibleUserRequest
{
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string WorkplaceRegistryEid { get; set; } = string.Empty;
    public string BadgeId { get; set; } = string.Empty;
    public string EligibilityStatus { get; set; } = "Active";
    public string? VehicleMake { get; set; }
    public string? VehicleModel { get; set; }
    public string SiteContext { get; set; } = "Both";
    public string Password { get; set; } = string.Empty;
}

public class UpdateEligibleUserRequest
{
    public string? DisplayName { get; set; }
    public string? EligibilityStatus { get; set; }
    public string? VehicleMake { get; set; }
    public string? VehicleModel { get; set; }
    public string? SiteContext { get; set; }
}

public class EligibleUserListQuery
{
    public string? Search { get; set; }
    public string? EligibilityStatus { get; set; }
    public string? SiteContext { get; set; }
    public string SortBy { get; set; } = "displayName";
    public string SortOrder { get; set; } = "asc";
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 20;
}
