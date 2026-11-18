import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/organisms/Header';
import DataTable from '../components/organisms/DataTable';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import Modal from '../components/organisms/Modal';
import FormField from '../components/molecules/FormField';
import Input from '../components/atoms/Input';
import Select from '../components/atoms/Select';
import SearchBar from '../components/molecules/SearchBar';
import api from '../services/api';
import { ROLES, ROLE_LABELS } from '@sankara/constants';
import { Users, Upload, Plus, PhoneCall } from 'lucide-react';

export default function StaffPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [importSummary, setImportSummary] = useState(null);

  // Add Staff Form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'crew',
    team: 'Camera',
    designation: '',
    phone_e164: '',
    voice_language: 'ta',
    voice_opt_in: true
  });

  const isCMO = user?.role === 'cmo';

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff');
      setStaff(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/staff', formData);
      alert(`Staff member ${res.data.user.name} created. Temporary password: ${res.data.temporaryPassword}`);
      setIsAddModalOpen(false);
      fetchStaff();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCSVSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/staff/import-csv', { csv: csvContent });
      setImportSummary(res.data);
      fetchStaff();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.team.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Employee Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-bold text-ink">{row.name}</div>
          <div className="text-xs text-slate-400">{row.email}</div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => (
        <Badge variant="default" size="sm">
          {ROLE_LABELS[row.role] || row.role}
        </Badge>
      )
    },
    {
      header: 'Team / Designation',
      accessor: 'team',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.team} {row.designation && `· ${row.designation}`}
        </span>
      )
    },
    {
      header: 'Phone (E.164)',
      accessor: 'phone_e164',
      render: (row) => <span className="font-mono text-xs">{row.phone_e164 || '—'}</span>
    },
    {
      header: 'AI Voice Consent',
      accessor: 'voice_opt_in',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-bold ${
            row.voice_opt_in ? 'text-emerald-700' : 'text-slate-400'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          {row.voice_opt_in ? `Opted In (${row.voice_language.toUpperCase()})` : 'Disabled'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'active',
      render: (row) => (
        <Badge variant={row.active ? 'approved' : 'cancelled'} size="sm">
          {row.active ? 'Active' : 'Deactivated'}
        </Badge>
      )
    }
  ];

  return (
    <div>
      <Header
        title="Team Directory"
        subtitle="Official Outlook IDs, mobile numbers, production teams, and automated voice dispatch preferences."
        actions={
          isCMO ? (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                icon={Upload}
                onClick={() => {
                  setImportSummary(null);
                  setIsCSVModalOpen(true);
                }}
              >
                Bulk CSV Import
              </Button>
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Member
              </Button>
            </div>
          ) : null
        }
      />

      <div className="bg-white border border-slate-200/80 rounded-brand p-6 shadow-brand mb-8 flex justify-between items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search team members by name, email, or department…"
          className="w-full sm:w-96"
        />
        <div className="text-xs text-slate-500 font-semibold">
          Total Staff: <strong className="text-ink">{staff.length}</strong>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredStaff}
        loading={loading}
        emptyMessage="No team members found."
      />

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Team Member"
        subtitle="Create an authorized production staff user."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <FormField label="Full Name" required>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. R. Venkatesh"
              required
            />
          </FormField>

          <FormField label="Official Email Address" required>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. venkatesh@srisankaratv.com"
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Role Category" required>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Department / Team">
              <Input
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                placeholder="Camera / Audio / Post"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Mobile Number (E.164 format)">
              <Input
                value={formData.phone_e164}
                onChange={(e) => setFormData({ ...formData, phone_e164: e.target.value })}
                placeholder="+919840011000"
              />
            </FormField>

            <FormField label="Preferred Voice Language">
              <Select
                value={formData.voice_language}
                onChange={(e) => setFormData({ ...formData, voice_language: e.target.value })}
              >
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="en">English</option>
              </Select>
            </FormField>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-brand-md text-xs">
            <input
              type="checkbox"
              id="voice_opt_in"
              checked={formData.voice_opt_in}
              onChange={(e) => setFormData({ ...formData, voice_opt_in: e.target.checked })}
              className="w-4 h-4 rounded text-blue"
            />
            <label htmlFor="voice_opt_in" className="font-semibold text-slate-700 cursor-pointer">
              Record lawful staff consent for automated MSG91 voice assignment calls.
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* CSV Import Modal */}
      <Modal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        title="Bulk Import Staff from CSV"
        subtitle="Upload or paste comma-separated staff directory records."
      >
        <form onSubmit={handleCSVSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-brand-md text-xs text-slate-600 font-mono">
            name,email,role,team,phone_e164,voice_language,voice_opt_in
          </div>

          <FormField label="Paste CSV Content" required>
            <textarea
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="Paste raw CSV text here..."
              rows={6}
              className="w-full p-3 font-mono text-xs border border-slate-200 rounded-brand-md focus:outline-none focus:border-blue"
              required
            />
          </FormField>

          {importSummary && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-brand-md text-xs space-y-2">
              <strong>Import Results:</strong>
              <div>Created: {importSummary.created} new accounts · Updated: {importSummary.updated}</div>
              {importSummary.temporaryCredentials?.length > 0 && (
                <div className="mt-2 font-mono text-[11px] bg-white p-2 rounded border border-emerald-300 max-h-32 overflow-y-auto">
                  {importSummary.temporaryCredentials.map((c, i) => (
                    <div key={i}>{c.name} ({c.email}): <strong>{c.temporaryPassword}</strong></div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsCSVModalOpen(false)}>
              Close
            </Button>
            <Button type="submit" variant="primary">
              Import Records
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
