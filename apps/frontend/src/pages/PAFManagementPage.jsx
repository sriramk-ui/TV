import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/organisms/Header';
import DataTable from '../components/organisms/DataTable';
import StatusIndicator from '../components/molecules/StatusIndicator';
import Button from '../components/atoms/Button';
import Modal from '../components/organisms/Modal';
import FormField from '../components/molecules/FormField';
import Input from '../components/atoms/Input';
import Select from '../components/atoms/Select';
import Textarea from '../components/atoms/Textarea';
import PAFExpenseTable from '../components/organisms/PAFExpenseTable';
import api from '../services/api';
import { formatINR, toRupees } from '@sankara/shared';
import { FileSpreadsheet, Plus, Printer, CheckCircle2 } from 'lucide-react';

export default function PAFManagementPage() {
  const { user } = useAuth();
  const [pafs, setPafs] = useState([]);
  const [shootRequests, setShootRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedPaf, setSelectedPaf] = useState(null);

  // Editor Form State
  const [formData, setFormData] = useState({
    id: null,
    shoot_id: '',
    show_name: '',
    shoot_start: '',
    shoot_end: '',
    location: '',
    episodes: 1,
    equipment_type: 'In-house OB Kit',
    notes: '',
    items: [{ particulars: '', unit: 'Days', quantity: 1, rate: 0, payment_mode: 'Cash' }]
  });

  const role = user?.role || 'crew';
  const canEdit = ['production_head', 'cmo'].includes(role);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pafRes = await api.get('/pafs');
      setPafs(pafRes.data);

      if (canEdit) {
        const shootRes = await api.get('/shoots');
        setShootRequests(shootRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  const openNewPAF = () => {
    if (shootRequests.length === 0) {
      alert('No available EP shoot requests found to link.');
      return;
    }
    const firstShoot = shootRequests[0];
    const dates = (firstShoot.occurrences || []).map((o) => o.shoot_date).sort();
    setFormData({
      id: null,
      shoot_id: firstShoot._id,
      show_name: firstShoot.title,
      shoot_start: dates[0] || '',
      shoot_end: dates.at(-1) || dates[0] || '',
      location: firstShoot.occurrences?.[0]?.venue || 'Main Studio',
      episodes: 1,
      equipment_type: 'In-house OB Kit',
      notes: '',
      items: [
        { particulars: 'OB Van Fuel / Diesel', unit: 'Days', quantity: 1, rate: 4500, payment_mode: 'Company Voucher' },
        { particulars: 'Crew Food & Refreshments', unit: 'Persons', quantity: 8, rate: 250, payment_mode: 'Cash' }
      ]
    });
    setIsEditorOpen(true);
  };

  const handleShootSelectionChange = (shootId) => {
    const shoot = shootRequests.find((s) => s._id === shootId);
    if (shoot) {
      const dates = (shoot.occurrences || []).map((o) => o.shoot_date).sort();
      setFormData({
        ...formData,
        shoot_id: shoot._id,
        show_name: shoot.title,
        shoot_start: dates[0] || '',
        shoot_end: dates.at(-1) || dates[0] || '',
        location: shoot.occurrences?.[0]?.venue || 'Main Studio'
      });
    }
  };

  const handleSavePAF = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pafs', formData);
      setIsEditorOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const openPrintModal = async (paf) => {
    try {
      const res = await api.get(`/pafs/${paf._id}`);
      setSelectedPaf(res.data);
      setIsPrintModalOpen(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    {
      header: 'Series Reference',
      accessor: 'series_code',
      render: (row) => <span className="font-mono font-bold text-deep">{row.series_code}</span>
    },
    {
      header: 'Program / Show Name',
      accessor: 'show_name',
      render: (row) => <span className="font-bold text-ink">{row.show_name}</span>
    },
    {
      header: 'Shoot Duration',
      accessor: 'shoot_start',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.shoot_start} to {row.shoot_end}
        </span>
      )
    },
    {
      header: 'Estimated Total',
      accessor: 'estimated_total',
      render: (row) => (
        <span className="font-mono font-bold text-slate-900 text-sm">
          {formatINR(row.estimated_total_paise || 0)}
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
            icon={Printer}
            onClick={(e) => {
              e.stopPropagation();
              openPrintModal(row);
            }}
          >
            View / Print
          </Button>

          {canEdit && row.status !== 'approved' && (
            <Button
              size="sm"
              variant="primary"
              onClick={async (e) => {
                e.stopPropagation();
                const res = await api.get(`/pafs/${row._id}`);
                setFormData(res.data);
                setIsEditorOpen(true);
              }}
            >
              Edit PAF
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <Header
        title="PAF & Estimated Budgets"
        subtitle="Every PAF starts from an EP shoot request. Decimal-safe calculations and financial control."
        actions={
          canEdit ? (
            <Button
              variant="primary"
              icon={Plus}
              onClick={openNewPAF}
            >
              New PAF
            </Button>
          ) : null
        }
      />

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={pafs}
          loading={loading}
          emptyMessage="No PAF budget records available."
        />
      </div>

      {/* PAF Editor Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={formData.id ? 'Edit Production Approval Form' : 'Prepare Production Approval Form (PAF)'}
        subtitle="Itemized expenditure formulation for TV broadcast production."
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSavePAF} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Linked EP Shoot Request" required>
              <Select
                value={formData.shoot_id}
                onChange={(e) => handleShootSelectionChange(e.target.value)}
                disabled={Boolean(formData.id)}
                required
              >
                {shootRequests.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.series_code} · {s.title} · {s.ep_name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Show / Production Name" required>
              <Input
                value={formData.show_name}
                onChange={(e) => setFormData({ ...formData, show_name: e.target.value })}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Shoot Start Date" required>
              <Input
                type="date"
                value={formData.shoot_start}
                onChange={(e) => setFormData({ ...formData, shoot_start: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Shoot End Date" required>
              <Input
                type="date"
                value={formData.shoot_end}
                onChange={(e) => setFormData({ ...formData, shoot_end: e.target.value })}
                required
              />
            </FormField>

            <FormField label="No. of Episodes">
              <Input
                type="number"
                min="1"
                value={formData.episodes}
                onChange={(e) => setFormData({ ...formData, episodes: Number(e.target.value) })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Location / Venue" required>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Equipment Arrangement">
              <Input
                value={formData.equipment_type}
                onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value })}
                placeholder="In-house / Rental OB Kit"
              />
            </FormField>
          </div>

          <FormField label="Itemized Production Expenses" required>
            <PAFExpenseTable
              items={formData.items}
              onChange={(updatedItems) => setFormData({ ...formData, items: updatedItems })}
            />
          </FormField>

          <FormField label="Notes / Expense Assumptions">
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Fuel budgeted for 300km; Food allowances based on standard channel rates."
              rows={2}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save PAF Budget
            </Button>
          </div>
        </form>
      </Modal>

      {/* Print / Save PDF View Modal */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Production Approval Form — Official Copy"
        subtitle={`Series Code: ${selectedPaf?.series_code}`}
        maxWidth="max-w-3xl"
      >
        {selectedPaf && (
          <div className="space-y-6">
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-brand-md text-xs font-semibold">
              ⚠️ Approved estimated expenditure — not proof of payment. For internal production and accounts allocation only.
            </div>

            <div className="border border-slate-200 rounded-brand-md p-5 bg-slate-50/50 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <strong>Show Name:</strong> {selectedPaf.show_name}
                </div>
                <div>
                  <strong>Location:</strong> {selectedPaf.location}
                </div>
                <div>
                  <strong>Shoot Duration:</strong> {selectedPaf.shoot_start} to {selectedPaf.shoot_end}
                </div>
                <div>
                  <strong>Approved Status:</strong> {selectedPaf.status}
                </div>
              </div>
            </div>

            <PAFExpenseTable items={selectedPaf.items} readOnly={true} />

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                Sri Sankara TV · Broadcast Production Operations
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setIsPrintModalOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  icon={Printer}
                  onClick={() => {
                    window.open(`/api/v1/pafs/${selectedPaf._id}/print`, '_blank');
                  }}
                >
                  Print / Download PDF
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
