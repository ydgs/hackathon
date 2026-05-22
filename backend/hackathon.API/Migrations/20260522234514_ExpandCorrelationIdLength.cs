using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace hackathon.API.Migrations
{
    /// <inheritdoc />
    public partial class ExpandCorrelationIdLength : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Expand correlation_id from varchar(36) to varchar(100) to support composite correlation keys
            // e.g. "reminder-start-{bookingId}", "booking-confirm-{bookingId}", "noshow-autorelease-{bookingId}"
            migrationBuilder.AlterColumn<string>(
                name: "correlation_id",
                table: "notifications",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(36)",
                oldMaxLength: 36);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "correlation_id",
                table: "notifications",
                type: "character varying(36)",
                maxLength: 36,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);
        }
    }
}
