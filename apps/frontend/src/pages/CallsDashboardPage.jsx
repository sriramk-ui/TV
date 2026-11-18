import React, { useState, useEffect } from 'react';
import Header from '../components/organisms/Header';
import DataTable from '../components/organisms/DataTable';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import api from '../services/api';
import { formatDateReadable } from '@sankara/shared';
import { PhoneCall, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

export default function CallsDashboardPage() {
  const [callJobs, setCallJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/outbox-jobs', {
        params: { channel: 'msg91_voice' }
      });
      setCallJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const simulateWebhook = async (jobId, status, userAck = false, conflict = false) => {
    try {
      await api.post('/webhooks/msg91', {
        internal_call_id: jobId,
        status,
        user_acknowledged: userAck,
        conflict_reported: conflict
      });
      fetchCalls();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    {
      header: 'Shoot / Assignment',
      accessor: 'show_title',
      render: (row) => (
        <div>
          <div className="font-bold text-ink">{row.payload?.show_title || 'Production Shoot'}</div>
          <div className="text-xs text-slate-400">
            {row.payload?.shoot_date} · {row.payload?.role_title}
          </div>
        </div>
      )
    },
    {
      header: 'Recipient Phone',
      accessor: 'recipient_address',
      render: (row) => <span className="font-mono text-xs font-semibold">{row.recipient_address}</span>
    },
    {
      header: 'Attempt',
      accessor: 'attempt_number',
      render: (row) => (
        <span className="text-xs font-bold text-slate-700">
          Attempt {row.attempt_number} of {row.max_attempts}
        </span>
      )
    },
    {
      header: 'Call State',
      accessor: 'call_state',
      render: (row) => {
        const state = row.call_state || 'queued';
        const colors = {
          acknowledged: 'approved',
          connected: 'pending_approval',
          issue_reported: 'changes_requested',
          no_answer: 'warning',
          not_reached: 'danger',
          queued: 'default',
          dialing: 'pending_cmo'
        };
        return <Badge variant={colors[state] || 'default'}>{state.replace('_', ' ').toUpperCase()}</Badge>;
      }
    },
    {
      header: 'Test Provider Callback Simulation',
      accessor: 'simulation',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => simulateWebhook(row._id, 'connected', true, false)}
            title="Simulate employee answering and saying 'confirmed'"
          >
            ✓ Ack
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => simulateWebhook(row._id, 'no_answer', false, false)}
            title="Simulate no answer -> schedules 30 min retry"
          >
            No Answer
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => simulateWebhook(row._id, 'connected', false, true)}
            title="Simulate employee reporting scheduling conflict"
          >
            Conflict
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <Header
        title="AI Voice Dispatch Center"
        subtitle="Automated outbound phone dispatches following CMO approval. 30-minute no-answer retry and escalation."
        actions={
          <Button size="sm" variant="secondary" icon={RotateCcw} onClick={fetchCalls}>
            Refresh Queue
          </Button>
        }
      />

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={callJobs}
          loading={loading}
          emptyMessage="No automated voice call dispatches queued yet. (Calls are queued upon CMO shoot package approval)."
        />
      </div>
    </div>
  );
}
