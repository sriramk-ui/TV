import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/templates/AppShell';
import AdminLoginPage from '../pages/AdminLoginPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import StaffDirectoryPage from '../pages/StaffDirectoryPage';
import IntegrationSettingsPage from '../pages/IntegrationSettingsPage';
import FinanceRecipientsPage from '../pages/FinanceRecipientsPage';
import AuditLogPage from '../pages/AuditLogPage';
import SystemHealthPage from '../pages/SystemHealthPage';
import Loader from '../components/atoms/Loader';

function ProtectedAdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <Loader fullPage message="Verifying Administrator authorization…" />;
  }

  if (!user || user.role !== 'cmo') {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell
      user={user}
      onLogout={async () => {
        await logout();
        navigate('/login');
      }}
    >
      <Routes>
        <Route path="/" element={<AdminDashboardPage />} />
        <Route path="/staff" element={<StaffDirectoryPage />} />
        <Route path="/integrations" element={<IntegrationSettingsPage />} />
        <Route path="/finance-recipients" element={<FinanceRecipientsPage />} />
        <Route path="/audit" element={<AuditLogPage />} />
        <Route path="/health" element={<SystemHealthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />
      <Route path="/*" element={<ProtectedAdminLayout />} />
    </Routes>
  );
}
