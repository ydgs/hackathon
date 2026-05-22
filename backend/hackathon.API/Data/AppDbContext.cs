using hackathon.API.Models;
using Microsoft.EntityFrameworkCore;

namespace hackathon.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Charger> Chargers => Set<Charger>();
    public DbSet<User> Users => Set<User>();
    public DbSet<EligibleEvUser> EligibleEvUsers => Set<EligibleEvUser>();
    public DbSet<PrivacyNotice> PrivacyNotices => Set<PrivacyNotice>();
    public DbSet<PrivacyAcknowledgement> PrivacyAcknowledgements => Set<PrivacyAcknowledgement>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<ChargingSession> ChargingSessions => Set<ChargingSession>();
    public DbSet<MaintenanceBlock> MaintenanceBlocks => Set<MaintenanceBlock>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<SystemConfig> SystemConfigs => Set<SystemConfig>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Location
        modelBuilder.Entity<Location>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.Name).HasMaxLength(100).IsRequired();
            e.Property(x => x.Code).HasMaxLength(20).IsRequired();
            e.HasIndex(x => x.Code).IsUnique().HasDatabaseName("uq_locations_code");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
        });

        // Charger
        modelBuilder.Entity<Charger>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.ExternalStationId).HasMaxLength(100).IsRequired();
            e.HasIndex(x => x.ExternalStationId).IsUnique().HasDatabaseName("uq_chargers_external_station_id");
            e.Property(x => x.ConnectorId).HasDefaultValue(1);
            e.Property(x => x.DisplayName).HasMaxLength(100).IsRequired();
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            e.HasIndex(x => x.LocationId).HasDatabaseName("ix_chargers_location_id");
            e.HasIndex(x => x.Status).HasDatabaseName("ix_chargers_status");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");

            e.HasOne(x => x.Location)
             .WithMany(x => x.Chargers)
             .HasForeignKey(x => x.LocationId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.Email).HasMaxLength(255).IsRequired();
            e.HasIndex(x => x.Email).IsUnique().HasDatabaseName("uq_users_email");
            e.Property(x => x.DisplayName).HasMaxLength(150).IsRequired();
            e.Property(x => x.Role).HasConversion<string>().HasMaxLength(30).IsRequired();
            e.HasIndex(x => x.Role).HasDatabaseName("ix_users_role");
            e.Property(x => x.PasswordHash).HasMaxLength(255).IsRequired();
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
        });

        // EligibleEvUser
        modelBuilder.Entity<EligibleEvUser>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasIndex(x => x.UserId).IsUnique().HasDatabaseName("uq_eligible_ev_users_user_id");
            e.Property(x => x.WorkplaceRegistryEid).HasMaxLength(50).IsRequired();
            e.HasIndex(x => x.WorkplaceRegistryEid).IsUnique().HasDatabaseName("uq_eligible_ev_users_eid");
            e.Property(x => x.BadgeId).HasMaxLength(50).IsRequired();
            e.HasIndex(x => x.BadgeId).IsUnique().HasDatabaseName("uq_eligible_ev_users_badge_id");
            e.Property(x => x.EligibilityStatus).HasConversion<string>().HasMaxLength(20).IsRequired();
            e.HasIndex(x => x.EligibilityStatus).HasDatabaseName("ix_eligible_ev_users_eligibility_status");
            e.Property(x => x.VehicleMake).HasMaxLength(100);
            e.Property(x => x.VehicleModel).HasMaxLength(100);
            e.Property(x => x.SiteContext).HasConversion<string>().HasMaxLength(20).IsRequired();
            e.Property(x => x.PrivacyAcknowledgementStatus).HasConversion<string>().HasMaxLength(20).IsRequired();
            e.Property(x => x.LastUpdatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");

            e.HasOne(x => x.User)
             .WithOne(x => x.EligibleEvUser)
             .HasForeignKey<EligibleEvUser>(x => x.UserId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // PrivacyNotice
        modelBuilder.Entity<PrivacyNotice>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.Version).HasMaxLength(20).IsRequired();
            e.HasIndex(x => x.Version).IsUnique().HasDatabaseName("uq_privacy_notices_version");
            e.Property(x => x.Content).IsRequired();
            e.Property(x => x.IsCurrentVersion).HasDefaultValue(false);
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
        });

        // PrivacyAcknowledgement
        modelBuilder.Entity<PrivacyAcknowledgement>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasIndex(x => new { x.UserId, x.PrivacyNoticeId }).IsUnique().HasDatabaseName("uq_privacy_acks_user_notice");
            e.HasIndex(x => x.UserId).HasDatabaseName("ix_privacy_acks_user_id");
            e.Property(x => x.Version).HasMaxLength(20).IsRequired();
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");

            e.HasOne(x => x.User)
             .WithMany(x => x.PrivacyAcknowledgements)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.PrivacyNotice)
             .WithMany(x => x.PrivacyAcknowledgements)
             .HasForeignKey(x => x.PrivacyNoticeId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Booking
        modelBuilder.Entity<Booking>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.State).HasConversion<string>().HasMaxLength(20).IsRequired();
            e.Property(x => x.VehicleMake).HasMaxLength(100).IsRequired();
            e.Property(x => x.VehicleModel).HasMaxLength(100).IsRequired();
            e.Property(x => x.CsmsIdTag).HasMaxLength(100);
            e.Property(x => x.CsmsSyncStatus).HasConversion<string>().HasMaxLength(25).IsRequired();

            e.HasIndex(x => x.UserId).HasDatabaseName("ix_bookings_user_id");
            e.HasIndex(x => x.ChargerId).HasDatabaseName("ix_bookings_charger_id");
            e.HasIndex(x => x.State).HasDatabaseName("ix_bookings_state");
            e.HasIndex(x => x.StartTime).HasDatabaseName("ix_bookings_start_time");
            e.HasIndex(x => new { x.ChargerId, x.State, x.StartTime, x.EndTime }).HasDatabaseName("ix_bookings_charger_state_time");
            e.HasIndex(x => new { x.UserId, x.State, x.StartTime }).HasDatabaseName("ix_bookings_user_state_day");
            e.HasIndex(x => x.CsmsSyncStatus).HasDatabaseName("ix_bookings_csms_sync_status");

            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");

            e.HasOne(x => x.User)
             .WithMany(x => x.Bookings)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Charger)
             .WithMany(x => x.Bookings)
             .HasForeignKey(x => x.ChargerId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.ActorUser)
             .WithMany(x => x.ActorBookings)
             .HasForeignKey(x => x.ActorUserId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ChargingSession
        modelBuilder.Entity<ChargingSession>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasIndex(x => x.BookingId).IsUnique().HasDatabaseName("uq_charging_sessions_booking_id");
            e.Property(x => x.CsmsSessionId).HasMaxLength(100).IsRequired();
            e.Property(x => x.VehicleMake).HasMaxLength(100);
            e.Property(x => x.VehicleModel).HasMaxLength(100);
            e.Property(x => x.State).HasConversion<string>().HasMaxLength(20).IsRequired();
            e.Property(x => x.EnergyKwh).HasColumnType("numeric(10,4)").HasDefaultValue(0);
            e.Property(x => x.Source).HasMaxLength(20).IsRequired();

            e.HasIndex(x => x.ChargerId).HasDatabaseName("ix_charging_sessions_charger_id");
            e.HasIndex(x => x.State).HasDatabaseName("ix_charging_sessions_state");
            e.HasIndex(x => x.UserId).HasDatabaseName("ix_charging_sessions_user_id");
            e.HasIndex(x => x.Source).HasDatabaseName("ix_charging_sessions_source");
            e.HasIndex(x => x.StartTime).HasDatabaseName("ix_charging_sessions_start_time");
            e.HasIndex(x => x.CsmsSessionId).HasDatabaseName("ix_charging_sessions_csms_session_id");

            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");

            e.HasOne(x => x.Booking)
             .WithOne(x => x.ChargingSession)
             .HasForeignKey<ChargingSession>(x => x.BookingId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Charger)
             .WithMany(x => x.ChargingSessions)
             .HasForeignKey(x => x.ChargerId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.User)
             .WithMany()
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // MaintenanceBlock
        modelBuilder.Entity<MaintenanceBlock>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasIndex(x => x.ChargerId).HasDatabaseName("ix_maintenance_blocks_charger_id");
            e.HasIndex(x => new { x.ChargerId, x.StartTime, x.EndTime }).HasDatabaseName("ix_maintenance_blocks_time_range");
            e.Property(x => x.Reason).IsRequired();
            e.Property(x => x.IsActive).HasDefaultValue(true);
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");

            e.HasOne(x => x.Charger)
             .WithMany(x => x.MaintenanceBlocks)
             .HasForeignKey(x => x.ChargerId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.ActorUser)
             .WithMany(x => x.MaintenanceBlocks)
             .HasForeignKey(x => x.ActorUserId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Notification
        modelBuilder.Entity<Notification>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.TriggerEvent).HasConversion<string>().HasMaxLength(60).IsRequired();
            e.Property(x => x.Channel).HasConversion<string>().HasMaxLength(10).IsRequired();
            e.Property(x => x.Severity).HasConversion<string>().HasMaxLength(10).IsRequired();
            e.Property(x => x.Title).HasMaxLength(255).IsRequired();
            e.Property(x => x.Body).IsRequired();
            e.Property(x => x.Payload).HasColumnType("jsonb");
            e.Property(x => x.DeliveryStatus).HasConversion<string>().HasMaxLength(12).IsRequired();
            e.Property(x => x.ReadState).HasDefaultValue(false);
            e.Property(x => x.CorrelationId).HasMaxLength(36).IsRequired();

            e.HasIndex(x => x.AudienceUserId).HasDatabaseName("ix_notifications_audience_user_id");
            e.HasIndex(x => x.Timestamp).HasDatabaseName("ix_notifications_timestamp");
            e.HasIndex(x => new { x.Channel, x.DeliveryStatus }).HasDatabaseName("ix_notifications_channel_status");
            e.HasIndex(x => new { x.AudienceUserId, x.ReadState }).HasDatabaseName("ix_notifications_read_state");
            e.HasIndex(x => x.CorrelationId).HasDatabaseName("ix_notifications_correlation_id");
            e.HasIndex(x => x.TriggerEvent).HasDatabaseName("ix_notifications_trigger_event");

            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");

            e.HasOne(x => x.AudienceUser)
             .WithMany(x => x.Notifications)
             .HasForeignKey(x => x.AudienceUserId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.LinkedBooking)
             .WithMany(x => x.Notifications)
             .HasForeignKey(x => x.LinkedBookingId)
             .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(x => x.LinkedSession)
             .WithMany(x => x.Notifications)
             .HasForeignKey(x => x.LinkedSessionId)
             .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(x => x.LinkedCharger)
             .WithMany(x => x.Notifications)
             .HasForeignKey(x => x.LinkedChargerId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // AuditLog — no FK navigation, insert-only
        modelBuilder.Entity<AuditLog>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.Timestamp).HasDefaultValueSql("now()");
            e.Property(x => x.ActorUserId).HasMaxLength(100).IsRequired();
            e.Property(x => x.ActorRole).HasMaxLength(30).IsRequired();
            e.Property(x => x.Action).HasMaxLength(80).IsRequired();
            e.Property(x => x.EntityType).HasMaxLength(50).IsRequired();
            e.Property(x => x.EntityId).HasMaxLength(100).IsRequired();
            e.Property(x => x.Source).HasMaxLength(10).IsRequired();

            e.HasIndex(x => x.Timestamp).HasDatabaseName("ix_audit_logs_timestamp");
            e.HasIndex(x => x.ActorUserId).HasDatabaseName("ix_audit_logs_actor_user_id");
            e.HasIndex(x => x.Action).HasDatabaseName("ix_audit_logs_action");
            e.HasIndex(x => x.EntityType).HasDatabaseName("ix_audit_logs_entity_type");
            e.HasIndex(x => x.EntityId).HasDatabaseName("ix_audit_logs_entity_id");
        });

        // SystemConfig — string primary key
        modelBuilder.Entity<SystemConfig>(e =>
        {
            e.HasKey(x => x.Key);
            e.Property(x => x.Key).HasMaxLength(100);
            e.Property(x => x.Value).HasMaxLength(500).IsRequired();
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
        });
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.Entity is Location l) l.UpdatedAt = DateTime.UtcNow;
            else if (entry.Entity is Charger c) c.UpdatedAt = DateTime.UtcNow;
            else if (entry.Entity is User u) u.UpdatedAt = DateTime.UtcNow;
            else if (entry.Entity is EligibleEvUser eu) { eu.UpdatedAt = DateTime.UtcNow; eu.LastUpdatedAt = DateTime.UtcNow; }
            else if (entry.Entity is PrivacyNotice pn) pn.UpdatedAt = DateTime.UtcNow;
            else if (entry.Entity is PrivacyAcknowledgement pa) pa.UpdatedAt = DateTime.UtcNow;
            else if (entry.Entity is Booking b) b.UpdatedAt = DateTime.UtcNow;
            else if (entry.Entity is ChargingSession cs) cs.UpdatedAt = DateTime.UtcNow;
            else if (entry.Entity is MaintenanceBlock mb) mb.UpdatedAt = DateTime.UtcNow;
            else if (entry.Entity is Notification n) n.UpdatedAt = DateTime.UtcNow;
            else if (entry.Entity is SystemConfig sc) sc.UpdatedAt = DateTime.UtcNow;

            // Guard: AuditLog must never be modified
            if (entry.Entity is AuditLog)
                throw new InvalidOperationException("AuditLog entries are immutable and cannot be modified or deleted.");
        }

        // Guard AuditLog deletes too
        var deletedAuditLogs = ChangeTracker.Entries<AuditLog>()
            .Where(e => e.State == EntityState.Deleted);
        if (deletedAuditLogs.Any())
            throw new InvalidOperationException("AuditLog entries are immutable and cannot be deleted.");
    }
}
