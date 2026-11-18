import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/organisms/Header';
import FilterControls from '../components/molecules/FilterControls';
import Button from '../components/atoms/Button';
import StatusIndicator from '../components/molecules/StatusIndicator';
import Modal from '../components/organisms/Modal';
import FormField from '../components/molecules/FormField';
import Input from '../components/atoms/Input';
import Select from '../components/atoms/Select';
import Textarea from '../components/atoms/Textarea';
import api from '../services/api';
import { formatDateReadable, getTodayIST } from '@sankara/shared';
import { SHOOT_CATEGORIES, SHOOT_CATEGORY_LABELS, SHOOT_STATUS_LABELS } from '@sankara/constants';
import { Plus, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SchedulePage() {
  const { user } = useAuth();
  const [shoots, setShoots] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(getTodayIST());

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedOccurrence, setSelectedOccurrence] = useState(null);
  const [conflictError, setConflictError] = useState('');

  // Form State: Create Shoot
  const [formData, setFormData] = useState({
    title: '',
    client_guest: '',
    category: SHOOT_CATEGORIES.STUDIO,
    shoot_date: getTodayIST(),
    end_date: getTodayIST(),
    reporting_time: '06:30',
    rolling_time: '08:00',
    end_time: '14:00',
    is_overnight: false,
    venue: '',
    venue_map_link: '',
    equipment_requirements: '',
    crew_count_preferred: 4,
    notes: '',
    urgency: 'normal'
  });

  // Form State: Assign Crew
  const [assignments, setAssignments] = useState([]);

  const role = user?.role || 'crew';
  const canCreate = ['ep', 'production_head', 'cmo'].includes(role);
  const canAssign = ['production_head', 'cmo'].includes(role);

  const fetchShoots = async () => {
    setLoading(true);
    try {
      const res = await api.get('/shoots', {
        params: { status: statusFilter, q: search }
      });
      setShoots(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    if (canAssign) {
      try {
        const res = await api.get('/staff');
        setStaffList(res.data.filter((s) => s.active));
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchShoots();
  }, [statusFilter, search]);

  useEffect(() => {
    fetchStaff();
  }, [canAssign]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      // Generate date array between shoot_date and end_date
      const dates = [];
      let cur = new Date(formData.shoot_date);
      const end = new Date(formData.end_date || formData.shoot_date);
      while (cur <= end) {
        dates.push(cur.toISOString().split('T')[0]);
        cur.setDate(cur.getDate() + 1);
      }

      await api.post('/shoots', {
        ...formData,
        dates: dates.length > 0 ? dates : [formData.shoot_date]
      });

      setIsCreateModalOpen(false);
      fetchShoots();
    } catch (err) {
      alert(err.message);
    }
  };

  const openAssignModal = (occurrence) => {
    setSelectedOccurrence(occurrence);
    setConflictError('');
    // Initialize assignments
    const existing = (occurrence.assignments || []).map((a) => ({
      user_id: a.user_id?._id || a.user_id,
      role_title: a.role_title
    }));
    setAssignments(
      existing.length > 0
        ? existing
        : [
            { user_id: '', role_title: 'Camera 1' },
            { user_id: '', role_title: 'Technician' },
            { user_id: '', role_title: 'OB Driver' }
          ]
    );
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setConflictError('');
    try {
      const validAssignments = assignments.filter((a) => a.user_id);
      await api.put(`/shoots/occurrences/${selectedOccurrence._id}/assignments`, {
        assignments: validAssignments
      });
      setIsAssignModalOpen(false);
      fetchShoots();
    } catch (err) {
      setConflictError(err.message);
    }
  };

  // Group occurrences for selected date
  const selectedDateOccurrences = [];
  shoots.forEach((s) => {
    (s.occurrences || []).forEach((occ) => {
      if (occ.shoot_date === selectedDate) {
        selectedDateOccurrences.push({ ...occ, shoot: s });
      }
    });
  });

  return (
    <div>
      <Header
        title="Shooting Schedule"
        subtitle="Day-specific shoot occurrences, crew assignments, conflict detection, and venue coordination."
        actions={
          canCreate ? (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Schedule
            </Button>
          ) : null
        }
      />

      <div className="bg-white border border-slate-200/80 rounded-brand p-6 shadow-brand mb-8">
        <FilterControls
          searchValue={search}
          onSearchChange={setSearch}
          statusValue={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={Object.entries(SHOOT_STATUS_LABELS).map(([k, v]) => ({
            value: k,
            label: v
          }))}
          placeholder="Search by program, venue, or crew…"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Date:
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-ink"
            />
          </div>
        </FilterControls>
      </div>

      {/* Date Occurrences Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink tracking-tight">
            Shoots on {formatDateReadable(selectedDate)}
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            {selectedDateOccurrences.length} scheduled occurrences
          </span>
        </div>

        {selectedDateOccurrences.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-brand p-12 text-center text-slate-400">
            No production shoots scheduled on {formatDateReadable(selectedDate)}.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {selectedDateOccurrences.map((occ) => (
              <div
                key={occ._id}
                className="bg-white border border-slate-200 rounded-brand p-6 shadow-brand flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-deep px-2 py-0.5 bg-slate-100 rounded-md">
                      {occ.series_code}
                    </span>
                    <h3 className="text-base font-bold text-ink">
                      {occ.shoot.title}
                    </h3>
                    <StatusIndicator status={occ.status} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-brand-md">
                    <div>
                      <strong>Reporting:</strong> {occ.reporting_time}
                    </div>
                    <div>
                      <strong>Rolling:</strong> {occ.rolling_time}
                    </div>
                    <div>
                      <strong>Pack-up:</strong> {occ.end_time}
                    </div>
                    <div>
                      <strong>Overnight:</strong> {occ.is_overnight ? 'Yes' : 'No'}
                    </div>
                    <div className="col-span-2 sm:col-span-4 mt-1">
                      <strong>Venue:</strong> {occ.venue}
                    </div>
                  </div>

                  <div className="text-xs text-slate-600">
                    <strong>Crew Roster:</strong>{' '}
                    {occ.assignments?.length > 0 ? (
                      <span className="text-slate-800 font-medium">
                        {occ.assignments
                          .map((a) => `${a.user_name} (${a.role_title})`)
                          .join(', ')}
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium">
                        No crew assigned yet.
                      </span>
                    )}
                  </div>
                </div>

                {canAssign && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="primary"
                      icon={Users}
                      onClick={() => openAssignModal(occ)}
                    >
                      Assign Crew
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create Shoot Request */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Production Schedule"
        subtitle="Executive Producer initial shoot brief. (Zero financial PAF fields)."
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <FormField label="Program / Show Title" required>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Purattasi Saturdays Special"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Client / Guest / Devotee">
              <Input
                value={formData.client_guest}
                onChange={(e) => setFormData({ ...formData, client_guest: e.target.value })}
                placeholder="e.g. Temple Trustee"
              />
            </FormField>

            <FormField label="Shoot Category" required>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {Object.entries(SHOOT_CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="First Shoot Date" required>
              <Input
                type="date"
                value={formData.shoot_date}
                onChange={(e) => setFormData({ ...formData, shoot_date: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Last Shoot Date (For multi-day)" required>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Reporting Time" required>
              <Input
                type="time"
                value={formData.reporting_time}
                onChange={(e) => setFormData({ ...formData, reporting_time: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Rolling Time" required>
              <Input
                type="time"
                value={formData.rolling_time}
                onChange={(e) => setFormData({ ...formData, rolling_time: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Pack-up Time" required>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </FormField>
          </div>

          <FormField label="Venue Location & Address" required>
            <Input
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="e.g. Kapaleeshwarar Temple, Mylapore, Chennai"
              required
            />
          </FormField>

          <FormField label="Google Maps Navigation URL">
            <Input
              type="url"
              value={formData.venue_map_link}
              onChange={(e) => setFormData({ ...formData, venue_map_link: e.target.value })}
              placeholder="https://maps.google.com/..."
            />
          </FormField>

          <FormField label="Equipment & Special Needs">
            <Textarea
              value={formData.equipment_requirements}
              onChange={(e) => setFormData({ ...formData, equipment_requirements: e.target.value })}
              placeholder="e.g. 3 FX6 Cameras, Live Audio Link, Drone permit"
              rows={2}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit Shoot Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Assign Crew with Conflict Resolver */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Crew & Check Availability"
        subtitle={`Occurrence: ${selectedOccurrence?.series_code} on ${selectedOccurrence?.shoot_date} (${selectedOccurrence?.reporting_time} - ${selectedOccurrence?.end_time})`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          {conflictError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-brand-md text-xs font-semibold flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500" />
              <div>
                <strong className="block text-sm font-bold">Scheduling Conflict Detected!</strong>
                <p className="mt-0.5 leading-relaxed">{conflictError}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {assignments.map((assign, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-brand-md border border-slate-200/80">
                <div className="w-1/3">
                  <Input
                    value={assign.role_title}
                    onChange={(e) => {
                      const updated = [...assignments];
                      updated[idx].role_title = e.target.value;
                      setAssignments(updated);
                    }}
                    placeholder="Role Title"
                    className="h-9 text-xs"
                    required
                  />
                </div>
                <div className="flex-1">
                  <Select
                    value={assign.user_id}
                    onChange={(e) => {
                      const updated = [...assignments];
                      updated[idx].user_id = e.target.value;
                      setAssignments(updated);
                    }}
                    className="h-9 text-xs"
                    required
                  >
                    <option value="">Select Staff Member</option>
                    {staffList.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.team || s.role})
                      </option>
                    ))}
                  </Select>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAssignments(assignments.filter((_, i) => i !== idx));
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setAssignments([...assignments, { user_id: '', role_title: 'Assistant' }])}
          >
            ＋ Add Crew Member
          </Button>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Verify & Save Crew
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
