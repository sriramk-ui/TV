import React, { useState, useEffect } from 'react';
import Header from '../components/organisms/Header';
import FormField from '../components/molecules/FormField';
import Textarea from '../components/atoms/Textarea';
import Button from '../components/atoms/Button';
import api from '../services/api';
import { MailCheck, CheckCircle2 } from 'lucide-react';

export default function FinanceSettingsPage() {
  const [emailsText, setEmailsText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.get('/admin/settings');
        const emails = res.data.finance_emails || [];
        setEmailsText(emails.join('\n'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const emailList = emailsText
        .split(/[;,\n]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      const res = await api.put('/admin/settings', {
        finance_emails: emailList
      });

      setSuccessMsg(`Successfully saved ${res.data.finance_emails.length} Accounts recipient address(es).`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Header
        title="Accounts Email Recipients"
        subtitle="Configure the Finance & Accounts recipient mailboxes that receive approved PAF budgets and PDF links."
      />

      <div className="max-w-2xl bg-white border border-slate-200/80 rounded-brand p-8 shadow-brand">
        <form onSubmit={handleSave} className="space-y-6">
          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-brand-md text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {successMsg}
            </div>
          )}

          <FormField
            label="Designated Accounts / Finance Email Addresses"
            helperText="Enter one email address per line or separate by commas. When the CMO approves a package, the approved PAF breakdown and PDF link are automatically delivered to these recipients."
            required
          >
            <Textarea
              value={emailsText}
              onChange={(e) => setEmailsText(e.target.value)}
              rows={5}
              placeholder="accounts@srisankaratv.com&#10;financehead@srisankaratv.com"
              className="font-mono text-xs"
              required
            />
          </FormField>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-brand-md text-xs text-slate-500 leading-relaxed">
            <strong>Channel Delivery Policy:</strong> Accounts emails are sent from the authorized Production Head mailbox only after the CMO approves both schedule and PAF. Modifying this recipient list is permanently recorded in the immutable activity audit log.
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={saving}
            icon={MailCheck}
          >
            Save Recipient Addresses
          </Button>
        </form>
      </div>
    </div>
  );
}
