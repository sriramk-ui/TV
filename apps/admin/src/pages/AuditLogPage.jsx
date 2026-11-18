import React, { useState, useEffect } from 'react';
import Header from '../components/organisms/Header';
import DataTable from '../components/organisms/DataTable';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import api from '../services/api';
import { RotateCcw } from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'created_at',
      render: (row) => (
        <span className="font-mono text-xs text-slate-500 whitespace-nowrap">
          {new Date(row.created_at).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Actor',
      accessor: 'actor_name',
      render: (row) => (
        <div>
          <div className="font-bold text-ink text-xs">{row.actor_name}</div>
          <div className="text-[10px] text-slate-400 uppercase font-semibold">{row.actor_role}</div>
        </div>
      )
    },
    {
      header: 'Action Executed',
      accessor: 'action',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-deep px-2 py-0.5 bg-slate-100 rounded">
          {row.action}
        </span>
      )
    },
    {
      header: 'Target Entity',
      accessor: 'entity_type',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.entity_type} {row.entity_id && `(#${String(row.entity_id).slice(-6)})`}
        </span>
      )
    },
    {
      header: 'Details & Diff',
      accessor: 'details',
      render: (row) => (
        <pre className="text-[11px] font-mono text-slate-500 max-w-xs truncate">
          {JSON.stringify(row.details || {})}
        </pre>
      )
    },
    {
      header: 'IP Address',
      accessor: 'ip_address',
      render: (row) => <span className="font-mono text-[11px] text-slate-400">{row.ip_address || '127.0.0.1'}</span>
    }
  ];

  return (
    <div>
      <Header
        eyebrow="SRI SANKARA TV / GOVERNANCE"
        title="Activity & Audit Trails"
        subtitle="Immutable event records tracking all operational changes, approvals, user lifecycle events, and configuration modifications."
        actions={
          <Button size="sm" variant="secondary" icon={RotateCcw} onClick={fetchLogs}>
            Refresh Audit Stream
          </Button>
        }
      />

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          emptyMessage="No audit log entries recorded yet."
        />
      </div>
    </div>
  );
}
