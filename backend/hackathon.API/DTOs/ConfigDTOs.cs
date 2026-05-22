namespace hackathon.API.DTOs;

public class SystemConfigDto
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
}

public class UpdateConfigRequest
{
    public List<ConfigUpdateEntry> Updates { get; set; } = new();
}

public class ConfigUpdateEntry
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
