using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace hackathon.API.Migrations
{
    /// <summary>
    /// Adds:
    /// 1. Partial index on maintenance_blocks(is_active) WHERE is_active = true
    /// 2. Partial index on privacy_notices(is_current_version) WHERE is_current_version = true
    /// 3. Partial index on notifications(audience_user_id, read_state) WHERE read_state = false
    /// 4. PostgreSQL trigger to enforce audit_logs immutability at the database level
    /// </summary>
    public partial class AddPartialIndexesAndAuditTrigger : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Partial index: active maintenance blocks only (fast lookup in booking validation)
            migrationBuilder.Sql(
                @"CREATE INDEX IF NOT EXISTS ix_maintenance_blocks_is_active
                  ON maintenance_blocks (charger_id)
                  WHERE is_active = true;");

            // Partial index: current privacy notice (fast booking gate check)
            migrationBuilder.Sql(
                @"CREATE INDEX IF NOT EXISTS ix_privacy_notices_is_current
                  ON privacy_notices (id)
                  WHERE is_current_version = true;");

            // Partial index: unread notifications per user (fast unread-badge query)
            migrationBuilder.Sql(
                @"CREATE INDEX IF NOT EXISTS ix_notifications_unread
                  ON notifications (audience_user_id)
                  WHERE read_state = false;");

            // PostgreSQL trigger: belt-and-suspenders immutability for audit_logs
            // The EF Core SaveChanges interceptor also throws, but this protects against direct SQL modification.
            migrationBuilder.Sql(
                @"CREATE OR REPLACE FUNCTION fn_audit_logs_immutable()
                  RETURNS trigger AS $$
                  BEGIN
                    RAISE EXCEPTION 'audit_logs is immutable: UPDATE and DELETE are not permitted.';
                    RETURN NULL;
                  END;
                  $$ LANGUAGE plpgsql;");

            migrationBuilder.Sql(
                @"DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON audit_logs;
                  CREATE TRIGGER trg_audit_logs_immutable
                  BEFORE UPDATE OR DELETE ON audit_logs
                  FOR EACH ROW EXECUTE FUNCTION fn_audit_logs_immutable();");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON audit_logs;");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS fn_audit_logs_immutable;");
            migrationBuilder.Sql("DROP INDEX IF EXISTS ix_maintenance_blocks_is_active;");
            migrationBuilder.Sql("DROP INDEX IF EXISTS ix_privacy_notices_is_current;");
            migrationBuilder.Sql("DROP INDEX IF EXISTS ix_notifications_unread;");
        }
    }
}
