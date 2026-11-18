import React, { useState, useEffect } from 'react';
import Header from '../components/organisms/Header';
import FormField from '../components/molecules/FormField';
import Input from '../components/atoms/Input';
import Select from '../components/atoms/Select';
import Button from '../components/atoms/Button';
import api from '../services/api';
import { Mail, PhoneCall, Calendar, Save, CheckCircle2 } from 'lucide-react';

export default function IntegrationSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get('/admin/settings');
        setSettings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    try {
      const res = await api.put('/admin/settings', settings);
      setSettings(res.data);
      setSuccess('Integration settings updated successfully.');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-12 text-center text-slate-400">Loading settings…</div>;
  }

  return (
    <div className="max-w-4xl">
      <Header
        eyebrow="SRI SANKARA TV / GOVERNANCE"
        title="Integration Settings"
        subtitle="Configure third-party API providers for automated email dispatches, voice calling, and calendar synchronizations."
      />

      <form onSubmit={handleSave} className="space-y-8">
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-brand-md text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {success}
          </div>
        )}

        {/* Brevo Email Section */}
        <div className="bg-white border border-slate-200/80 rounded-brand p-6 shadow-brand space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Mail className="w-5 h-5 text-blue" />
            <h3 className="text-base font-bold text-ink">Brevo Transactional Email Service</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Official Sender Display Name" required>
              <Input
                value={settings.brevo_sender_name}
                onChange={(e) => setSettings({ ...settings, brevo_sender_name: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Verified Sender Email" required>
              <Input
                type="email"
                value={settings.brevo_sender_email}
                onChange={(e) => setSettings({ ...settings, brevo_sender_email: e.target.value })}
                required
              />
            </FormField>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="brevo_enabled"
              checked={settings.brevo_enabled}
              onChange={(e) => setSettings({ ...settings, brevo_enabled: e.target.checked })}
              className="w-4 h-4 rounded text-blue"
            />
            <label htmlFor="brevo_enabled" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Enable Live Brevo Outbound Dispatch (Unchecked runs in Sandbox Simulator mode)
            </label>
          </div>
        </div>

        {/* MSG91 Voice Section */}
        <div className="bg-white border border-slate-200/80 rounded-brand p-6 shadow-brand space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <PhoneCall className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-ink">MSG91 Automated Voice Dispatch</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Official Outbound Caller ID" required>
              <Input
                value={settings.msg91_caller_number}
                onChange={(e) => setSettings({ ...settings, msg91_caller_number: e.target.value })}
                placeholder="+914424991234"
                required
              />
            </FormField>

            <FormField label="Voice Campaign Flow ID">
              <Input
                value={settings.msg91_campaign_id}
                onChange={(e) => setSettings({ ...settings, msg91_campaign_id: e.target.value })}
                placeholder="flow_production_call"
              />
            </FormField>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="msg91_enabled"
              checked={settings.msg91_enabled}
              onChange={(e) => setSettings({ ...settings, msg91_enabled: e.target.checked })}
              className="w-4 h-4 rounded text-blue"
            />
            <label htmlFor="msg91_enabled" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Enable Live MSG91 Voice Calling (Unchecked runs in Sandbox Simulator mode)
            </label>
          </div>
        </div>

        {/* Calendar Provider Section */}
        <div className="bg-white border border-slate-200/80 rounded-brand p-6 shadow-brand space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-ink">Staff Calendar Synchronization</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Active Calendar Provider" required>
              <Select
                value={settings.calendar_provider}
                onChange={(e) => setSettings({ ...settings, calendar_provider: e.target.value })}
              >
                <option value="google">Google Calendar (Service Account / OAuth)</option>
                <option value="outlook">Microsoft Outlook / Microsoft Graph API</option>
              </Select>
            </FormField>

            <FormField label="Travel & Prep Buffer (Minutes)" required>
              <Input
                type="number"
                min="0"
                step="15"
                value={settings.travel_buffer_minutes}
                onChange={(e) => setSettings({ ...settings, travel_buffer_minutes: Number(e.target.value) })}
                required
              />
            </FormField>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="calendar_enabled"
              checked={settings.calendar_enabled}
              onChange={(e) => setSettings({ ...settings, calendar_enabled: e.target.checked })}
              className="w-4 h-4 rounded text-blue"
            />
            <label htmlFor="calendar_enabled" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Enable Live Remote Calendar Event Insertion
            </label>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={saving}
          icon={Save}
          className="px-6 py-3"
        >
          Save All Integration Settings
        </Button>
      </form>
    </div>
  );
}
