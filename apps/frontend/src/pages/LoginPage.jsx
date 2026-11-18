import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/templates/AuthLayout';
import FormField from '../components/molecules/FormField';
import Input from '../components/atoms/Input';
import Button from '../components/atoms/Button';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'cmo', label: 'CMO / Admin', email: 'cmo@srisankaratv.com' },
  { role: 'production_head', label: 'Production Head', email: 'productionhead@srisankaratv.com' },
  { role: 'ep', label: 'Executive Producer', email: 'ep1@srisankaratv.com' },
  { role: 'accounts', label: 'Accounts & Finance', email: 'accounts@srisankaratv.com' },
  { role: 'crew', label: 'Camera Crew', email: 'karthik.camera@srisankaratv.com' }
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setError('');
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-brand-md text-xs font-semibold">
            {error}
          </div>
        )}

        <FormField label="Official Email Address" required>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <Input
              type="email"
              placeholder="e.g. cmo@srisankaratv.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </FormField>

        <FormField label="Password" required>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <Input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </FormField>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          icon={ArrowRight}
          iconPosition="right"
          className="w-full py-3"
        >
          Sign In to Portal
        </Button>

        {/* Quick Demo Switcher */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
            One-Click Test Account Fill
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleSelectDemo(acc.email)}
                className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
                  email === acc.email
                    ? 'bg-blue text-white border-blue'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
