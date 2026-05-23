import { createContext, useContext, useState, useCallback } from 'react';
import type { CurrentUser, UserRole } from '../types';

const STORAGE_KEY = 'nexlevel_user';

/**
 * Demo account quick-select chips for the login page.
 * Emails and passwords match the backend seed data (DataSeeder.cs).
 * All passwords are: demo1234
 */
export const DEMO_ACCOUNTS: Array<{
  label: string;
  email: string;
  password: string;
}> = [
  { label: 'Alice (User)', email: 'alice@nexlevel.mu', password: 'demo1234' },
  { label: 'Bob (User)', email: 'bob@nexlevel.mu', password: 'demo1234' },
  { label: 'Emma (Admin)', email: 'emma@nexlevel.mu', password: 'demo1234' },
  { label: 'Carol (Security)', email: 'carol@nexlevel.mu', password: 'demo1234' },
  { label: 'Dave (Workplace)', email: 'dave@nexlevel.mu', password: 'demo1234' },
  { label: 'Frank (ESG)', email: 'frank@nexlevel.mu', password: 'demo1234' },
  { label: 'Grace (Management)', email: 'grace@nexlevel.mu', password: 'demo1234' },
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
    localStorage.removeItem('nexlevel_token');
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
