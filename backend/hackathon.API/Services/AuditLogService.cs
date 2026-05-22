using hackathon.API.Data;
using hackathon.API.Models;

namespace hackathon.API.Services;

public interface IAuditLogService
{
    Task LogAsync(string actorUserId, string actorRole, string action, string entityType, string entityId,
        string source, string? beforeState = null, string? afterState = null, string? reason = null);
}

public class AuditLogService : IAuditLogService
{
    private readonly AppDbContext _db;

    public AuditLogService(AppDbContext db)
    {
        _db = db;
    }

    public async Task LogAsync(string actorUserId, string actorRole, string action, string entityType,
        string entityId, string source, string? beforeState = null, string? afterState = null, string? reason = null)
    {
        var log = new AuditLog
        {
            Id = Guid.NewGuid(),
            Timestamp = DateTime.UtcNow,
            ActorUserId = actorUserId,
            ActorRole = actorRole,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Source = source,
            BeforeState = beforeState,
            AfterState = afterState,
            Reason = reason
        };

        _db.AuditLogs.Add(log);
        await _db.SaveChangesAsync();
    }
}
