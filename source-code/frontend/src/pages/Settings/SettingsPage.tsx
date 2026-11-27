import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../stores/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [health, setHealth] = useState<{ status: string; app: string; version: string; llm_configured: boolean } | null>(null);

  useEffect(() => {
    api.get('/health').then((res) => setHealth(res.data));
  }, []);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-headline text-[28px] font-bold text-on-surface">Settings & Help</h1>
        <p className="text-[16px] text-on-surface-variant">
          System configuration status, AI provider readiness, and prototype documentation.
        </p>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
        <h2 className="font-headline text-[20px] font-semibold">System Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[15px]">
          <div className="p-4 rounded-xl bg-surface-container-low">
            <div className="font-mono text-[11px] uppercase text-outline">Backend API</div>
            <div className="font-semibold text-secondary mt-1">{health?.status || 'Checking...'}</div>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-low">
            <div className="font-mono text-[11px] uppercase text-outline">Version</div>
            <div className="font-mono font-semibold mt-1">{health?.version || '—'}</div>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-low">
            <div className="font-mono text-[11px] uppercase text-outline">Live LLM (Gemini)</div>
            <div className={`font-semibold mt-1 ${health?.llm_configured ? 'text-secondary' : 'text-tertiary'}`}>
              {health?.llm_configured ? 'Configured' : 'Unconfigured (Retrieval-Only Fallback)'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-3">
        <h2 className="font-headline text-[20px] font-semibold">Your Session</h2>
        <p className="text-[15px] text-on-surface-variant">
          Signed in as <strong>{user?.full_name}</strong> ({user?.email}) with role{' '}
          <span className="font-mono font-semibold text-primary">{user?.roles.join(', ')}</span>.
        </p>
      </div>
    </div>
  );
};
