import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/organisms/Header';
import StatCard from '../components/molecules/StatCard';
import DataTable from '../components/organisms/DataTable';
import StatusIndicator from '../components/molecules/StatusIndicator';
import Button from '../components/atoms/Button';
import Modal from '../components/organisms/Modal';
import PAFExpenseTable from '../components/organisms/PAFExpenseTable';
import api from '../services/api';
import { formatDateReadable, formatINR } from '@sankara/shared';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Plus,
  Send,
  Users
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shoots, setShoots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [crewAssignments, setCrewAssignments] = useState([]);
  const [pafs, setPafs] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // 'details', 'paf'
  const [selectedShoot, setSelectedShoot] = useState(null);
  const [selectedPaf, setSelectedPaf] = useState(null);

  const role = user?.role || 'crew';

  const fetchData = async () => {
    setLoading(true);
    try {
      if (role === 'crew') {
        const res = await api.get('/crew/my-assignments');
        setCrewAssignments(res.data);
      } else {
        const shootRes = await api.get('/shoots');
        setShoots(shootRes.data);

        if (['production_head', 'cmo', 'accounts'].includes(role)) {
          const pafRes = await api.get('/pafs');
          setPafs(pafRes.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  const handleCrewAck = async (occurrenceId, status = 'acknowledged') => {
    try {
      await api.post(`/crew/assignments/${occurrenceId}/ack`, { status });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // KPIs
  const requestedCount = shoots.filter((s) => s.status === 'requested').length;
  const pendingCmoCount = shoots.filter((s) => s.status === 'pending_approval').length;
  const approvedCount = shoots.filter((s) => s.status === 'approved').length;
  const myRequestsCount = shoots.filter((s) => s.ep_id === user?._id).length;

  const columns = [
    {
      header: 'Series Code',
      accessor: 'series_code',
      render: (row) => <span className="font-mono font-bold text-deep">{row.series_code}</span>
    },
    {
      header: 'Show / Program',
      accessor: 'title',
      render: (row) => (
        <div>
          <div className="font-bold text-ink">{row.title}</div>
          <div className="text-xs text-slate-400">{row.client_guest || 'Sri Sankara TV OB'}</div>
        </div>
      )
    },
    {
      header: 'Shoot Dates',
      accessor: 'dates',
      render: (row) => {
        const occs = row.occurrences || [];
        if (occs.length === 0) return '—';
        return (
          <div className="text-xs text-slate-600">
            {formatDateReadable(occs[0].shoot_date)}
            {occs.length > 1 && ` (+${occs.length - 1} days)`}
          </div>
        );
      }
    },
    {
      header: 'Venue',
      accessor: 'venue',
      render: (row) => (
        <span className="text-xs text-slate-600 truncate max-w-xs block">
          {row.occurrences?.[0]?.venue || 'Main Studio'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusIndicator status={row.status} />
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedShoot(row);
              setActiveModal('details');
            }}
          >
            Details
          </Button>

          {role === 'production_head' && row.status === 'requested' && (
            <Button
              size="sm"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/schedule');
              }}
            >
              Plan Shoot
            </Button>
          )}

          {role === 'cmo' && row.status === 'pending_approval' && (
            <Button
              size="sm"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/approvals');
              }}
            >
              Review Package
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <Header
        title={`Welcome, ${user?.name || 'Production User'}`}
        subtitle="Manage and track live television broadcasts, crew allocations, budgets, and approval trails."
        actions={
          role === 'ep' ? (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => navigate('/schedule')}
            >
              Create Schedule
            </Button>
          ) : role === 'production_head' ? (
            <Button
              variant="primary"
              icon={Calendar}
              onClick={() => navigate('/schedule')}
            >
              Production Workbench
            </Button>
          ) : null
        }
      />

      {/* Role-Specific Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {role === 'ep' ? (
          <>
            <StatCard
              title="My Shoot Requests"
              value={myRequestsCount}
              subtext="Submitted production series"
              icon={Calendar}
            />
            <StatCard
              title="Approved Shoots"
              value={shoots.filter((s) => s.status === 'approved' && s.ep_id === user?._id).length}
              subtext="Ready for recording"
              icon={CheckCircle2}
            />
            <StatCard
              title="Pending Review"
              value={shoots.filter((s) => s.status === 'pending_approval' && s.ep_id === user?._id).length}
              subtext="With CMO for decision"
              icon={Clock}
            />
            <StatCard
              title="Changes Requested"
              value={shoots.filter((s) => s.status === 'changes_requested' && s.ep_id === user?._id).length}
              subtext="Requires clarification"
              icon={AlertCircle}
            />
          </>
        ) : role === 'production_head' ? (
          <>
            <StatCard
              title="Incoming Requests"
              value={requestedCount}
              subtext="Needs crew & PAF planning"
              icon={Clock}
            />
            <StatCard
              title="Pending CMO Approval"
              value={pendingCmoCount}
              subtext="Submitted combined packages"
              icon={Send}
            />
            <StatCard
              title="Approved Productions"
              value={approvedCount}
              subtext="Published to team"
              icon={CheckCircle2}
            />
            <StatCard
              title="Total Active PAFs"
              value={pafs.length}
              subtext="Itemized production budgets"
              icon={FileSpreadsheet}
            />
          </>
        ) : role === 'cmo' ? (
          <>
            <StatCard
              title="Awaiting Your Decision"
              value={pendingCmoCount}
              subtext="Schedule + PAF packages"
              icon={AlertCircle}
            />
            <StatCard
              title="Total Live Productions"
              value={shoots.length}
              subtext="Across all categories"
              icon={Calendar}
            />
            <StatCard
              title="Approved Productions"
              value={approvedCount}
              subtext="Dispatched to Accounts & Crew"
              icon={CheckCircle2}
            />
            <StatCard
              title="Approved Budget Ledger"
              value={pafs.length}
              subtext="Verified financial records"
              icon={FileSpreadsheet}
            />
          </>
        ) : role === 'accounts' ? (
          <>
            <StatCard
              title="Approved PAF Records"
              value={pafs.length}
              subtext="Authorised by CMO"
              icon={CheckCircle2}
            />
            <StatCard
              title="Total Budget Value"
              value={formatINR(
                pafs.reduce((acc, p) => acc + (p.estimated_total_paise || 0), 0)
              )}
              subtext="Estimated allocation"
              icon={FileSpreadsheet}
            />
            <StatCard
              title="Approved Productions"
              value={approvedCount}
              subtext="Active shoots"
              icon={Calendar}
            />
            <StatCard
              title="Financial Audit"
              value="100% Locked"
              subtext="Zero mutable drafts"
              icon={Clock}
            />
          </>
        ) : (
          <>
            <StatCard
              title="My Assigned Shoots"
              value={crewAssignments.length}
              subtext="Upcoming broadcast schedules"
              icon={Calendar}
            />
            <StatCard
              title="Confirmed by Me"
              value={crewAssignments.filter((a) => a.response_state === 'acknowledged').length}
              subtext="Attendance confirmed"
              icon={CheckCircle2}
            />
            <StatCard
              title="Pending Confirmation"
              value={crewAssignments.filter((a) => a.response_state === 'pending').length}
              subtext="Action required"
              icon={AlertCircle}
            />
            <StatCard
              title="Production Desk"
              value="Online"
              subtext="SMS & Voice Ready"
              icon={Users}
            />
          </>
        )}
      </div>

      {/* Main Section Content */}
      {role === 'crew' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink tracking-tight">
              My Broadcast Assignments
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crewAssignments.length === 0 ? (
              <div className="col-span-2 bg-white border border-slate-200/80 rounded-brand p-12 text-center text-slate-400">
                You currently have no upcoming shoot assignments.
              </div>
            ) : (
              crewAssignments.map((a) => (
                <div
                  key={a.occurrence_id}
                  className="bg-white border border-slate-200 rounded-brand p-6 shadow-brand space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-ink">{a.title}</h3>
                      <div className="text-xs text-slate-500 mt-1 font-medium">
                        Role: <span className="text-blue font-bold">{a.role_title}</span>
                      </div>
                    </div>
                    <StatusIndicator status={a.response_state} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-brand-md">
                    <div>
                      <strong>Date:</strong> {formatDateReadable(a.shoot_date)}
                    </div>
                    <div>
                      <strong>Reporting:</strong> {a.reporting_time}
                    </div>
                    <div>
                      <strong>Rolling:</strong> {a.rolling_time}
                    </div>
                    <div>
                      <strong>Pack-up:</strong> {a.end_time}
                    </div>
                    <div className="col-span-2 mt-1">
                      <strong>Venue:</strong> {a.venue}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    {a.response_state !== 'acknowledged' ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleCrewAck(a.occurrence_id, 'acknowledged')}
                        className="flex-1"
                      >
                        ✓ Acknowledge Assignment
                      </Button>
                    ) : (
                      <div className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 flex-1">
                        <CheckCircle2 className="w-4 h-4" /> Confirmed
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleCrewAck(a.occurrence_id, 'conflict_reported')}
                    >
                      Report Conflict
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink tracking-tight">
              Recent Production Schedules
            </h2>
            <Button size="sm" variant="secondary" onClick={() => navigate('/schedule')}>
              View Full Calendar
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={shoots}
            loading={loading}
            emptyMessage="No shoot schedules recorded yet."
            onRowClick={(row) => {
              setSelectedShoot(row);
              setActiveModal('details');
            }}
          />
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={activeModal === 'details'}
        onClose={() => setActiveModal(null)}
        title={selectedShoot?.title || 'Shoot Details'}
        subtitle={`Series Code: ${selectedShoot?.series_code}`}
      >
        {selectedShoot && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Client / Guest</span>
                <span className="font-semibold text-slate-800">{selectedShoot.client_guest || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Executive Producer</span>
                <span className="font-semibold text-slate-800">{selectedShoot.ep_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Status</span>
                <StatusIndicator status={selectedShoot.status} />
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Urgency</span>
                <span className="font-semibold capitalize text-slate-800">{selectedShoot.urgency}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Occurrences & Crew Roster
              </h4>
              <div className="space-y-2">
                {(selectedShoot.occurrences || []).map((occ, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-brand-md text-xs">
                    <div className="font-bold text-slate-900 mb-1">
                      {formatDateReadable(occ.shoot_date)} ({occ.reporting_time} - {occ.end_time})
                    </div>
                    <div className="text-slate-500 mb-2">Venue: {occ.venue}</div>
                    <div className="text-[11px] text-slate-600">
                      <strong>Assigned Crew:</strong>{' '}
                      {occ.assignments?.length > 0
                        ? occ.assignments.map((a) => `${a.user_name} (${a.role_title})`).join(', ')
                        : 'No crew assigned yet.'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedShoot.paf_id && ['production_head', 'cmo', 'accounts'].includes(role) && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-brand-md flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-blue">PAF Budget Linked</div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Estimated Budget: {formatINR(selectedShoot.paf_id.estimated_total_paise || 0)}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    navigate('/pafs');
                  }}
                >
                  Open PAF
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
