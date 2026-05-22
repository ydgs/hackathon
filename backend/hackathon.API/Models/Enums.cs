namespace hackathon.API.Models;

public enum ChargerStatus
{
    Available,
    Reserved,
    Charging,
    BlockedForMaintenance,
    Unavailable,
    Faulted
}

public enum BookingState
{
    Pending,
    Confirmed,
    Active,
    Completed,
    Cancelled,
    Released,
    NoShow,
    Overridden
}

public enum SessionState
{
    NotStarted,
    Authenticating,
    Charging,
    Completed,
    StoppedByUser,
    StoppedByAdmin,
    Faulted,
    Expired
}

public enum CsmsSyncStatus
{
    AuthorizationPending,
    Authorized,
    AuthorizationFailed,
    Revoked
}

public enum UserRole
{
    StandardUser,
    Security,
    Workplace,
    Admin,
    ReportingESGViewer,
    Management
}

public enum EligibilityStatus
{
    Active,
    Inactive,
    Suspended
}

public enum SiteContext
{
    NexTower,
    Nexteracom,
    Both
}

public enum PrivacyAcknowledgementStatus
{
    NotAcknowledged,
    Acknowledged
}

public enum NotificationChannel
{
    InApp,
    Email,
    Teams
}

public enum NotificationSeverity
{
    Info,
    Warning,
    Critical
}

public enum NotificationDeliveryStatus
{
    Sent,
    Previewed,
    Failed
}

public enum NotificationTrigger
{
    BookingConfirmation,
    SessionStartingSoon,
    BookingGracePeriodWarning,
    ChargingSessionEndingSoon,
    ChargingSessionEnded,
    MoveVehiclePrompt,
    SlotReleasePrompt,
    AutoReleaseNoShow,
    AdminSecurityWorkplaceInterventionAlert
}

public enum AuditSource
{
    User,
    Admin,
    System,
    Csms
}
