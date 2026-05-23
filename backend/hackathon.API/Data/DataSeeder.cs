using hackathon.API.Models;
using Microsoft.EntityFrameworkCore;

namespace hackathon.API.Data;

public static class DataSeeder
{
    // Fixed GUIDs for predictable seed data
    private static readonly Guid LocationNexTowerId = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000001");
    private static readonly Guid LocationNexteracomId = Guid.Parse("b2c3d4e5-0002-0002-0002-000000000002");

    private static readonly Guid ChargerNT1Id = Guid.Parse("c1000001-0001-0001-0001-000000000001");
    private static readonly Guid ChargerNT2Id = Guid.Parse("c1000002-0001-0001-0001-000000000002");
    private static readonly Guid ChargerNT3Id = Guid.Parse("c1000003-0001-0001-0001-000000000003");
    private static readonly Guid ChargerNT4Id = Guid.Parse("c1000004-0001-0001-0001-000000000004");
    private static readonly Guid ChargerNC1Id = Guid.Parse("c2000001-0002-0002-0002-000000000001");
    private static readonly Guid ChargerNC2Id = Guid.Parse("c2000002-0002-0002-0002-000000000002");
    private static readonly Guid ChargerNC3Id = Guid.Parse("c2000003-0002-0002-0002-000000000003");
    private static readonly Guid ChargerNC4Id = Guid.Parse("c2000004-0002-0002-0002-000000000004");

    private static readonly Guid UserAliceId = Guid.Parse("90000001-0001-0001-0001-000000000001");
    private static readonly Guid UserBobId = Guid.Parse("90000002-0002-0002-0002-000000000002");
    private static readonly Guid UserCarolId = Guid.Parse("90000003-0003-0003-0003-000000000003");
    private static readonly Guid UserDaveId = Guid.Parse("90000004-0004-0004-0004-000000000004");
    private static readonly Guid UserEmmaId = Guid.Parse("90000005-0005-0005-0005-000000000005");
    private static readonly Guid UserFrankId = Guid.Parse("90000006-0006-0006-0006-000000000006");
    private static readonly Guid UserGraceId = Guid.Parse("90000007-0007-0007-0007-000000000007");

    private static readonly Guid EligibleAliceId = Guid.Parse("e0000001-0001-0001-0001-000000000001");
    private static readonly Guid EligibleBobId = Guid.Parse("e0000002-0002-0002-0002-000000000002");
    private static readonly Guid EligibleSuspendedId = Guid.Parse("e0000003-0003-0003-0003-000000000003");
    private static readonly Guid EligibleInactiveId = Guid.Parse("e0000004-0004-0004-0004-000000000004");

    private static readonly Guid PrivacyNoticeV1Id = Guid.Parse("f0000001-0001-0001-0001-000000000001");
    private static readonly Guid PrivacyAckAliceId = Guid.Parse("fa000001-0001-0001-0001-000000000001");

    private static readonly Guid BookingAliceConfirmedId = Guid.Parse("b0000001-0001-0001-0001-000000000001");
    private static readonly Guid BookingAliceActiveId = Guid.Parse("b0000002-0002-0002-0002-000000000002");
    private static readonly Guid BookingAliceCompletedId = Guid.Parse("b0000003-0003-0003-0003-000000000003");
    private static readonly Guid BookingBobCancelledId = Guid.Parse("b0000004-0004-0004-0004-000000000004");
    private static readonly Guid BookingAliceNoShowId = Guid.Parse("b0000005-0005-0005-0005-000000000005");

    private static readonly Guid SessionAliceConfirmedId = Guid.Parse("50000001-0001-0001-0001-000000000001");
    private static readonly Guid SessionAliceActiveId = Guid.Parse("50000002-0002-0002-0002-000000000002");
    private static readonly Guid SessionAliceCompletedId = Guid.Parse("50000003-0003-0003-0003-000000000003");
    private static readonly Guid SessionAliceNoShowId = Guid.Parse("50000005-0005-0005-0005-000000000005");

    private static readonly Guid MaintenanceBlockId = Guid.Parse("d0000001-0001-0001-0001-000000000001");

    public static async Task SeedAsync(AppDbContext db)
    {
        await SeedLocationsAsync(db);
        await SeedChargersAsync(db);
        await SeedUsersAsync(db);
        await SeedEligibleEvUsersAsync(db);
        await SeedPrivacyNoticesAsync(db);
        await SeedPrivacyAcknowledgementsAsync(db);
        await SeedBookingsAsync(db);
        await SeedChargingSessionsAsync(db);
        await SeedMaintenanceBlocksAsync(db);
        await SeedNotificationsAsync(db);
        await SeedAuditLogsAsync(db);
        await SeedSystemConfigsAsync(db);
        await db.SaveChangesAsync();
    }

    private static async Task SeedLocationsAsync(AppDbContext db)
    {
        if (await db.Locations.AnyAsync()) return;

        db.Locations.AddRange(
            new Location { Id = LocationNexTowerId, Name = "NEX Tower", Code = "NEX-TOWER", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Location { Id = LocationNexteracomId, Name = "NEXTERACOM", Code = "NEXTERACOM", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );
    }

    private static async Task SeedChargersAsync(AppDbContext db)
    {
        if (await db.Chargers.AnyAsync()) return;

        db.Chargers.AddRange(
            new Charger { Id = ChargerNT1Id, LocationId = LocationNexTowerId, ExternalStationId = "CP-NEX-001", ConnectorId = 1, DisplayName = "NEX Tower Charger 1", Status = ChargerStatus.Available, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Charger { Id = ChargerNT2Id, LocationId = LocationNexTowerId, ExternalStationId = "NEX-TOWER-CH-02", ConnectorId = 1, DisplayName = "NEX Tower Charger 2", Status = ChargerStatus.Reserved, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Charger { Id = ChargerNT3Id, LocationId = LocationNexTowerId, ExternalStationId = "CP-NEX-002", ConnectorId = 1, DisplayName = "NEX Tower Charger 3", Status = ChargerStatus.Charging, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Charger { Id = ChargerNT4Id, LocationId = LocationNexTowerId, ExternalStationId = "NEX-TOWER-CH-04", ConnectorId = 1, DisplayName = "NEX Tower Charger 4", Status = ChargerStatus.BlockedForMaintenance, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Charger { Id = ChargerNC1Id, LocationId = LocationNexteracomId, ExternalStationId = "NEXTERACOM-CH-01", ConnectorId = 1, DisplayName = "NEXTERACOM Charger 1", Status = ChargerStatus.Available, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Charger { Id = ChargerNC2Id, LocationId = LocationNexteracomId, ExternalStationId = "NEXTERACOM-CH-02", ConnectorId = 1, DisplayName = "NEXTERACOM Charger 2", Status = ChargerStatus.Available, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Charger { Id = ChargerNC3Id, LocationId = LocationNexteracomId, ExternalStationId = "NEXTERACOM-CH-03", ConnectorId = 1, DisplayName = "NEXTERACOM Charger 3", Status = ChargerStatus.Unavailable, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Charger { Id = ChargerNC4Id, LocationId = LocationNexteracomId, ExternalStationId = "NEXTERACOM-CH-04", ConnectorId = 1, DisplayName = "NEXTERACOM Charger 4", Status = ChargerStatus.Faulted, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );
    }

    private static async Task SeedUsersAsync(AppDbContext db)
    {
        if (await db.Users.AnyAsync()) return;

        var passwordHash = BCrypt.Net.BCrypt.HashPassword("demo1234");

        db.Users.AddRange(
            new User { Id = UserAliceId, Email = "alice@nexlevel.mu", DisplayName = "Alice Martin", Role = UserRole.StandardUser, PasswordHash = passwordHash, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new User { Id = UserBobId, Email = "bob@nexlevel.mu", DisplayName = "Bob Koenig", Role = UserRole.StandardUser, PasswordHash = passwordHash, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new User { Id = UserCarolId, Email = "carol@nexlevel.mu", DisplayName = "Carol Security", Role = UserRole.Security, PasswordHash = passwordHash, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new User { Id = UserDaveId, Email = "dave@nexlevel.mu", DisplayName = "Dave Workplace", Role = UserRole.Workplace, PasswordHash = passwordHash, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new User { Id = UserEmmaId, Email = "emma@nexlevel.mu", DisplayName = "Emma Admin", Role = UserRole.Admin, PasswordHash = passwordHash, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new User { Id = UserFrankId, Email = "frank@nexlevel.mu", DisplayName = "Frank ESG", Role = UserRole.ReportingESGViewer, PasswordHash = passwordHash, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new User { Id = UserGraceId, Email = "grace@nexlevel.mu", DisplayName = "Grace Management", Role = UserRole.Management, PasswordHash = passwordHash, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );
    }

    private static async Task SeedEligibleEvUsersAsync(AppDbContext db)
    {
        if (await db.EligibleEvUsers.AnyAsync()) return;

        var now = DateTime.UtcNow;
        db.EligibleEvUsers.AddRange(
            new EligibleEvUser
            {
                Id = EligibleAliceId,
                UserId = UserAliceId,
                WorkplaceRegistryEid = "EID-001",
                BadgeId = "BADGE-001",
                EligibilityStatus = EligibilityStatus.Active,
                VehicleMake = "Tesla",
                VehicleModel = "Model 3",
                SiteContext = SiteContext.Both,
                PrivacyAcknowledgementStatus = PrivacyAcknowledgementStatus.Acknowledged,
                LastUpdatedAt = now, CreatedAt = now, UpdatedAt = now
            },
            new EligibleEvUser
            {
                Id = EligibleBobId,
                UserId = UserBobId,
                WorkplaceRegistryEid = "EID-002",
                BadgeId = "BADGE-002",
                EligibilityStatus = EligibilityStatus.Active,
                VehicleMake = "Nissan",
                VehicleModel = "Leaf",
                SiteContext = SiteContext.Both,
                PrivacyAcknowledgementStatus = PrivacyAcknowledgementStatus.NotAcknowledged,
                LastUpdatedAt = now, CreatedAt = now, UpdatedAt = now
            },
            new EligibleEvUser
            {
                Id = EligibleSuspendedId,
                UserId = UserCarolId,
                WorkplaceRegistryEid = "EID-003",
                BadgeId = "BADGE-003",
                EligibilityStatus = EligibilityStatus.Suspended,
                VehicleMake = "Renault",
                VehicleModel = "Zoe",
                SiteContext = SiteContext.NexTower,
                PrivacyAcknowledgementStatus = PrivacyAcknowledgementStatus.Acknowledged,
                LastUpdatedAt = now, CreatedAt = now, UpdatedAt = now
            },
            new EligibleEvUser
            {
                Id = EligibleInactiveId,
                UserId = UserDaveId,
                WorkplaceRegistryEid = "EID-004",
                BadgeId = "BADGE-004",
                EligibilityStatus = EligibilityStatus.Inactive,
                VehicleMake = "Peugeot",
                VehicleModel = "e-208",
                SiteContext = SiteContext.Nexteracom,
                PrivacyAcknowledgementStatus = PrivacyAcknowledgementStatus.NotAcknowledged,
                LastUpdatedAt = now, CreatedAt = now, UpdatedAt = now
            }
        );
    }

    private static async Task SeedPrivacyNoticesAsync(AppDbContext db)
    {
        if (await db.PrivacyNotices.AnyAsync()) return;

        db.PrivacyNotices.Add(new PrivacyNotice
        {
            Id = PrivacyNoticeV1Id,
            Version = "v1",
            Content = "## Privacy Notice — NEXLevel EV Charging Platform\n\nThis notice explains how NEXLevel stores and uses your personal data for EV charging access, operational tracking, reporting, and sustainability purposes.\n\n### What data we store\n- Your name and email address\n- Your Employee ID (EID) and badge identifier\n- Your vehicle make and model\n- Your booking and charging session history\n- Energy consumption data per session\n- Parking slot usage where applicable\n\n### Why we store it\nWe store this data to:\n- Manage fair access to EV charging stations\n- Enforce the one-hour-per-user-per-day charging limit\n- Track energy consumption for sustainability reporting\n- Provide audit trails for governance and compliance\n- Generate ESG-ready sustainability metrics\n\n### Who can access it\n- You can view your own bookings and session history\n- Security and Workplace teams can view operational booking data\n- Admins can access all data for management and reporting\n- ESG/Reporting stakeholders can view aggregated energy data\n\n### Data retention\nBooking and session data is retained for 12 months for audit and sustainability reporting purposes.\n\nBy acknowledging this notice, you consent to the collection and use of your data as described above.",
            EffectiveDate = new DateOnly(2026, 5, 22),
            IsCurrentVersion = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
    }

    private static async Task SeedPrivacyAcknowledgementsAsync(AppDbContext db)
    {
        if (await db.PrivacyAcknowledgements.AnyAsync()) return;

        db.PrivacyAcknowledgements.Add(new PrivacyAcknowledgement
        {
            Id = PrivacyAckAliceId,
            UserId = UserAliceId,
            PrivacyNoticeId = PrivacyNoticeV1Id,
            Version = "v1",
            AcknowledgedAt = DateTime.UtcNow.AddDays(-1),
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        });
    }

    private static async Task SeedBookingsAsync(AppDbContext db)
    {
        if (await db.Bookings.AnyAsync()) return;

        var today = DateTime.UtcNow.Date;
        var yesterday = today.AddDays(-1);
        var threeDaysAgo = today.AddDays(-3);

        db.Bookings.AddRange(
            // Alice: confirmed upcoming booking
            new Booking
            {
                Id = BookingAliceConfirmedId,
                UserId = UserAliceId,
                ChargerId = ChargerNT2Id,
                StartTime = today.AddHours(9),
                EndTime = today.AddHours(10),
                State = BookingState.Confirmed,
                VehicleMake = "Tesla",
                VehicleModel = "Model 3",
                CsmsIdTag = "BADGE-001-" + BookingAliceConfirmedId.ToString()[..8],
                CsmsSyncStatus = CsmsSyncStatus.Authorized,
                CreatedAt = today.AddHours(8.5),
                UpdatedAt = today.AddHours(8.5)
            },
            // Alice: active booking right now
            new Booking
            {
                Id = BookingAliceActiveId,
                UserId = UserAliceId,
                ChargerId = ChargerNT3Id,
                StartTime = today.AddHours(8),
                EndTime = today.AddHours(9),
                State = BookingState.Active,
                VehicleMake = "Tesla",
                VehicleModel = "Model 3",
                CsmsIdTag = "BADGE-001-" + BookingAliceActiveId.ToString()[..8],
                CsmsSyncStatus = CsmsSyncStatus.Authorized,
                CreatedAt = today.AddHours(7.5),
                UpdatedAt = today.AddHours(8)
            },
            // Alice: completed booking (acted on by carol)
            new Booking
            {
                Id = BookingAliceCompletedId,
                UserId = UserAliceId,
                ChargerId = ChargerNC1Id,
                ActorUserId = UserCarolId,
                StartTime = yesterday.AddHours(14),
                EndTime = yesterday.AddHours(15),
                State = BookingState.Completed,
                VehicleMake = "Tesla",
                VehicleModel = "Model 3",
                CsmsIdTag = "BADGE-001-" + BookingAliceCompletedId.ToString()[..8],
                CsmsSyncStatus = CsmsSyncStatus.Revoked,
                CreatedAt = yesterday.AddHours(13.5),
                UpdatedAt = yesterday.AddHours(15)
            },
            // Bob: cancelled booking
            new Booking
            {
                Id = BookingBobCancelledId,
                UserId = UserBobId,
                ChargerId = ChargerNT1Id,
                StartTime = today.AddHours(11),
                EndTime = today.AddHours(12),
                State = BookingState.Cancelled,
                VehicleMake = "Nissan",
                VehicleModel = "Leaf",
                CsmsIdTag = "BADGE-002-" + BookingBobCancelledId.ToString()[..8],
                CsmsSyncStatus = CsmsSyncStatus.Revoked,
                CreatedAt = today.AddHours(6),
                UpdatedAt = today.AddHours(7)
            },
            // Alice: no-show booking
            new Booking
            {
                Id = BookingAliceNoShowId,
                UserId = UserAliceId,
                ChargerId = ChargerNC2Id,
                StartTime = threeDaysAgo.AddHours(10),
                EndTime = threeDaysAgo.AddHours(11),
                State = BookingState.NoShow,
                VehicleMake = "Tesla",
                VehicleModel = "Model 3",
                CsmsIdTag = "BADGE-001-" + BookingAliceNoShowId.ToString()[..8],
                CsmsSyncStatus = CsmsSyncStatus.Revoked,
                CreatedAt = threeDaysAgo.AddHours(9),
                UpdatedAt = threeDaysAgo.AddHours(10.25)
            }
        );
    }

    private static async Task SeedChargingSessionsAsync(AppDbContext db)
    {
        if (await db.ChargingSessions.AnyAsync()) return;

        var today = DateTime.UtcNow.Date;
        var yesterday = today.AddDays(-1);
        var threeDaysAgo = today.AddDays(-3);

        // Explicit seeded sessions
        db.ChargingSessions.AddRange(
            new ChargingSession
            {
                Id = SessionAliceConfirmedId,
                BookingId = BookingAliceConfirmedId,
                ChargerId = ChargerNT2Id,
                UserId = UserAliceId,
                CsmsSessionId = "CSMS-SIM-001",
                VehicleMake = "Tesla",
                VehicleModel = "Model 3",
                State = SessionState.NotStarted,
                EnergyKwh = 0,
                Source = "CSMS-Simulator",
                CreatedAt = today.AddHours(8.5),
                UpdatedAt = today.AddHours(8.5)
            },
            new ChargingSession
            {
                Id = SessionAliceActiveId,
                BookingId = BookingAliceActiveId,
                ChargerId = ChargerNT3Id,
                UserId = UserAliceId,
                CsmsSessionId = "CSMS-SIM-002",
                VehicleMake = "Tesla",
                VehicleModel = "Model 3",
                State = SessionState.Charging,
                StartTime = today.AddHours(8).AddMinutes(5),
                EnergyKwh = 3.25m,
                Source = "CSMS-Simulator",
                CreatedAt = today.AddHours(8.5),
                UpdatedAt = today.AddHours(8.5)
            },
            new ChargingSession
            {
                Id = SessionAliceCompletedId,
                BookingId = BookingAliceCompletedId,
                ChargerId = ChargerNC1Id,
                UserId = UserAliceId,
                CsmsSessionId = "CSMS-SIM-003",
                VehicleMake = "Tesla",
                VehicleModel = "Model 3",
                State = SessionState.Completed,
                StartTime = yesterday.AddHours(14).AddMinutes(2),
                StopTime = yesterday.AddHours(15),
                EnergyKwh = 8.75m,
                Source = "CSMS-Simulator",
                CreatedAt = yesterday.AddHours(14),
                UpdatedAt = yesterday.AddHours(15)
            },
            new ChargingSession
            {
                Id = SessionAliceNoShowId,
                BookingId = BookingAliceNoShowId,
                ChargerId = ChargerNC2Id,
                UserId = UserAliceId,
                CsmsSessionId = "CSMS-SIM-004",
                VehicleMake = "Tesla",
                VehicleModel = "Model 3",
                State = SessionState.Expired,
                EnergyKwh = 0,
                Source = "CSMS-Simulator",
                CreatedAt = threeDaysAgo.AddHours(10),
                UpdatedAt = threeDaysAgo.AddHours(10.25)
            }
        );

        // Generate 46 additional historical sessions for AI insights (total 50+)
        var rng = new Random(42); // Fixed seed for deterministic demo data
        var chargerIds = new[] { ChargerNT1Id, ChargerNT2Id, ChargerNT3Id, ChargerNC1Id, ChargerNC2Id };
        var userIds = new[] { UserAliceId, UserBobId };
        var vehiclePairs = new[] { ("Tesla", "Model 3"), ("Nissan", "Leaf"), ("Renault", "Zoe"), ("Peugeot", "e-208") };

        var historicalBookingIds = new List<Guid>();
        var historicalBookings = new List<Booking>();
        var historicalSessions = new List<ChargingSession>();

        for (int i = 0; i < 46; i++)
        {
            var daysAgo = rng.Next(1, 8);
            var hourOffset = rng.Next(7, 18);
            var startTime = DateTime.UtcNow.Date.AddDays(-daysAgo).AddHours(hourOffset);
            var endTime = startTime.AddHours(1);
            var energyKwh = Math.Round((decimal)(rng.NextDouble() * 10 + 2), 4); // 2.0 - 12.0 kWh
            var charger = chargerIds[rng.Next(chargerIds.Length)];
            var user = userIds[rng.Next(userIds.Length)];
            var vehicle = vehiclePairs[rng.Next(vehiclePairs.Length)];

            var bookingId = Guid.NewGuid();
            var sessionId = Guid.NewGuid();

            historicalBookingIds.Add(bookingId);
            historicalBookings.Add(new Booking
            {
                Id = bookingId,
                UserId = user,
                ChargerId = charger,
                StartTime = startTime,
                EndTime = endTime,
                State = BookingState.Completed,
                VehicleMake = vehicle.Item1,
                VehicleModel = vehicle.Item2,
                CsmsIdTag = $"HIST-TAG-{i:D3}",
                CsmsSyncStatus = CsmsSyncStatus.Revoked,
                CreatedAt = startTime.AddMinutes(-30),
                UpdatedAt = endTime
            });

            historicalSessions.Add(new ChargingSession
            {
                Id = sessionId,
                BookingId = bookingId,
                ChargerId = charger,
                UserId = user,
                CsmsSessionId = $"CSMS-HIST-{i + 5:D3}",
                VehicleMake = vehicle.Item1,
                VehicleModel = vehicle.Item2,
                State = SessionState.Completed,
                StartTime = startTime.AddMinutes(2),
                StopTime = endTime,
                EnergyKwh = energyKwh,
                Source = "CSMS-Simulator",
                CreatedAt = startTime,
                UpdatedAt = endTime
            });
        }

        db.Bookings.AddRange(historicalBookings);
        db.ChargingSessions.AddRange(historicalSessions);
    }

    private static async Task SeedMaintenanceBlocksAsync(AppDbContext db)
    {
        if (await db.MaintenanceBlocks.AnyAsync()) return;

        var today = DateTime.UtcNow.Date;
        db.MaintenanceBlocks.Add(new MaintenanceBlock
        {
            Id = MaintenanceBlockId,
            ChargerId = ChargerNT4Id,
            ActorUserId = UserEmmaId,
            StartTime = today.AddHours(7),
            EndTime = today.AddHours(13),
            Reason = "Firmware update",
            IsActive = true,
            CreatedAt = today.AddHours(7),
            UpdatedAt = today.AddHours(7)
        });
    }

    private static async Task SeedNotificationsAsync(AppDbContext db)
    {
        if (await db.Notifications.AnyAsync()) return;

        var correlationId = "CORR-001";
        var timestamp = DateTime.UtcNow.AddHours(-1);

        // In-app notification for Alice's confirmed booking
        db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            AudienceUserId = UserAliceId,
            LinkedBookingId = BookingAliceConfirmedId,
            LinkedChargerId = ChargerNT2Id,
            TriggerEvent = NotificationTrigger.BookingConfirmation,
            Channel = NotificationChannel.InApp,
            Severity = NotificationSeverity.Info,
            Title = "Booking confirmed",
            Body = "Your booking on NEX Tower Charger 2 is confirmed for 09:00-10:00 (Tesla Model 3).",
            DeliveryStatus = NotificationDeliveryStatus.Sent,
            ReadState = false,
            CorrelationId = correlationId,
            Timestamp = timestamp,
            CreatedAt = timestamp,
            UpdatedAt = timestamp
        });

        // Email preview notification
        var emailPayload = System.Text.Json.JsonDocument.Parse(
            """{"to":"alice@nexlevel.mu","subject":"Booking Confirmed — NEX Tower Charger 2","htmlBody":"<p>Your EV charging booking is confirmed.</p><p>Charger: NEX Tower Charger 2<br/>Date: Today<br/>Time: 09:00 - 10:00<br/>Vehicle: Tesla Model 3</p>","textBody":"Your booking on NEX Tower Charger 2 is confirmed for 09:00-10:00. Vehicle: Tesla Model 3."}"""
        );
        db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            AudienceUserId = UserAliceId,
            LinkedBookingId = BookingAliceConfirmedId,
            LinkedChargerId = ChargerNT2Id,
            TriggerEvent = NotificationTrigger.BookingConfirmation,
            Channel = NotificationChannel.Email,
            Severity = NotificationSeverity.Info,
            Title = "Booking confirmed",
            Body = "Your booking on NEX Tower Charger 2 is confirmed for 09:00-10:00 (Tesla Model 3).",
            Payload = emailPayload,
            DeliveryStatus = NotificationDeliveryStatus.Previewed,
            ReadState = false,
            CorrelationId = correlationId,
            Timestamp = timestamp,
            CreatedAt = timestamp,
            UpdatedAt = timestamp
        });

        // Teams Adaptive Card preview
        var teamsPayload = System.Text.Json.JsonDocument.Parse(
            """{"type":"AdaptiveCard","version":"1.5","body":[{"type":"TextBlock","size":"Medium","weight":"Bolder","text":"EV Charging Booking Confirmed"},{"type":"FactSet","facts":[{"title":"Charger","value":"NEX Tower Charger 2"},{"title":"Time","value":"09:00 - 10:00"},{"title":"Vehicle","value":"Tesla Model 3"}]}]}"""
        );
        db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            AudienceUserId = UserAliceId,
            LinkedBookingId = BookingAliceConfirmedId,
            LinkedChargerId = ChargerNT2Id,
            TriggerEvent = NotificationTrigger.BookingConfirmation,
            Channel = NotificationChannel.Teams,
            Severity = NotificationSeverity.Info,
            Title = "Booking confirmed",
            Body = "Your booking on NEX Tower Charger 2 is confirmed for 09:00-10:00 (Tesla Model 3).",
            Payload = teamsPayload,
            DeliveryStatus = NotificationDeliveryStatus.Previewed,
            ReadState = false,
            CorrelationId = correlationId,
            Timestamp = timestamp,
            CreatedAt = timestamp,
            UpdatedAt = timestamp
        });

        // Session starting soon notification
        db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            AudienceUserId = UserAliceId,
            LinkedBookingId = BookingAliceActiveId,
            LinkedChargerId = ChargerNT3Id,
            TriggerEvent = NotificationTrigger.SessionStartingSoon,
            Channel = NotificationChannel.InApp,
            Severity = NotificationSeverity.Warning,
            Title = "Charging session starting soon",
            Body = "Your charging session at NEX Tower Charger 3 starts in 10 minutes.",
            DeliveryStatus = NotificationDeliveryStatus.Sent,
            ReadState = true,
            CorrelationId = "CORR-002",
            Timestamp = DateTime.UtcNow.AddHours(-2),
            CreatedAt = DateTime.UtcNow.AddHours(-2),
            UpdatedAt = DateTime.UtcNow.AddHours(-2)
        });
    }

    private static async Task SeedAuditLogsAsync(AppDbContext db)
    {
        if (await db.AuditLogs.AnyAsync()) return;

        var today = DateTime.UtcNow.Date;

        db.AuditLogs.AddRange(
            new AuditLog
            {
                Id = Guid.NewGuid(),
                Timestamp = today.AddHours(7),
                ActorUserId = UserEmmaId.ToString(),
                ActorRole = "Admin",
                Action = "MaintenanceBlockCreated",
                EntityType = "MaintenanceBlock",
                EntityId = MaintenanceBlockId.ToString(),
                Reason = "firmware update",
                Source = "Admin"
            },
            new AuditLog
            {
                Id = Guid.NewGuid(),
                Timestamp = today.AddHours(7).AddMinutes(1),
                ActorUserId = "system",
                ActorRole = "System",
                Action = "CsmsConnectorBlocked",
                EntityType = "Charger",
                EntityId = ChargerNT4Id.ToString(),
                Source = "System"
            },
            new AuditLog
            {
                Id = Guid.NewGuid(),
                Timestamp = today.AddHours(8.5),
                ActorUserId = UserAliceId.ToString(),
                ActorRole = "StandardUser",
                Action = "BookingCreated",
                EntityType = "Booking",
                EntityId = BookingAliceConfirmedId.ToString(),
                Source = "User"
            },
            new AuditLog
            {
                Id = Guid.NewGuid(),
                Timestamp = today.AddHours(8.5).AddMinutes(1),
                ActorUserId = "system",
                ActorRole = "System",
                Action = "CsmsAuthorizationSuccess",
                EntityType = "Booking",
                EntityId = BookingAliceConfirmedId.ToString(),
                Source = "Csms"
            },
            new AuditLog
            {
                Id = Guid.NewGuid(),
                Timestamp = today.AddHours(8.5).AddMinutes(2),
                ActorUserId = UserAliceId.ToString(),
                ActorRole = "StandardUser",
                Action = "PrivacyAcknowledgementCreated",
                EntityType = "PrivacyAcknowledgement",
                EntityId = PrivacyAckAliceId.ToString(),
                Source = "User"
            }
        );
    }

    private static async Task SeedSystemConfigsAsync(AppDbContext db)
    {
        if (await db.SystemConfigs.AnyAsync()) return;

        var now = DateTime.UtcNow;
        db.SystemConfigs.AddRange(
            new SystemConfig { Key = "GRACE_PERIOD_MINUTES", Value = "15", UpdatedAt = now },
            new SystemConfig { Key = "PRE_SESSION_REMINDER_MINUTES", Value = "10", UpdatedAt = now },
            new SystemConfig { Key = "SESSION_ENDING_REMINDER_MINUTES", Value = "10", UpdatedAt = now },
            new SystemConfig { Key = "GRACE_PERIOD_WARNING_OFFSET_MINUTES", Value = "5", UpdatedAt = now },
            new SystemConfig { Key = "NO_SHOW_THRESHOLD_COUNT", Value = "2", UpdatedAt = now },
            new SystemConfig { Key = "NO_SHOW_THRESHOLD_DAYS", Value = "7", UpdatedAt = now },
            new SystemConfig { Key = "DAILY_CAP_MINUTES", Value = "60", UpdatedAt = now },
            new SystemConfig { Key = "EMISSION_FACTOR_KG_PER_KWH", Value = "0.85", UpdatedAt = now },
            new SystemConfig { Key = "CSMS_POLLING_INTERVAL_SECONDS", Value = "5", UpdatedAt = now }
        );
    }
}
