namespace hackathon.API.DTOs;

public class ReportingQuery
{
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public string? LocationCode { get; set; }
    public Guid? ChargerId { get; set; }
}

public class ReportResponse<T>
{
    public T Data { get; set; } = default!;
    public string? SimulatedDataLabel { get; set; }
    public AppliedFilters AppliedFilters { get; set; } = new();
}

public class AppliedFilters
{
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public string? LocationCode { get; set; }
    public Guid? ChargerId { get; set; }
}

public class SummaryReportData
{
    public int TotalSessions { get; set; }
    public decimal TotalKwh { get; set; }
    public decimal EstimatedCo2SavingsKg { get; set; }
    public decimal EmissionFactorUsed { get; set; }
}

public class SessionsReportData
{
    public int TotalSessions { get; set; }
    public int CompletedCount { get; set; }
    public int CancelledCount { get; set; }
    public int ReleasedCount { get; set; }
    public int NoShowCount { get; set; }
    public decimal AvgDurationMinutes { get; set; }
    public decimal AvgKwh { get; set; }
}

public class EnergyReportData
{
    public decimal TotalKwh { get; set; }
    public decimal AvgKwhPerSession { get; set; }
    public List<HourDistributionEntry> PeakHourDistribution { get; set; } = new();
    public List<ChargerRankingEntry> ChargerRanking { get; set; } = new();
}

public class HourDistributionEntry
{
    public int Hour { get; set; }
    public int SessionCount { get; set; }
}

public class ChargerRankingEntry
{
    public Guid ChargerId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public int SessionCount { get; set; }
    public decimal TotalKwh { get; set; }
}

public class UtilizationReportData
{
    public List<ChargerUtilizationEntry> Chargers { get; set; } = new();
    public Dictionary<string, LocationUtilizationEntry> LocationComparison { get; set; } = new();
}

public class ChargerUtilizationEntry
{
    public Guid ChargerId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public decimal UtilizationPercent { get; set; }
    public int BlockedForMaintenanceMinutes { get; set; }
    public int FaultedEventCount { get; set; }
}

public class LocationUtilizationEntry
{
    public int TotalSessions { get; set; }
    public decimal TotalKwh { get; set; }
    public decimal AvgUtilizationPercent { get; set; }
}

public class SustainabilityReportData
{
    public decimal TotalKwh { get; set; }
    public decimal EstimatedCo2SavingsKg { get; set; }
    public decimal EmissionFactorUsed { get; set; }
    public List<VehicleCategoryEntry> UsageByVehicleCategory { get; set; } = new();
}

public class VehicleCategoryEntry
{
    public string VehicleMake { get; set; } = string.Empty;
    public int UserCount { get; set; }
    public int SessionCount { get; set; }
    public decimal TotalKwh { get; set; }
}
