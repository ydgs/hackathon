namespace hackathon.API.DTOs;

public class ChargerDto
{
    public Guid Id { get; set; }
    public string ExternalStationId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public int ConnectorId { get; set; }
    public string Status { get; set; } = string.Empty;
    public LocationDto Location { get; set; } = new();
    public DateTime? LastCsmsSyncAt { get; set; }
    public ActiveSessionDto? ActiveSession { get; set; }
}

public class LocationDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}

public class ActiveSessionDto
{
    public Guid Id { get; set; }
    public string UserDisplayName { get; set; } = string.Empty;
    public string VehicleMake { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public DateTime? StartTime { get; set; }
    public decimal EnergyKwh { get; set; }
    public int ElapsedMinutes { get; set; }
}

public class UpdateChargerStatusRequest
{
    public string Status { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}
