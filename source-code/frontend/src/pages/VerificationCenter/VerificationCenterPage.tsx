import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../stores/AuthContext';
import type { ConflictItem, ExtractedMetric } from '../../types';

export const VerificationCenterPage: React.FC = () => {
  const { hasMinRole } = useAuth();
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [pendingMetrics, setPendingMetrics] = useState<ExtractedMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get<ConflictItem[]>('/verification/conflicts'),
      api.get<ExtractedMetric[]>('/verification/pending-metrics'),
    ])
      .then(([cRes, mRes]) => {
        setConflicts(cRes.data);
        setPendingMetrics(mRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolveConflict = async (id: string, statusVal: string) => {
    await api.post(`/verification/conflicts/${id}/resolve?status_val=${statusVal}`);
    loadData();
  };

  const handleVerifyMetric = async (metricId: string, decision: string) => {
    await api.post(`/verification/metrics/${metricId}/verify`, { decision, comment: `Marked ${decision} in Verification Center` });
    loadData();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-[28px] font-bold text-on-surface">Verification & Conflict Center</h1>
        <p className="text-[16px] text-on-surface-variant">
          Review cross-document numerical discrepancies and sign off on AI-extracted metrics.
        </p>
      </div>

      {/* Conflicts Section */}
      <section className="space-y-4">
        <h2 className="font-headline text-[20px] font-semibold text-on-surface">
          Detected Cross-Document Conflicts ({conflicts.length})
        </h2>

        {loading ? (
          <p className="text-outline">Loading conflicts...</p>
        ) : conflicts.length === 0 ? (
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 text-outline">
            No cross-document conflicts detected.
          </div>
        ) : (
          <div className="space-y-4">
            {conflicts.map((c) => (
              <div
                key={c.id}
                className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold uppercase ${
                        c.status === 'open'
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}
                    >
                      {c.status}
                    </span>
                    <span className="font-headline text-[18px] font-bold text-on-surface">
                      {c.metric_name} — {c.mine_name || 'Unknown Mine'} ({c.reporting_year || 'N/A'})
                    </span>
                  </div>

                  {c.status === 'open' && hasMinRole('researcher') && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResolveConflict(c.id, 'resolved')}
                        className="min-h-[40px] px-4 rounded-xl bg-secondary text-on-secondary font-semibold text-[14px]"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => handleResolveConflict(c.id, 'dismissed')}
                        className="min-h-[40px] px-4 rounded-xl bg-surface-container text-on-surface font-semibold text-[14px]"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-[15px] text-on-surface-variant">{c.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {c.evidence.map((ev) => (
                    <div key={ev.id} className="p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[14px] text-primary">{ev.document_title}</span>
                        <span className="font-mono text-[12px] text-outline">Page {ev.page_number ?? 1}</span>
                      </div>
                      <div className="font-mono text-[18px] font-bold text-on-surface">
                        {ev.extracted_value} {ev.unit}
                      </div>
                      <p className="text-[13px] text-on-surface-variant italic">“{ev.supporting_text}”</p>
                      <Link
                        to={`/processing?doc=${ev.document_id}`}
                        className="inline-block text-[12px] font-semibold text-primary hover:underline pt-1"
                      >
                        Inspect Source Document →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending Metrics Section */}
      <section className="space-y-4">
        <h2 className="font-headline text-[20px] font-semibold text-on-surface">
          Pending Metric Sign-off ({pendingMetrics.length})
        </h2>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low font-mono text-[11px] uppercase text-on-surface-variant">
                <th className="py-3 px-4">Metric</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Mine</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-[15px]">
              {pendingMetrics.map((m) => (
                <tr key={m.id}>
                  <td className="py-3.5 px-4 font-semibold">{m.metric_name}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">
                    {m.original_value} {m.unit}
                  </td>
                  <td className="py-3.5 px-4">{m.mine_name || '—'}</td>
                  <td className="py-3.5 px-4 font-mono text-[13px]">{Math.round(m.confidence * 100)}%</td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {hasMinRole('researcher') ? (
                      <>
                        <button
                          onClick={() => handleVerifyMetric(m.id, 'verified')}
                          className="px-3 py-1 rounded-lg bg-secondary-container text-on-secondary-container font-semibold text-[13px]"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleVerifyMetric(m.id, 'rejected')}
                          className="px-3 py-1 rounded-lg bg-error-container text-on-error-container font-semibold text-[13px]"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-[12px] text-outline">Read-only</span>
                    )}
                  </td>
                </tr>
              ))}
              {pendingMetrics.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-outline">
                    All extracted metrics have been reviewed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
