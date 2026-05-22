using System;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace hackathon.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "audit_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    actor_user_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    actor_role = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    action = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    entity_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    entity_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    before_state = table.Column<string>(type: "text", nullable: true),
                    after_state = table.Column<string>(type: "text", nullable: true),
                    reason = table.Column<string>(type: "text", nullable: true),
                    source = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_audit_logs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "locations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_locations", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "privacy_notices",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    version = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    effective_date = table.Column<DateOnly>(type: "date", nullable: false),
                    is_current_version = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_privacy_notices", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "system_configs",
                columns: table => new
                {
                    key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    value = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_by = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_system_configs", x => x.key);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    display_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    role = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "chargers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    location_id = table.Column<Guid>(type: "uuid", nullable: false),
                    external_station_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    connector_id = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    display_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    last_csms_sync_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_chargers", x => x.id);
                    table.ForeignKey(
                        name: "fk_chargers_locations_location_id",
                        column: x => x.location_id,
                        principalTable: "locations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "eligible_ev_users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    workplace_registry_eid = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    badge_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    eligibility_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    vehicle_make = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    vehicle_model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    site_context = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    privacy_acknowledgement_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    last_updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_eligible_ev_users", x => x.id);
                    table.ForeignKey(
                        name: "fk_eligible_ev_users_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "privacy_acknowledgements",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    privacy_notice_id = table.Column<Guid>(type: "uuid", nullable: false),
                    version = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    acknowledged_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_privacy_acknowledgements", x => x.id);
                    table.ForeignKey(
                        name: "fk_privacy_acknowledgements_privacy_notices_privacy_notice_id",
                        column: x => x.privacy_notice_id,
                        principalTable: "privacy_notices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_privacy_acknowledgements_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "bookings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    charger_id = table.Column<Guid>(type: "uuid", nullable: false),
                    actor_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    state = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    vehicle_make = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    vehicle_model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    csms_id_tag = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    csms_sync_status = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    reason_for_override = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_bookings", x => x.id);
                    table.ForeignKey(
                        name: "fk_bookings_chargers_charger_id",
                        column: x => x.charger_id,
                        principalTable: "chargers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_bookings_users_actor_user_id",
                        column: x => x.actor_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_bookings_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "maintenance_blocks",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    charger_id = table.Column<Guid>(type: "uuid", nullable: false),
                    actor_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reason = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_maintenance_blocks", x => x.id);
                    table.ForeignKey(
                        name: "fk_maintenance_blocks_chargers_charger_id",
                        column: x => x.charger_id,
                        principalTable: "chargers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_maintenance_blocks_users_actor_user_id",
                        column: x => x.actor_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "charging_sessions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    booking_id = table.Column<Guid>(type: "uuid", nullable: false),
                    charger_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    csms_session_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    vehicle_make = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    vehicle_model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    state = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    stop_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    energy_kwh = table.Column<decimal>(type: "numeric(10,4)", nullable: false, defaultValue: 0m),
                    source = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_charging_sessions", x => x.id);
                    table.ForeignKey(
                        name: "fk_charging_sessions_bookings_booking_id",
                        column: x => x.booking_id,
                        principalTable: "bookings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_charging_sessions_chargers_charger_id",
                        column: x => x.charger_id,
                        principalTable: "chargers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_charging_sessions_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    audience_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    linked_booking_id = table.Column<Guid>(type: "uuid", nullable: true),
                    linked_session_id = table.Column<Guid>(type: "uuid", nullable: true),
                    linked_charger_id = table.Column<Guid>(type: "uuid", nullable: true),
                    trigger_event = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    channel = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    severity = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    body = table.Column<string>(type: "text", nullable: false),
                    payload = table.Column<JsonDocument>(type: "jsonb", nullable: true),
                    delivery_status = table.Column<string>(type: "character varying(12)", maxLength: 12, nullable: false),
                    read_state = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    correlation_id = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_notifications", x => x.id);
                    table.ForeignKey(
                        name: "fk_notifications_bookings_linked_booking_id",
                        column: x => x.linked_booking_id,
                        principalTable: "bookings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_notifications_chargers_linked_charger_id",
                        column: x => x.linked_charger_id,
                        principalTable: "chargers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_notifications_charging_sessions_linked_session_id",
                        column: x => x.linked_session_id,
                        principalTable: "charging_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_notifications_users_audience_user_id",
                        column: x => x.audience_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_action",
                table: "audit_logs",
                column: "action");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_actor_user_id",
                table: "audit_logs",
                column: "actor_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_entity_id",
                table: "audit_logs",
                column: "entity_id");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_entity_type",
                table: "audit_logs",
                column: "entity_type");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_timestamp",
                table: "audit_logs",
                column: "timestamp");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_actor_user_id",
                table: "bookings",
                column: "actor_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_charger_id",
                table: "bookings",
                column: "charger_id");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_charger_state_time",
                table: "bookings",
                columns: new[] { "charger_id", "state", "start_time", "end_time" });

            migrationBuilder.CreateIndex(
                name: "ix_bookings_csms_sync_status",
                table: "bookings",
                column: "csms_sync_status");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_start_time",
                table: "bookings",
                column: "start_time");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_state",
                table: "bookings",
                column: "state");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_user_id",
                table: "bookings",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_user_state_day",
                table: "bookings",
                columns: new[] { "user_id", "state", "start_time" });

            migrationBuilder.CreateIndex(
                name: "ix_chargers_location_id",
                table: "chargers",
                column: "location_id");

            migrationBuilder.CreateIndex(
                name: "ix_chargers_status",
                table: "chargers",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "uq_chargers_external_station_id",
                table: "chargers",
                column: "external_station_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_charging_sessions_charger_id",
                table: "charging_sessions",
                column: "charger_id");

            migrationBuilder.CreateIndex(
                name: "ix_charging_sessions_csms_session_id",
                table: "charging_sessions",
                column: "csms_session_id");

            migrationBuilder.CreateIndex(
                name: "ix_charging_sessions_source",
                table: "charging_sessions",
                column: "source");

            migrationBuilder.CreateIndex(
                name: "ix_charging_sessions_start_time",
                table: "charging_sessions",
                column: "start_time");

            migrationBuilder.CreateIndex(
                name: "ix_charging_sessions_state",
                table: "charging_sessions",
                column: "state");

            migrationBuilder.CreateIndex(
                name: "ix_charging_sessions_user_id",
                table: "charging_sessions",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "uq_charging_sessions_booking_id",
                table: "charging_sessions",
                column: "booking_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_eligible_ev_users_eligibility_status",
                table: "eligible_ev_users",
                column: "eligibility_status");

            migrationBuilder.CreateIndex(
                name: "uq_eligible_ev_users_badge_id",
                table: "eligible_ev_users",
                column: "badge_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_eligible_ev_users_eid",
                table: "eligible_ev_users",
                column: "workplace_registry_eid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_eligible_ev_users_user_id",
                table: "eligible_ev_users",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_locations_code",
                table: "locations",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_maintenance_blocks_actor_user_id",
                table: "maintenance_blocks",
                column: "actor_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_maintenance_blocks_charger_id",
                table: "maintenance_blocks",
                column: "charger_id");

            migrationBuilder.CreateIndex(
                name: "ix_maintenance_blocks_time_range",
                table: "maintenance_blocks",
                columns: new[] { "charger_id", "start_time", "end_time" });

            migrationBuilder.CreateIndex(
                name: "ix_notifications_audience_user_id",
                table: "notifications",
                column: "audience_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_channel_status",
                table: "notifications",
                columns: new[] { "channel", "delivery_status" });

            migrationBuilder.CreateIndex(
                name: "ix_notifications_correlation_id",
                table: "notifications",
                column: "correlation_id");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_linked_booking_id",
                table: "notifications",
                column: "linked_booking_id");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_linked_charger_id",
                table: "notifications",
                column: "linked_charger_id");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_linked_session_id",
                table: "notifications",
                column: "linked_session_id");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_read_state",
                table: "notifications",
                columns: new[] { "audience_user_id", "read_state" });

            migrationBuilder.CreateIndex(
                name: "ix_notifications_timestamp",
                table: "notifications",
                column: "timestamp");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_trigger_event",
                table: "notifications",
                column: "trigger_event");

            migrationBuilder.CreateIndex(
                name: "ix_privacy_acknowledgements_privacy_notice_id",
                table: "privacy_acknowledgements",
                column: "privacy_notice_id");

            migrationBuilder.CreateIndex(
                name: "ix_privacy_acks_user_id",
                table: "privacy_acknowledgements",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "uq_privacy_acks_user_notice",
                table: "privacy_acknowledgements",
                columns: new[] { "user_id", "privacy_notice_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_privacy_notices_version",
                table: "privacy_notices",
                column: "version",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_role",
                table: "users",
                column: "role");

            migrationBuilder.CreateIndex(
                name: "uq_users_email",
                table: "users",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "audit_logs");

            migrationBuilder.DropTable(
                name: "eligible_ev_users");

            migrationBuilder.DropTable(
                name: "maintenance_blocks");

            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "privacy_acknowledgements");

            migrationBuilder.DropTable(
                name: "system_configs");

            migrationBuilder.DropTable(
                name: "charging_sessions");

            migrationBuilder.DropTable(
                name: "privacy_notices");

            migrationBuilder.DropTable(
                name: "bookings");

            migrationBuilder.DropTable(
                name: "chargers");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "locations");
        }
    }
}
