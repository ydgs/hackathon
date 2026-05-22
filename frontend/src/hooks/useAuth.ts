// MOCK: replace with real JWT + /auth/me call when backend is ready
import { createContext, useContext, useState, useCallback } from 'react';
import type { CurrentUser, UserRole } from '../types';

const STORAGE_KEY = 'nexlevel_user';

// Demo account profiles for quick-select chips
export const DEMO_ACCOUNTS: Array<{
  label: string;
  email: string;
  password: string;
  user: CurrentUser;
}> = [
  {
    label: 'Alice',
    email: 'alice.standard@nexlevel.local',
    password: 'demo-password',
    user: {
      id: 'usr-alice-001',
      email: 'alice.standard@nexlevel.local',
      displayName: 'Alice Standard',
      role: 'StandardUser',
      eligibility: {
        isEligible: true,
        eligibilityStatus: 'Active',
        workplaceRegistryEid: 'EID-00123',
        badgeId: 'BDG-00123',
        vehicleMake: 'Tesla',
        vehicleModel: 'Model 3',
        siteContext: 'Both',
      },
      privacy: {
        hasAcknowledgedCurrentVersion: true,
        acknowledgedVersion: 'v1',
        acknowledgedAt: '2026-05-22T07:55:00Z',
      },
    },
  },
  {
    label: 'Bob',
    email: 'bob.driver@nexlevel.local',
    password: 'demo-password',
    user: {
      id: 'usr-bob-002',
      email: 'bob.driver@nexlevel.local',
      displayName: 'Bob Driver',
      role: 'StandardUser',
      eligibility: {
        isEligible: true,
        eligibilityStatus: 'Active',
        workplaceRegistryEid: 'EID-00456',
        badgeId: 'BDG-00456',
        vehicleMake: 'Renault',
        vehicleModel: 'Zoe',
        siteContext: 'NexTower',
      },
      privacy: {
        hasAcknowledgedCurrentVersion: true,
        acknowledgedVersion: 'v1',
        acknowledgedAt: '2026-05-22T07:58:00Z',
      },
    },
  },
  {
    label: 'Admin',
    email: 'admin@nexlevel.local',
    password: 'demo-password',
    user: {
      id: 'usr-admin-003',
      email: 'admin@nexlevel.local',
      displayName: 'Carol Admin',
      role: 'Admin',
      eligibility: null,
      privacy: {
        hasAcknowledgedCurrentVersion: true,
        acknowledgedVersion: 'v1',
        acknowledgedAt: '2026-05-22T07:00:00Z',
      },
    },
  },
  {
    label: 'Security',
    email: 'security@nexlevel.local',
    password: 'demo-password',
    user: {
      id: 'usr-security-004',
      email: 'security@nexlevel.local',
      displayName: 'Dan Security',
      role: 'Security',
      eligibility: null,
      privacy: {
        hasAcknowledgedCurrentVersion: true,
        acknowledgedVersion: 'v1',
        acknowledgedAt: '2026-05-22T07:00:00Z',
      },
    },
  },
  {
    label: 'New User',
    email: 'new.user@nexlevel.local',
    password: 'demo-password',
    user: {
      id: 'usr-new-005',
      email: 'new.user@nexlevel.local',
      displayName: 'Eve NewUser',
      role: 'StandardUser',
      eligibility: {
        isEligible: true,
        eligibilityStatus: 'Active',
        workplaceRegistryEid: 'EID-00789',
        badgeId: 'BDG-00789',
        vehicleMake: 'Nissan',
        vehicleModel: 'Leaf',
        siteContext: 'NexTower',
      },
      // New user has NOT yet acknowledged privacy notice — demonstrates the privacy gate flow
      privacy: {
        hasAcknowledgedCurrentVersion: false,
        acknowledgedVersion: null,
        acknowledgedAt: null,
      },
    },
  },
];

export interface AuthContextValue {
  currentUser: CurrentUser | null;
  login: (user: CurrentUser) => void;
  logout: () => void;
  acknowledgePrivacy: (version: string, acknowledgedAt: string) => void;
  hasRole: (...roles: UserRole[]) => boolean;
  isAdmin: boolean;
  isSecurity: boolean;
  isWorkplace: boolean;
  isOperator: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function loadUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CurrentUser) : null;
  } catch {
    return null;
  }
}

function saveUser(user: CurrentUser | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function useAuthProvider(): AuthContextValue {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(loadUser);

  const login = useCallback((user: CurrentUser) => {
    saveUser(user);
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    saveUser(null);
    setCurrentUser(null);
  }, []);

  /**
   * Mark the current user as having acknowledged the privacy notice.
   * Updates localStorage and in-memory context so RequirePrivacyAck clears immediately.
   */
  const acknowledgePrivacy = useCallback((version: string, acknowledgedAt: string) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated: CurrentUser = {
        ...prev,
        privacy: {
          hasAcknowledgedCurrentVersion: true,
          acknowledgedVersion: version,
          acknowledgedAt,
        },
      };
      saveUser(updated);
      return updated;
    });
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]): boolean => {
      if (!currentUser) return false;
      return roles.includes(currentUser.role);
    },
    [currentUser],
  );

  const isAdmin = currentUser?.role === 'Admin';
  const isSecurity = currentUser?.role === 'Security';
  const isWorkplace = currentUser?.role === 'Workplace';
  const isOperator = isAdmin || isSecurity || isWorkplace;

  return { currentUser, login, logout, acknowledgePrivacy, hasRole, isAdmin, isSecurity, isWorkplace, isOperator };
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
