import React, { useState, useEffect } from 'react';
import Header from '../components/organisms/Header';
import Button from '../components/atoms/Button';
import StatusIndicator from '../components/molecules/StatusIndicator';
import Modal from '../components/organisms/Modal';
import FormField from '../components/molecules/FormField';
import Textarea from '../components/atoms/Textarea';
import PAFExpenseTable from '../components/organisms/PAFExpenseTable';
import api from '../services/api';
import { formatDateReadable, formatINR } from '@sankara/shared';
import { CheckCircle2, RotateCcw, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

export default function ApprovalCenterPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Changes Request Modal
  const [isChangesModalOpen, setIsChangesModalOpen] = useState(false);
  const [targetShootId, setTargetShootId] = useState(null);
  const [changesReason, setChangesReason] = useState('');

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.get('/approvals/pending');
      setPackages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (shootId) => {
    if (
      !window.confirm(
        'Approve the estimated PAF and all shoot schedules together? This releases the PAF to Accounts and triggers staff calendar, email and AI call workflows.'
      )
    ) {
      return;
    }

    try {
      const res = await api.post(`/approvals/${shootId}/decision`, {
        decision: 'approve'
      });
      alert(res.message);
      fetchPending();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRequestChanges = (shootId) => {
    setTargetShootId(shootId);
    setChangesReason('');
    setIsChangesModalOpen(true);
  };

  const submitChangesRequest = async (e) => {
    e.preventDefault();
    if (!changesReason.trim()) {
      alert('Please provide a reason for the changes.');
      return;
    }

    try {
      const res = await api.post(`/approvals/${targetShootId}/decision`, {
        decision: 'changes_requested',
        reason: changesReason
      });
      alert(res.message);
      setIsChangesModalOpen(false);
      fetchPending();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <Header
        title="CMO Approval Center"
        subtitle="Sole authoritative gate: approve both the estimated PAF budget and crew schedule in one combined decision."
      />

      {/* Hourly Reminder Notification Banner */}
      <div className="bg-white border border-slate-200 rounded-brand p-5 shadow-brand mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 grid place-items-center flex-shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">Hourly Email Reminders Active</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl mt-0.5">
              The portal issues an immediate submission alert, then hourly reminder digests every 60 minutes while packages await your decision. Approving stops all pending reminders.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-2xl font-bold font-mono text-deep">{packages.length}</span>
          <span className="text-xs font-semibold uppercase text-slate-400">Pending</span>
        </div>
      </div>

      {/* Pending Packages List */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white border border-slate-200/80 rounded-brand p-12 text-center text-slate-400">
            Loading pending approval packages…
          </div>
        ) : packages.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-brand p-12 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <strong className="block text-slate-800 text-sm">All Packages Reviewed</strong>
            <p className="text-xs mt-1">There are no shooting schedules currently awaiting CMO decision.</p>
          </div>
        ) : (
          packages.map((pkg) => {
            const { shoot, occurrences = [], paf } = pkg;
            return (
              <div
                key={shoot._id}
                className="bg-white border border-slate-200 rounded-brand shadow-brand overflow-hidden"
              >
                {/* Header */}
                <div className="px-6 py-5 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-deep px-2.5 py-0.5 bg-white border border-slate-200 rounded-md">
                        {shoot.series_code}
                      </span>
                      <StatusIndicator status={shoot.status} />
                    </div>
                    <h3 className="text-lg font-bold text-ink">{shoot.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Requested by: <strong>{shoot.ep_name}</strong> · Client: {shoot.client_guest || 'Sri Sankara TV'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <Button
                      size="sm"
                      variant="danger"
                      icon={RotateCcw}
                      onClick={() => handleRequestChanges(shoot._id)}
                    >
                      Request Changes
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={CheckCircle2}
                      onClick={() => handleApprove(shoot._id)}
                      className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white"
                    >
                      ✓ Approve Package
                    </Button>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-6">
                  {/* Occurrences & Crew */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      1. Production Schedule & Assigned Team
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {occurrences.map((occ, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-slate-50 border border-slate-200/80 rounded-brand-md text-xs space-y-2"
                        >
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{formatDateReadable(occ.shoot_date)}</span>
                            <span className="font-mono text-slate-600">
                              {occ.reporting_time} - {occ.end_time}
                            </span>
                          </div>
                          <div className="text-slate-500">
                            <strong>Venue:</strong> {occ.venue}
                          </div>
                          <div className="pt-2 border-t border-slate-200/60">
                            <strong className="text-slate-700 block mb-1">Assigned Personnel:</strong>
                            <div className="space-y-1">
                              {(occ.assignments || []).map((a, aIdx) => (
                                <div key={aIdx} className="flex justify-between text-slate-600">
                                  <span>{a.user_name}</span>
                                  <span className="text-slate-400 font-medium">{a.role_title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PAF Budget Breakdown */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        2. Production Approval Form (PAF) Itemized Expenses
                      </h4>
                      {paf && (
                        <span className="text-xs font-semibold text-slate-600">
                          Estimated Total:{' '}
                          <strong className="font-mono text-deep text-sm ml-1">
                            {formatINR(paf.estimated_total_paise)}
                          </strong>
                        </span>
                      )}
                    </div>

                    {paf ? (
                      <PAFExpenseTable items={paf.items} readOnly={true} />
                    ) : (
                      <div className="p-4 bg-red-50 text-red-700 text-xs rounded-brand-md font-semibold">
                        Warning: No PAF budget prepared for this production.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Changes Request Modal */}
      <Modal
        isOpen={isChangesModalOpen}
        onClose={() => setIsChangesModalOpen(false)}
        title="Request Changes on Production Package"
        subtitle="Provide mandatory revision instructions to the Production Head."
      >
        <form onSubmit={submitChangesRequest} className="space-y-4">
          <FormField label="Mandatory Revision Remarks" required>
            <Textarea
              value={changesReason}
              onChange={(e) => setChangesReason(e.target.value)}
              placeholder="e.g. Please reduce OB Van vehicle allocation to 1 day and revise food allowance..."
              rows={4}
              required
            />
          </FormField>

          <p className="text-xs text-slate-400 leading-relaxed">
            Returning this package sets status to <strong>changes_requested</strong>. Zero staff emails, voice calls, or accounts notifications will be dispatched until resubmitted and approved.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsChangesModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              Confirm Return for Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
