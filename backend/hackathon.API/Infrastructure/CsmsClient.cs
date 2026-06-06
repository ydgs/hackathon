using System.Text;
using System.Text.Json;

namespace hackathon.API.Infrastructure;

/// <summary>
/// HTTP client wrapper for the provided NexLevel CSMS REST API.
/// The frontend must NEVER call the CSMS directly — all interactions go through this client.
/// CSMS_BASE_URL is configured via appsettings / environment variable.
/// </summary>
public interface ICsmsClient
{
    Task<bool> AuthorizeTagAsync(string idTag, DateTime validFrom, DateTime validTo);
    Task<bool> RevokeTagAsync(string idTag);
    Task<List<CsmsStation>> GetStationsAsync();
    Task<CsmsStation?> GetStationAsync(string identity);
    Task<List<CsmsConnector>> GetConnectorsAsync(string stationIdentity);
    Task<List<CsmsSession>> GetActiveSessionsAsync();
    Task<List<CsmsSession>> GetSessionsAsync(string? stationId = null, string? idTag = null);
    Task<CsmsSession?> GetSessionAsync(string sessionId);
    Task<bool> BlockConnectorAsync(string stationId, int connectorId);
    Task<bool> UnblockConnectorAsync(string stationId, int connectorId);
    Task<bool> RemoteStartAsync(string stationId, string idTag);
    Task<bool> RemoteStopAsync(string stationId, string transactionId);
}

public class CsmsClient : ICsmsClient
{
    private readonly HttpClient _http;
    private readonly ILogger<CsmsClient> _logger;

    public CsmsClient(HttpClient http, ILogger<CsmsClient> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task<bool> AuthorizeTagAsync(string idTag, DateTime validFrom, DateTime validTo)
    {
        try
        {
            var body = JsonSerializer.Serialize(new
            {
                idTag,
                validFrom = validFrom.ToString("o"),
                validTo = validTo.ToString("o")
            });
            var response = await _http.PostAsync("/api/auth/tags",
                new StringContent(body, Encoding.UTF8, "application/json"));
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "CSMS AuthorizeTag failed for idTag {IdTag}", idTag);
            return false;
        }
    }

    public async Task<bool> RevokeTagAsync(string idTag)
    {
        try
        {
            var response = await _http.DeleteAsync($"/api/auth/tags/{Uri.EscapeDataString(idTag)}");
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "CSMS RevokeTag failed for idTag {IdTag}", idTag);
            return false;
        }
    }

    public async Task<List<CsmsStation>> GetStationsAsync()
    {
        try
        {
            var response = await _http.GetAsync("/api/stations");
            if (!response.IsSuccessStatusCode) return new List<CsmsStation>();
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<List<CsmsStation>>(content, JsonOptions) ?? new List<CsmsStation>();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "CSMS GetStations failed");
            return new List<CsmsStation>();
        }
    }

    public async Task<CsmsStation?> GetStationAsync(string identity)
    {
        try
        {
            var response = await _http.GetAsync($"/api/stations/{Uri.EscapeDataString(identity)}");
            if (!response.IsSuccessStatusCode) return null;
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<CsmsStation>(content, JsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "CSMS GetStation failed for {Identity}", identity);
            return null;
        }
    }

    /// <summary>
    /// Fetches the connector list for a station from the CSMS.
    /// Maps to GET /api/stations/:identity/connectors.
    /// Falls back to GET /api/stations/:identity and extracts connectors if the dedicated endpoint
    /// is unavailable (non-2xx), so the check works against both CSMS versions.
    /// On any exception, returns an empty list — the caller must treat an empty list as
    /// "check skipped" rather than "connector unavailable".
    /// </summary>
    public async Task<List<CsmsConnector>> GetConnectorsAsync(string stationIdentity)
    {
        try
        {
            var response = await _http.GetAsync(
                $"/api/stations/{Uri.EscapeDataString(stationIdentity)}/connectors");

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var connectors = JsonSerializer.Deserialize<List<CsmsConnector>>(content, JsonOptions);
                return connectors ?? new List<CsmsConnector>();
            }

            // Dedicated endpoint not available — fall back to full station response
            _logger.LogWarning(
                "CSMS GET /api/stations/{StationIdentity}/connectors returned {StatusCode}; " +
                "falling back to GetStationAsync to extract connectors.",
                stationIdentity, (int)response.StatusCode);

            var station = await GetStationAsync(stationIdentity);
            return station?.Connectors ?? new List<CsmsConnector>();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "CSMS GetConnectors failed for station {StationIdentity}; " +
                "availability check skipped and booking will proceed.", stationIdentity);
            return new List<CsmsConnector>();
        }
    }

    public async Task<List<CsmsSession>> GetActiveSessionsAsync()
    {
        try
        {
            var response = await _http.GetAsync("/api/sessions/active");
            if (!response.IsSuccessStatusCode) return new List<CsmsSession>();
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<List<CsmsSession>>(content, JsonOptions) ?? new List<CsmsSession>();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "CSMS GetActiveSessions failed");
            return new List<CsmsSession>();
        }
    }

    public async Task<List<CsmsSession>> GetSessionsAsync(string? stationId = null, string? idTag = null)
    {
        try
        {
            var query = new List<string>();
            if (stationId != null) query.Add($"station={Uri.EscapeDataString(stationId)}");
            if (idTag != null) query.Add($"idTag={Uri.EscapeDataString(idTag)}");
            var url = "/api/sessions" + (query.Any() ? "?" + string.Join("&", query) : "");
            var response = await _http.GetAsync(url);
            if (!response.IsSuccessStatusCode) return new List<CsmsSession>();
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<List<CsmsSession>>(content, JsonOptions) ?? new List<CsmsSession>();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "CSMS GetSessions failed");
            return new List<CsmsSession>();
        }
    }

    public async Task<CsmsSession?> GetSessionAsync(string sessionId)
    {
        try
        {
            var response = await _http.GetAsync($"/api/sessions/{Uri.EscapeDataString(sessionId)}");
            if (!response.IsSuccessStatusCode) return null;
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<CsmsSession>(content, JsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "CSMS GetSession failed for {SessionId}", sessionId);
            return null;
        }
    }

    public async Task<bool> BlockConnectorAsync(string stationId, int connectorId)
    {
        try
        {
            var response = await _http.PutAsync(
                $"/api/stations/{Uri.EscapeDataString(stationId)}/connectors/{connectorId}/block",
                new StringContent("{}", Encoding.UTF8, "application/json"));
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "CSMS BlockConnector failed for {StationId}/{ConnectorId}", stationId, connectorId);
            return false;
        }
    }

    public async Task<bool> UnblockConnectorAsync(string stationId, int connectorId)
    {
        try
        {
            var response = await _http.DeleteAsync(
                $"/api/stations/{Uri.EscapeDataString(stationId)}/connectors/{connectorId}/block");
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "CSMS UnblockConnector failed for {StationId}/{ConnectorId}", stationId, connectorId);
            return false;
        }
    }

    public async Task<bool> RemoteStartAsync(string stationId, string idTag)
    {
        try
        {
            var body = JsonSerializer.Serialize(new { idTag });
            var response = await _http.PostAsync(
                $"/api/stations/{Uri.EscapeDataString(stationId)}/remote-start",
                new StringContent(body, Encoding.UTF8, "application/json"));
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "CSMS RemoteStart failed for {StationId}", stationId);
            return false;
        }
    }

    public async Task<bool> RemoteStopAsync(string stationId, string transactionId)
    {
        try
        {
            var body = JsonSerializer.Serialize(new { transactionId });
            var response = await _http.PostAsync(
                $"/api/stations/{Uri.EscapeDataString(stationId)}/remote-stop",
                new StringContent(body, Encoding.UTF8, "application/json"));
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "CSMS RemoteStop failed for {StationId}", stationId);
            return false;
        }
    }

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };
}

/// <summary>
/// No-op CSMS client used when Csms:MockMode = true.
/// All write operations succeed instantly; reads return empty collections.
/// </summary>
public class MockCsmsClient : ICsmsClient
{
    public Task<bool> AuthorizeTagAsync(string idTag, DateTime validFrom, DateTime validTo) => Task.FromResult(true);
    public Task<bool> RevokeTagAsync(string idTag) => Task.FromResult(true);
    public Task<List<CsmsStation>> GetStationsAsync() => Task.FromResult(new List<CsmsStation>());
    public Task<CsmsStation?> GetStationAsync(string identity) => Task.FromResult<CsmsStation?>(null);
    /// <summary>
    /// MockMode: connector availability check is skipped — returns empty list so
    /// BookingService treats the check as not applicable and allows the booking to proceed.
    /// </summary>
    public Task<List<CsmsConnector>> GetConnectorsAsync(string stationIdentity) => Task.FromResult(new List<CsmsConnector>());
    public Task<List<CsmsSession>> GetActiveSessionsAsync() => Task.FromResult(new List<CsmsSession>());
    public Task<List<CsmsSession>> GetSessionsAsync(string? stationId = null, string? idTag = null) => Task.FromResult(new List<CsmsSession>());
    public Task<CsmsSession?> GetSessionAsync(string sessionId) => Task.FromResult<CsmsSession?>(null);
    public Task<bool> BlockConnectorAsync(string stationId, int connectorId) => Task.FromResult(true);
    public Task<bool> UnblockConnectorAsync(string stationId, int connectorId) => Task.FromResult(true);
    public Task<bool> RemoteStartAsync(string stationId, string idTag) => Task.FromResult(true);
    public Task<bool> RemoteStopAsync(string stationId, string transactionId) => Task.FromResult(true);
}

// CSMS response shapes (normalized from NexLevel CSMS REST API)
public class CsmsStation
{
    public string Identity { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public List<CsmsConnector> Connectors { get; set; } = new();
}

public class CsmsConnector
{
    public int ConnectorId { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class CsmsSession
{
    public string Id { get; set; } = string.Empty;
    public string StationIdentity { get; set; } = string.Empty;
    public string IdTag { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? StartTime { get; set; }
    public DateTime? StopTime { get; set; }
    public decimal EnergyWh { get; set; }
    public decimal EnergyKwh => EnergyWh / 1000m;
}
