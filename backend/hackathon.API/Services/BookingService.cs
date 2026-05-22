using hackathon.API.Data;
using hackathon.API.DTOs;
using hackathon.API.Infrastructure;
using hackathon.API.Models;
using Microsoft.EntityFrameworkCore;

namespace hackathon.API.Services;

public interface IBookingService
{
    Task<(BookingDto? booking, ApiError? error, int statusCode)> CreateBookingAsync(
        Guid currentUserId, string currentUserRole, CreateBookingRequest request);

    Task<(BookingDto? booking, ApiError? error, int statusCode)> CancelBookingAsync(
        Guid bookingId, Guid currentUserId, string currentUserRole, CancelBookingRequest request);

    Task<(BookingDto? booking, ApiError? error, int statusCode)> ReleaseBookingAsync(
        Guid bookingId, Guid currentUserId, string currentUserRole, ReleaseBookingRequest request);

    Task<(BookingDto? booking, ApiError? error, int statusCode)> OverrideBookingAsync(
        Guid bookingId, Guid currentUserId, string currentUserRole, OverrideBookingRequest request);
}

public class BookingService : IBookingService
{
    private readonly AppDbContext _db;
    private readonly ICsmsClient _csms;
    private readonly IAuditLogService _audit;
    private readonly ILogger<BookingService> _logger;

    public BookingService(AppDbContext db, ICsmsClient csms, IAuditLogService audit, ILogger<BookingService> logger)
    {
        _db = db;
        _csms = csms;
        _audit = audit;
        _logger = logger;
    }

    public async Task<(BookingDto? booking, ApiError? error, int statusCode)> CreateBookingAsync(
        Guid currentUserId, string currentUserRole, CreateBookingRequest request)
    {
        // Determine effective user
        var effectiveUserId = currentUserId;
        Guid? actorUserId = null;

        if (request.OnBehalfOfUserId.HasValue)
        {
            if (currentUserRole != "Workplace" && currentUserRole != "Admin")
                return (null, Error(403, "Forbidden", "Only Workplace and Admin can book on behalf of others."), 403);
            effectiveUserId = request.OnBehalfOfUserId.Value;
            actorUserId = currentUserId;
        }

        // Validation 1: required fields
        var fieldErrors = new List<ApiErrorDetail>();
        if (request.ChargerId == Guid.Empty) fieldErrors.Add(new() { Field = "chargerId", Code = "RequiredFieldMissing", Message = "Charger is required." });
        if (string.IsNullOrWhiteSpace(request.VehicleMake)) fieldErrors.Add(new() { Field = "vehicleMake", Code = "RequiredFieldMissing", Message = "Vehicle make is required." });
        if (string.IsNullOrWhiteSpace(request.VehicleModel)) fieldErrors.Add(new() { Field = "vehicleModel", Code = "RequiredFieldMissing", Message = "Vehicle model is required." });
        if (request.StartTime == default) fieldErrors.Add(new() { Field = "startTime", Code = "RequiredFieldMissing", Message = "Start time is required." });
        if (request.EndTime == default) fieldErrors.Add(new() { Field = "endTime", Code = "RequiredFieldMissing", Message = "End time is required." });
        if (fieldErrors.Any()) return (null, new ApiError { Message = "Validation failed.", Errors = fieldErrors }, 400);

        // Validation 2: time rules
        if (request.EndTime <= request.StartTime)
            return (null, Error(400, "EndTime must be after StartTime.", "InvalidDateRange", "endTime"), 400);

        if (request.StartTime < DateTime.UtcNow.AddMinutes(-1))
            return (null, Error(400, "Start time must be in the future.", "InvalidStartTime", "startTime"), 400);

        // Validation 3: duration check (60 min max for non-admin)
        var durationMinutes = (request.EndTime - request.StartTime).TotalMinutes;
        if (durationMinutes > 60 && currentUserRole != "Admin" && string.IsNullOrWhiteSpace(request.ReasonForOverride))
            return (null, Error(400, "Maximum booking duration is 1 hour per day.", "DurationExceeded", "endTime"), 400);

        // Validation 4: eligibility check
        var eligibleUser = await _db.EligibleEvUsers
            .FirstOrDefaultAsync(e => e.UserId == effectiveUserId && e.EligibilityStatus == EligibilityStatus.Active);
        if (eligibleUser == null)
            return (null, Error(403, "User is not eligible to book a charger.", "NotEligible"), 403);

        // Validation 5: privacy acknowledgement
        if (eligibleUser.PrivacyAcknowledgementStatus == PrivacyAcknowledgementStatus.NotAcknowledged)
            return (null, Error(403, "You must acknowledge the current privacy notice before booking a charger.", "PrivacyNotAcknowledged"), 403);

        // Validation 6: daily cap
        var bookingDate = request.StartTime.Date;
        var existingMinutesToday = await _db.Bookings
            .Where(b => b.UserId == effectiveUserId
                && b.StartTime.Date == bookingDate
                && (b.State == BookingState.Pending || b.State == BookingState.Confirmed || b.State == BookingState.Active))
            .SumAsync(b => (double)(b.EndTime - b.StartTime).TotalMinutes);

        if (existingMinutesToday + durationMinutes > 60 && currentUserRole != "Admin")
        {
            return (null, new ApiError
            {
                Message = "Daily charging limit exceeded.",
                Errors = new List<ApiErrorDetail> {
                    new() { Code = "DailyCapExceeded", Message = $"Daily charging limit (1 hour) exceeded. You have used {existingMinutesToday:F0} minutes today; this booking would add {durationMinutes:F0} minutes." }
                }
            }, 409);
        }

        // Validation 7: no existing active booking
        var hasActiveBooking = await _db.Bookings.AnyAsync(b =>
            b.UserId == effectiveUserId
            && (b.State == BookingState.Pending || b.State == BookingState.Confirmed || b.State == BookingState.Active));

        if (hasActiveBooking && currentUserRole != "Admin")
            return (null, Error(409, "User already has an active booking.", "AlreadyHasActiveBooking"), 409);

        // Validation 8: charger availability and overlap
        var charger = await _db.Chargers.Include(c => c.Location).FirstOrDefaultAsync(c => c.Id == request.ChargerId);
        if (charger == null) return (null, Error(404, "Charger not found.", "NotFound"), 404);

        if (charger.Status == ChargerStatus.BlockedForMaintenance || charger.Status == ChargerStatus.Unavailable || charger.Status == ChargerStatus.Faulted)
            return (null, Error(409, "Charger is not available for booking.", "ChargerUnavailable"), 409);

        var overlap = await _db.Bookings.AnyAsync(b =>
            b.ChargerId == request.ChargerId
            && (b.State == BookingState.Pending || b.State == BookingState.Confirmed || b.State == BookingState.Active)
            && b.StartTime < request.EndTime
            && b.EndTime > request.StartTime);

        if (overlap) return (null, Error(409, "The charger is already booked for this time slot.", "OverlappingBooking"), 409);

        // Validation 9: maintenance block overlap
        var maintenanceConflict = await _db.MaintenanceBlocks.AnyAsync(m =>
            m.ChargerId == request.ChargerId
            && m.IsActive
            && m.StartTime < request.EndTime
            && (m.EndTime == null || m.EndTime > request.StartTime));

        if (maintenanceConflict) return (null, Error(409, "Charger is blocked for maintenance during this window.", "MaintenanceBlockConflict"), 409);

        // Derive CSMS idTag from badgeId + booking prefix
        var idTag = $"{eligibleUser.BadgeId}-{Guid.NewGuid().ToString()[..8].ToUpperInvariant()}";

        // Create booking
        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            UserId = effectiveUserId,
            ChargerId = request.ChargerId,
            ActorUserId = actorUserId,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            State = BookingState.Confirmed,
            VehicleMake = request.VehicleMake,
            VehicleModel = request.VehicleModel,
            CsmsIdTag = idTag,
            CsmsSyncStatus = CsmsSyncStatus.AuthorizationPending,
            ReasonForOverride = request.ReasonForOverride,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Bookings.Add(booking);

        // Update charger status to Reserved if currently Available
        if (charger.Status == ChargerStatus.Available)
        {
            charger.Status = ChargerStatus.Reserved;
        }

        await _db.SaveChangesAsync();

        // Create a placeholder charging session
        var session = new ChargingSession
        {
            Id = Guid.NewGuid(),
            BookingId = booking.Id,
            ChargerId = request.ChargerId,
            UserId = effectiveUserId,
            CsmsSessionId = $"PENDING-{booking.Id.ToString()[..8]}",
            VehicleMake = request.VehicleMake,
            VehicleModel = request.VehicleModel,
            State = SessionState.NotStarted,
            EnergyKwh = 0,
            Source = "CSMS",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.ChargingSessions.Add(session);
        await _db.SaveChangesAsync();

        // Call CSMS authorization
        var csmsSuccess = await _csms.AuthorizeTagAsync(idTag, request.StartTime, request.EndTime);
        booking.CsmsSyncStatus = csmsSuccess ? CsmsSyncStatus.Authorized : CsmsSyncStatus.AuthorizationFailed;
        await _db.SaveChangesAsync();

        // Audit log
        await _audit.LogAsync(
            currentUserId.ToString(), currentUserRole,
            "BookingCreated", "Booking", booking.Id.ToString(), "User");

        var csmsAction = csmsSuccess ? "CsmsAuthorizationSuccess" : "CsmsAuthorizationFailed";
        await _audit.LogAsync("system", "System", csmsAction, "Booking", booking.Id.ToString(), "Csms",
            reason: csmsSuccess ? null : "CSMS authorization call failed");

        var user = await _db.Users.FindAsync(effectiveUserId);

        // US-021/US-022: Send BookingConfirmation in-app notification
        var startLocal = request.StartTime.ToString("HH:mm");
        var endLocal = request.EndTime.ToString("HH:mm");
        var confirmNotification = new Notification
        {
            Id = Guid.NewGuid(),
            AudienceUserId = effectiveUserId,
            TriggerEvent = NotificationTrigger.BookingConfirmation,
            Channel = NotificationChannel.InApp,
            Severity = NotificationSeverity.Info,
            Title = "Booking confirmed",
            Body = $"Your booking at {charger.Location?.Name ?? "the charging station"} ({charger.DisplayName}) is confirmed for {startLocal}–{endLocal}. Vehicle: {request.VehicleMake} {request.VehicleModel}. Your session tag is {idTag}.",
            DeliveryStatus = NotificationDeliveryStatus.Sent,
            ReadState = false,
            CorrelationId = $"booking-confirm-{booking.Id}",
            LinkedBookingId = booking.Id,
            LinkedChargerId = booking.ChargerId,
            Timestamp = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.Notifications.Add(confirmNotification);
        await _db.SaveChangesAsync();

        return (MapToDto(booking, charger, user!), null, 201);
    }

    public async Task<(BookingDto? booking, ApiError? error, int statusCode)> CancelBookingAsync(
        Guid bookingId, Guid currentUserId, string currentUserRole, CancelBookingRequest request)
    {
        var booking = await _db.Bookings
            .Include(b => b.Charger).ThenInclude(c => c.Location)
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null) return (null, Error(404, "Booking not found.", "NotFound"), 404);

        // Access control
        var isOwner = booking.UserId == currentUserId;
        var isAdmin = currentUserRole == "Admin";
        if (!isOwner && !isAdmin) return (null, Error(403, "Forbidden.", "Forbidden"), 403);

        // Reason required if admin cancelling someone else's booking
        if (isAdmin && !isOwner && string.IsNullOrWhiteSpace(request.Reason))
            return (null, Error(400, "Reason is required when cancelling another user's booking.", "ReasonRequired", "reason"), 400);

        // State check
        if (booking.State != BookingState.Pending && booking.State != BookingState.Confirmed)
            return (null, Error(409, "Booking cannot be cancelled in its current state.", "InvalidStateTransition"), 409);

        var beforeState = System.Text.Json.JsonSerializer.Serialize(new { booking.State, booking.CsmsSyncStatus });

        booking.State = BookingState.Cancelled;

        // Revoke CSMS tag
        if (!string.IsNullOrWhiteSpace(booking.CsmsIdTag))
        {
            var revoked = await _csms.RevokeTagAsync(booking.CsmsIdTag);
            booking.CsmsSyncStatus = revoked ? CsmsSyncStatus.Revoked : booking.CsmsSyncStatus;
        }

        // Return charger to Available
        if (booking.Charger.Status == ChargerStatus.Reserved)
            booking.Charger.Status = ChargerStatus.Available;

        await _db.SaveChangesAsync();

        var afterState = System.Text.Json.JsonSerializer.Serialize(new { booking.State, booking.CsmsSyncStatus });
        await _audit.LogAsync(currentUserId.ToString(), currentUserRole, "BookingCancelled", "Booking",
            booking.Id.ToString(), isAdmin ? "Admin" : "User", beforeState, afterState, request.Reason);

        return (MapToDto(booking, booking.Charger, booking.User), null, 200);
    }

    public async Task<(BookingDto? booking, ApiError? error, int statusCode)> ReleaseBookingAsync(
        Guid bookingId, Guid currentUserId, string currentUserRole, ReleaseBookingRequest request)
    {
        var booking = await _db.Bookings
            .Include(b => b.Charger).ThenInclude(c => c.Location)
            .Include(b => b.User)
            .Include(b => b.ChargingSession)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null) return (null, Error(404, "Booking not found.", "NotFound"), 404);

        var isOwner = booking.UserId == currentUserId;
        var isOperator = currentUserRole is "Security" or "Workplace" or "Admin";
        if (!isOwner && !isOperator) return (null, Error(403, "Forbidden.", "Forbidden"), 403);

        if (!isOwner && string.IsNullOrWhiteSpace(request.Reason))
            return (null, Error(400, "Reason is required when releasing another user's booking.", "ReasonRequired", "reason"), 400);

        if (booking.State != BookingState.Active)
            return (null, Error(409, "Only Active bookings can be released.", "InvalidStateTransition"), 409);

        var beforeState = System.Text.Json.JsonSerializer.Serialize(new { booking.State, booking.CsmsSyncStatus });

        booking.State = BookingState.Released;
        if (!isOwner)
        {
            booking.ReasonForOverride = request.Reason;
        }

        // Update linked session
        if (booking.ChargingSession != null)
        {
            booking.ChargingSession.State = isOwner ? SessionState.StoppedByUser : SessionState.StoppedByAdmin;
            booking.ChargingSession.StopTime = DateTime.UtcNow;
        }

        if (!string.IsNullOrWhiteSpace(booking.CsmsIdTag))
        {
            await _csms.RevokeTagAsync(booking.CsmsIdTag);
            booking.CsmsSyncStatus = CsmsSyncStatus.Revoked;
        }

        if (booking.Charger.Status == ChargerStatus.Charging || booking.Charger.Status == ChargerStatus.Reserved)
            booking.Charger.Status = ChargerStatus.Available;

        await _db.SaveChangesAsync();

        var afterState = System.Text.Json.JsonSerializer.Serialize(new { booking.State, booking.CsmsSyncStatus });
        await _audit.LogAsync(currentUserId.ToString(), currentUserRole, "BookingReleased", "Booking",
            booking.Id.ToString(), isOwner ? "User" : "Admin", beforeState, afterState, request.Reason);

        return (MapToDto(booking, booking.Charger, booking.User), null, 200);
    }

    public async Task<(BookingDto? booking, ApiError? error, int statusCode)> OverrideBookingAsync(
        Guid bookingId, Guid currentUserId, string currentUserRole, OverrideBookingRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Reason))
            return (null, Error(400, "Reason is required for override.", "ReasonRequired", "reason"), 400);

        var booking = await _db.Bookings
            .Include(b => b.Charger).ThenInclude(c => c.Location)
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null) return (null, Error(404, "Booking not found.", "NotFound"), 404);

        if (booking.State != BookingState.Confirmed && booking.State != BookingState.Active)
            return (null, Error(409, "Override only allowed on Confirmed or Active bookings.", "InvalidStateTransition"), 409);

        if (request.NewEndTime <= booking.EndTime)
            return (null, Error(400, "New end time must be after the current end time.", "InvalidEndTime", "newEndTime"), 400);

        var beforeState = System.Text.Json.JsonSerializer.Serialize(new { booking.EndTime, booking.State });

        booking.EndTime = request.NewEndTime;
        booking.State = BookingState.Overridden;
        booking.ReasonForOverride = request.Reason;
        booking.ActorUserId = currentUserId;

        await _db.SaveChangesAsync();

        var afterState = System.Text.Json.JsonSerializer.Serialize(new { booking.EndTime, booking.State });
        await _audit.LogAsync(currentUserId.ToString(), currentUserRole, "BookingOverride", "Booking",
            booking.Id.ToString(), "Admin", beforeState, afterState, request.Reason);

        return (MapToDto(booking, booking.Charger, booking.User), null, 200);
    }

    private static BookingDto MapToDto(Booking b, Charger charger, User user)
    {
        return new BookingDto
        {
            Id = b.Id,
            UserId = b.UserId,
            UserDisplayName = user.DisplayName,
            ChargerId = b.ChargerId,
            ChargerDisplayName = charger.DisplayName,
            LocationCode = charger.Location?.Code ?? string.Empty,
            StartTime = b.StartTime,
            EndTime = b.EndTime,
            State = b.State.ToString(),
            VehicleMake = b.VehicleMake,
            VehicleModel = b.VehicleModel,
            CsmsIdTag = b.CsmsIdTag,
            CsmsSyncStatus = b.CsmsSyncStatus.ToString(),
            ReasonForOverride = b.ReasonForOverride,
            ActorUserId = b.ActorUserId,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt
        };
    }

    private static ApiError Error(int _, string message, string code, string? field = null)
    {
        return new ApiError
        {
            Message = message,
            Errors = new List<ApiErrorDetail> { new() { Field = field, Code = code, Message = message } }
        };
    }
}
