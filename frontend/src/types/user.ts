// User types — field names match api-contract.md §3, §9.3 exactly

export type UserRole =
  | 'StandardUser'
  | 'Security'
  | 'Workplace'
  | 'Admin'
  | 'ReportingESGViewer'
  | 'Management';

export type EligibilityStatus = 'Active' | 'Inactive' | 'Suspended';
export type SiteContext = 'NexTower' | 'Nexteracom' | 'Both';
export type PrivacyAckStatus = 'Acknowledged' | 'NotAcknowledged';

export interface UserEligibility {
  isEligible: boolean;
  eligibilityStatus: EligibilityStatus;
  workplaceRegistryEid: string;
  badgeId: string;
  vehicleMake: string;
  vehicleModel: string;
  siteContext: SiteContext;
}

export interface UserPrivacy {
  hasAcknowledgedCurrentVersion: boolean;
  acknowledgedVersion: string;
  acknowledgedAt: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  eligibility: UserEligibility | null;
  privacy: UserPrivacy | null;
}

export interface EligibleUser {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  workplaceRegistryEid: string;
  badgeId: string;
  eligibilityStatus: EligibilityStatus;
  vehicleMake: string;
  vehicleModel: string;
  siteContext: SiteContext;
  privacyAcknowledgementStatus: PrivacyAckStatus;
  lastUpdatedAt: string;
}

export interface CreateEligibleUserRequest {
  email: string;
  displayName: string;
  role: UserRole;
  workplaceRegistryEid: string;
  badgeId: string;
  eligibilityStatus: EligibilityStatus;
  vehicleMake?: string;
  vehicleModel?: string;
  siteContext: SiteContext;
  password: string;
}

export interface UpdateEligibleUserRequest {
  displayName?: string;
  eligibilityStatus?: EligibilityStatus;
  vehicleMake?: string;
  vehicleModel?: string;
  siteContext?: SiteContext;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    role: UserRole;
  };
}
