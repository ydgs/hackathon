namespace hackathon.API.DTOs;

public class BookingDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserDisplayName { get; set; } = string.Empty;
    public Guid ChargerId { get; set; }
    public string ChargerDisplayName { get; set; } = string.Empty;
    public string LocationCode { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string State { get; set; } = string.Empty;
    public string VehicleMake { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public string? CsmsIdTag { get; set; }
    public string CsmsSyncStatus { get; set; } = string.Empty;
    public string? ReasonForOverride { get; set; }
    public Guid? ActorUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class BookingDetailDto : BookingDto
{
    public ChargingSessionSummaryDto? ChargingSession { get; set; }
}

public class ChargingSessionSummaryDto
{
    public Guid Id { get; set; }
    public string State { get; set; } = string.Empty;
    public DateTime? StartTime { get; set; }
    public DateTime? StopTime { get; set; }
    public decimal EnergyKwh { get; set; }
    public string Source { get; set; } = string.Empty;
}

public class CreateBookingRequest
{
    public Guid ChargerId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string VehicleMake { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public Guid? OnBehalfOfUserId { get; set; }
    public string? ReasonForOverride { get; set; }
}

public class CancelBookingRequest
{
    public string? Reason { get; set; }
}

public class ReleaseBookingRequest
{
    public string? Reason { get; set; }
}

public class OverrideBookingRequest
{
    public DateTime NewEndTime { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class BookingListQuery
{
    public string? State { get; set; }
    public Guid? ChargerId { get; set; }
    public Guid? UserId { get; set; }
    public string? LocationCode { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public string? CsmsSyncStatus { get; set; }
    public string SortBy { get; set; } = "startTime";
    public string SortOrder { get; set; } = "desc";
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 20;
}
