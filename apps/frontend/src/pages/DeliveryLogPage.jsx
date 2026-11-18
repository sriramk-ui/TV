import React, { useState, useEffect } from 'react';
import Header from '../components/organisms/Header';
import DataTable from '../components/organisms/DataTable';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import api from '../services/api';
import { Activity, RotateCcw } from 'lucide-react';

export default function DeliveryLogPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/outbox-jobs');
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleRetry = async (jobId) => {
    try {
      await api.post(`/admin/outbox-jobs/${jobId}/retry`);
      fetchJobs();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    {
      header: 'Time',
      accessor: 'created_at',
      render: (row) => (
        <span className="font-mono text-xs text-slate-500 whitespace-nowrap">
          {new Date(row.created_at).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Channel & Event',
      accessor: 'channel',
      render: (row) => (
        <div>
          <div className="font-bold text-ink text-xs capitalize">{row.channel.replace('_', ' ')}</div>
          <div className="text-[11px] text-slate-400 font-mono">{row.event_type}</div>
        </div>
      )
    },
    {
      header: 'Recipient',
      accessor: 'recipient_address',
      render: (row) => <span className="font-mono text-xs text-slate-700">{row.recipient_address}</span>
    },
    {
      header: 'Delivery State',
      accessor: 'state',
      render: (row) => {
        const state = row.state || 'pending';
        const colors = {
          delivered: 'approved',
          pending: 'requested',
          sending: 'pending_cmo',
          retryable_failure: 'warning',
          permanent_failure: 'danger',
          cancelled: 'cancelled'
        };
        return <Badge variant={colors[state] || 'default'}>{state.replace('_', ' ').toUpperCase()}</Badge>;
      }
    },
    {
      header: 'Remote Ref / Error',
      accessor: 'details',
      render: (row) => (
        <div className="text-xs max-w-xs truncate">
          {row.last_error ? (
            <span className="text-red-600 font-medium">{row.last_error}</span>
          ) : (
            <span className="text-slate-400 font-mono">{row.provider_reference || 'Dispatched'}</span>
          )}
        </div>
      )
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => (
        row.state.includes('failure') && (
          <Button size="sm" variant="secondary" onClick={() => handleRetry(row._id)}>
            Retry
          </Button>
        )
      )
    }
  ];

  return (
    <div>
      <Header
        title="Delivery & Outbox Audit Log"
        subtitle="Track whether transactional emails, calendar invites, and automated phone calls were delivered successfully."
        actions={
          <Button size="sm" variant="secondary" icon={RotateCcw} onClick={fetchJobs}>
            Refresh Logs
          </Button>
        }
      />

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={jobs}
          loading={loading}
          emptyMessage="No notification dispatches logged yet."
        />
      </div>
    </div>
  );
}
