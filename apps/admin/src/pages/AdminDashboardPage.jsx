import React, { useState, useEffect } from 'react';
import Header from '../components/organisms/Header';
import StatCard from '../components/molecules/StatCard';
import Button from '../components/atoms/Button';
import api from '../services/api';
import { ShieldCheck, Users, Mail, PhoneCall, Calendar, Activity, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboardPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/admin/health');
        setHealth(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <Header
        eyebrow="SRI SANKARA TV / GOVERNANCE"
        title="Administrative Control Panel"
        subtitle="Channel configuration, staff directory synchronization, Brevo & MSG91 settings, and immutable audit logs."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Active Personnel"
          value={health?.metrics?.totalActiveUsers || '—'}
          subtext="Verified staff accounts"
          icon={Users}
        />
        <StatCard
          title="Production Records"
          value={health?.metrics?.totalShoots || '—'}
          subtext="Series registered"
          icon={Calendar}
        />
        <StatCard
          title="Pending Outbox Jobs"
          value={health?.metrics?.pendingJobs || 0}
          subtext="Ready for dispatch"
          icon={Mail}
        />
        <StatCard
          title="System Health"
          value={health?.status === 'healthy' ? 'Operational' : 'Checking'}
          subtext="Cron & Workers Active"
          icon={Activity}
        />
      </div>

      {/* Quick Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-brand p-6 shadow-brand space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue grid place-items-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-ink text-sm">Staff Directory</h3>
              <p className="text-xs text-slate-400">Bulk CSV & account consent</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Manage employee designations, phone E.164 normalization, and recorded staff consent for automated AI calling.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/staff')}
            className="w-full"
          >
            Manage Team
          </Button>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-brand p-6 shadow-brand space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 grid place-items-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-ink text-sm">Third-Party Integrations</h3>
              <p className="text-xs text-slate-400">MSG91, Brevo & Calendar</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Toggle sandbox simulation, update API auth keys, set official outbound caller IDs, and select Google/Outlook calendars.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/integrations')}
            className="w-full"
          >
            Configure Integrations
          </Button>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-brand p-6 shadow-brand space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-ink text-sm">Audit Trails & Logs</h3>
              <p className="text-xs text-slate-400">Immutable governance</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Track user logins, password modifications, combined CMO approval events, and Accounts delivery receipts.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/audit')}
            className="w-full"
          >
            View Audit Trail
          </Button>
        </div>
      </div>
    </div>
  );
}
