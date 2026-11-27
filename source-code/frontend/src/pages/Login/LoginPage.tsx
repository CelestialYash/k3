import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../stores/AuthContext';

const DEMO_ACCOUNTS = [
  { label: 'Super Admin (CGM)', email: 'admin@cmpdi.cil.in', pass: 'Admin@1234', role: 'super_admin' },
  { label: 'Researcher (Geologist)', email: 'researcher@cmpdi.cil.in', pass: 'Research@1234', role: 'researcher' },
  { label: 'Analyst (Mining)', email: 'analyst@cmpdi.cil.in', pass: 'Analyst@1234', role: 'analyst' },
  { label: 'Viewer (Survey)', email: 'viewer@cmpdi.cil.in', pass: 'Viewer@1234', role: 'viewer' },
];

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@cmpdi.cil.in');
  const [password, setPassword] = useState('Admin@1234');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/40 overflow-hidden">
        {/* Left Info Panel */}
        <div className="lg:col-span-5 bg-surface-container-low p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-outline-variant/30">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[26px]">landscape</span>
              </div>
              <div>
                <h1 className="font-headline text-[22px] font-bold text-on-surface leading-tight">GeoStratum</h1>
                <p className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                  CMPDI · Coal India Limited
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h2 className="font-headline text-[26px] font-bold text-on-surface leading-snug">
                Geological, Mining & Reporting Intelligence
              </h2>
              <p className="text-[16px] text-on-surface-variant leading-relaxed">
                Source-restricted document intelligence for borehole logs, feasibility reports, production metrics, and discrepancy verification.
              </p>
            </div>
          </div>

          <div className="pt-8 space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-wider text-outline font-semibold">
              Quick Demo Accounts (Click to Fill)
            </p>
            <div className="grid grid-cols-1 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword(acc.pass);
                  }}
                  className="text-left px-3.5 py-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/40 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-[14px] font-semibold text-on-surface">{acc.label}</div>
                    <div className="font-mono text-[11px] text-outline">{acc.email}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-mono text-[11px] font-semibold">
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h3 className="font-headline text-[24px] font-bold text-on-surface">Authorized Employee Sign In</h3>
              <p className="text-[15px] text-on-surface-variant mt-1">
                Access is governed by role-based and document-level authorization.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-error-container text-on-error-container text-[14px] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[15px] font-semibold text-on-surface">Organizational Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[46px] px-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-[16px] text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
                  placeholder="name@cmpdi.cil.in"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[15px] font-semibold text-on-surface">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-[46px] px-4 rounded-xl bg-surface-container-low border border-outline-variant/50 text-[16px] text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[48px] rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline text-[16px] font-semibold transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">login</span>
                <span>{submitting ? 'Signing In...' : 'Sign In to Workspace'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
