import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import type { AuditLogItem } from '../../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);

  useEffect(() => {
    api.get<AuditLogItem[]>('/audit').then((res) => setLogs(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-[28px] font-bold text-on-surface">Immutable Audit Logs</h1>
        <p className="text-[16px] text-on-surface-variant">
          Complete trace of authentication, document uploads, downloads, AI queries, and verifications.
        </p>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low font-mono text-[11px] uppercase text-on-surface-variant">
              <th className="py-3.5 px-5">Timestamp</th>
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Action</th>
              <th className="py-3.5 px-4">Resource</th>
              <th className="py-3.5 px-5">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 text-[14px]">
            {logs.map((l) => (
              <tr key={l.id}>
                <td className="py-3 px-5 font-mono text-[12px] text-outline whitespace-nowrap">
                  {new Date(l.created_at).toLocaleString()}
                </td>
                <td className="py-3 px-4 font-mono text-[13px]">{l.user_email || 'system'}</td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-0.5 rounded-md bg-surface-container-high text-primary font-mono text-[11px] font-semibold">
                    {l.action}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-[12px] text-on-surface-variant">
                  {l.resource_type}
                </td>
                <td className="py-3 px-5 text-on-surface">{l.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
