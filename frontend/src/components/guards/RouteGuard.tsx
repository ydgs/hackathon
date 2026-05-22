import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types';

interface RequireAuthProps {
  children: React.ReactNode;
}

/** Redirects to /login if the user is not authenticated. */
export function RequireAuth({ children }: RequireAuthProps) {
  const { currentUser } = useAuth();
  const location = useLocation();
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

interface RequireRoleProps {
  roles: UserRole[];
  children: React.ReactNode;
}

/** Redirects to /dashboard if the user's role is not in the allowed list. */
export function RequireRole({ roles, children }: RequireRoleProps) {
  const { currentUser } = useAuth();
  if (!currentUser || !roles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

/** Redirects to /privacy if the user has not acknowledged the current privacy notice. */
export function RequirePrivacyAck({ children }: RequireAuthProps) {
  const { currentUser } = useAuth();
  const location = useLocation();
  if (currentUser && !currentUser.privacy?.hasAcknowledgedCurrentVersion) {
    return (
      <Navigate
        to={`/privacy?returnTo=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }
  return <>{children}</>;
}

/** Redirects to /dashboard with an error state if the user is not eligible. */
export function RequireEligibility({ children }: RequireAuthProps) {
  const { currentUser } = useAuth();
  if (currentUser && !currentUser.eligibility?.isEligible) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
