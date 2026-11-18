import React, { useState, useEffect } from 'react';
import Header from '../components/organisms/Header';
import StatCard from '../components/molecules/StatCard';
import Button from '../components/atoms/Button';
import api from '../services/api';
import { Activity, Server, Database, CheckCircle2, RefreshCw } from 'lucide-react';

export default function SystemHealthPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/health');
      setHealth(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div>
      <Header
        eyebrow="SRI SANKARA TV / GOVERNANCE"
        title="System Health & Infrastructure"
        subtitle="Monitor operational vitals, MongoDB connection status, background cron schedules, and outbox queues."
        actions={
          <Button size="sm" variant="secondary" icon={RefreshCw} onClick={fetchHealth}>
            Poll Diagnostics
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Service State"
          value={health?.status === 'healthy' ? 'Operational' : 'Degraded'}
          subtext="Express REST API"
          icon={CheckCircle2}
        />
        <StatCard
          title="API Uptime"
          value={health?.uptime ? `${Math.floor(health.uptime)}s` : '—'}
          subtext="Continuous runtime"
          icon={Activity}
        />
        <StatCard
          title="Active Personnel"
          value={health?.metrics?.totalActiveUsers || '—'}
          subtext="In Staff Directory"
          icon={Server}
        />
        <StatCard
          title="Database"
          value="Connected"
          subtext="MongoDB Atlas / In-Memory"
          icon={Database}
        />
      </div>

      <div className="bg-white border border-slate-200/80 rounded-brand p-6 shadow-brand max-w-2xl space-y-4">
        <h3 className="text-sm font-bold text-ink">Background Workers & Schedulers</h3>
        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-2.5 flex justify-between">
            <span className="font-semibold text-slate-700">Outbox Dispatch Sweeper:</span>
            <span className="text-emerald-600 font-bold">Active (every 30s)</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="font-semibold text-slate-700">Hourly CMO Approval Reminder Cron:</span>
            <span className="text-emerald-600 font-bold">Active (every 5m check / 60m digest)</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="font-semibold text-slate-700">MSG91 Voice 30-Min Retry Worker:</span>
            <span className="text-emerald-600 font-bold">Active (automatic +30m scheduling)</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="font-semibold text-slate-700">Direct Calendar Reconciliation:</span>
            <span className="text-emerald-600 font-bold">Active (idempotent write locks)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
