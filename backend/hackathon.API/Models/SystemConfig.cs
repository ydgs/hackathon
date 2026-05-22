namespace hackathon.API.Models;

public class SystemConfig
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
}
