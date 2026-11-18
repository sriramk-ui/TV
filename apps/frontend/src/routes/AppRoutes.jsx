import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/templates/AppShell';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import SchedulePage from '../pages/SchedulePage';
import PAFManagementPage from '../pages/PAFManagementPage';
import ApprovalCenterPage from '../pages/ApprovalCenterPage';
import StaffPage from '../pages/StaffPage';
import CallsDashboardPage from '../pages/CallsDashboardPage';
import FinanceSettingsPage from '../pages/FinanceSettingsPage';
import DeliveryLogPage from '../pages/DeliveryLogPage';
import Loader from '../components/atoms/Loader';
import api from '../services/api';

function ProtectedLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  useEffect(() => {
    async function checkPending() {
      if (user?.role === 'cmo') {
        try {
          const res = await api.get('/approvals/pending');
          setPendingApprovalsCount(res.data?.length || 0);
        } catch {}
      }
    }
    if (user) checkPending();
  }, [user]);

  if (loading) {
    return <Loader fullPage message="Authenticating session…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell
      user={user}
      pendingApprovalsCount={pendingApprovalsCount}
      onLogout={async () => {
        await logout();
        navigate('/login');
      }}
    >
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/pafs" element={<PAFManagementPage />} />
        <Route path="/approvals" element={<ApprovalCenterPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/calls" element={<CallsDashboardPage />} />
        <Route path="/finance-settings" element={<FinanceSettingsPage />} />
        <Route path="/logs" element={<DeliveryLogPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
