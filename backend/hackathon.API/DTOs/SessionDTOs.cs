namespace hackathon.API.DTOs;

public class SessionDto
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public Guid ChargerId { get; set; }
    public string ChargerDisplayName { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserDisplayName { get; set; } = string.Empty;
    public string? VehicleMake { get; set; }
    public string? VehicleModel { get; set; }
    public string State { get; set; } = string.Empty;
    public DateTime? StartTime { get; set; }
    public DateTime? StopTime { get; set; }
    public decimal EnergyKwh { get; set; }
    public string Source { get; set; } = string.Empty;
    public string CsmsSessionId { get; set; } = string.Empty;
}

public class SessionListQuery
{
    public string? State { get; set; }
    public Guid? ChargerId { get; set; }
    public Guid? UserId { get; set; }
    public string? LocationCode { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public string? Source { get; set; }
    public string SortBy { get; set; } = "startTime";
    public string SortOrder { get; set; } = "desc";
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 20;
}
