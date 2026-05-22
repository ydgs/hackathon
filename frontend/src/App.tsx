import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import { ToastProvider } from './components/ui/ToastProvider';
import { AppShell } from './components/layout/AppShell';
import { AuthLayout } from './components/layout/AuthLayout';
import { RequireAuth, RequireRole, RequirePrivacyAck, RequireEligibility } from './components/guards/RouteGuard';

// Auth pages
import { LoginPage } from './pages/LoginPage';
import { PrivacyPage } from './pages/PrivacyPage';

// Main pages
import { DashboardPage } from './pages/DashboardPage';
import { BookingNewPage } from './pages/BookingNewPage';
import { BookingDetailPage } from './pages/BookingDetailPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

// Operations pages
import { OperationsBookingsPage } from './pages/OperationsBookingsPage';

// Admin pages
import { UsersPage } from './pages/admin/UsersPage';
import { UserFormPage } from './pages/admin/UserFormPage';
import { AuditPage } from './pages/admin/AuditPage';
import { MaintenancePage } from './pages/admin/MaintenancePage';
import { NotificationsAuditPage } from './pages/admin/NotificationsAuditPage';
import { ConfigPage } from './pages/admin/ConfigPage';

function AppProviders({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider();
  return (
    <AuthContext.Provider value={auth}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthContext.Provider>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Auth layout — unauthenticated only */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Route>

      {/* App shell — requires auth */}
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        {/* Standard user + all roles */}
        <Route
          path="/dashboard"
          element={
            <RequirePrivacyAck>
              <DashboardPage />
            </RequirePrivacyAck>
          }
        />

        <Route
          path="/bookings/new"
          element={
            <RequirePrivacyAck>
              <RequireEligibility>
                <BookingNewPage />
              </RequireEligibility>
            </RequirePrivacyAck>
          }
        />

        <Route
          path="/bookings/:id"
          element={
            <RequirePrivacyAck>
              <BookingDetailPage />
            </RequirePrivacyAck>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <RequirePrivacyAck>
              <RequireEligibility>
                <MyBookingsPage />
              </RequireEligibility>
            </RequirePrivacyAck>
          }
        />

        <Route
          path="/notifications"
          element={
            <RequirePrivacyAck>
              <NotificationsPage />
            </RequirePrivacyAck>
          }
        />

        <Route
          path="/profile"
          element={
            <RequirePrivacyAck>
              <ProfilePage />
            </RequirePrivacyAck>
          }
        />

        {/* Reports — Management / Admin / ReportingESGViewer */}
        <Route
          path="/reports"
          element={
            <RequirePrivacyAck>
              <RequireRole roles={['Admin', 'Management', 'ReportingESGViewer', 'Workplace']}>
                <ReportsPage />
              </RequireRole>
            </RequirePrivacyAck>
          }
        />

        {/* Operations — Admin / Security / Workplace */}
        <Route
          path="/operations/bookings"
          element={
            <RequirePrivacyAck>
              <RequireRole roles={['Admin', 'Security', 'Workplace']}>
                <OperationsBookingsPage />
              </RequireRole>
            </RequirePrivacyAck>
          }
        />

        {/* Admin section */}
        <Route
          path="/admin/users"
          element={
            <RequireRole roles={['Admin', 'Workplace']}>
              <UsersPage />
            </RequireRole>
          }
        />

        <Route
          path="/admin/users/new"
          element={
            <RequireRole roles={['Admin']}>
              <UserFormPage />
            </RequireRole>
          }
        />

        <Route
          path="/admin/users/:id/edit"
          element={
            <RequireRole roles={['Admin']}>
              <UserFormPage />
            </RequireRole>
          }
        />

        <Route
          path="/admin/maintenance"
          element={
            <RequireRole roles={['Admin', 'Workplace']}>
              <MaintenancePage />
            </RequireRole>
          }
        />

        <Route
          path="/admin/audit"
          element={
            <RequireRole roles={['Admin']}>
              <AuditPage />
            </RequireRole>
          }
        />

        <Route
          path="/admin/notifications"
          element={
            <RequireRole roles={['Admin']}>
              <NotificationsAuditPage />
            </RequireRole>
          }
        />

        <Route
          path="/admin/config"
          element={
            <RequireRole roles={['Admin']}>
              <ConfigPage />
            </RequireRole>
          }
        />

        {/* 404 catch-all inside app shell */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* 404 outside app shell */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}
