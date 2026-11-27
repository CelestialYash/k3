import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/client';
import { useAuth } from '../../stores/AuthContext';
import type { DashboardStats, ConflictItem } from '../../types';

export const DashboardPage: React.FC = () => {
  const { user, hasMinRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<DashboardStats>('/analytics/dashboard'),
      api.get<ConflictItem[]>('/verification/conflicts?status_filter=open'),
    ])
      .then(([sRes, cRes]) => {
        setStats(sRes.data);
        setConflicts(cRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = stats
    ? Object.entries(stats.category_breakdown).map(([name, count]) => ({
        name: name.replace(' Reports', '').replace(' Records', ''),
        count,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Top Level Welcome & Operational Ribbon */}
      <section className="relative overflow-hidden rounded-2xl bg-surface-container-low p-6 sm:p-8 shadow-sm border border-outline-variant/30">
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-mono text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                CMPDI Central Node Connected
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-mono text-[11px]">
                <span className="material-symbols-outlined text-[15px]">verified_user</span>
                Role: {user?.roles[0]?.toUpperCase()}
              </span>
            </div>
            <h1 className="font-headline text-[30px] font-bold text-on-surface tracking-tight pt-1">
              Welcome, {user?.full_name}
            </h1>
            <p className="text-[17px] text-on-surface-variant leading-relaxed">
              Authoritative geological intelligence workspace across Coal India subsidiaries, borehole logs, and statutory mining plans.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {hasMinRole('researcher') && (
              <Link
                to="/upload"
                className="min-h-[48px] px-5 inline-flex items-center gap-2 rounded-xl bg-primary text-on-primary font-headline text-[15px] font-semibold hover:bg-primary-container transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                <span>Upload Report</span>
              </Link>
            )}
            {hasMinRole('analyst') && (
              <Link
                to="/assistant"
                className="min-h-[48px] px-4 inline-flex items-center gap-2 rounded-xl bg-surface-container-lowest text-primary font-headline text-[15px] font-semibold hover:bg-surface-container-high transition-all shadow-sm border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[20px]">psychology</span>
                <span>Ask AI Assistant</span>
              </Link>
            )}
            <Link
              to="/verification"
              className="min-h-[48px] px-4 inline-flex items-center gap-2 rounded-xl bg-error-container text-on-error-container font-headline text-[15px] font-semibold hover:opacity-90 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">warning</span>
              <span>Conflicts ({stats?.open_conflicts ?? 0})</span>
            </Link>
          </div>
        </div>
      </section>

      {/* KPI Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-outline font-semibold">
                Repository Volume
              </span>
              <h2 className="font-headline text-[36px] font-bold text-on-surface mt-1">
                {loading ? '—' : stats?.total_documents ?? 0}
              </h2>
              <p className="text-[15px] text-on-surface-variant font-medium">Authorized Documents</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">folder_copy</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/20 font-mono text-[12px] text-secondary font-semibold">
            {stats?.processed_documents ?? 0} processed & indexed ({stats?.processing_rate ?? 0}%)
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-secondary font-semibold">
                AI Extraction
              </span>
              <h2 className="font-headline text-[36px] font-bold text-on-surface mt-1">
                {loading ? '—' : (stats?.total_entities ?? 0) + (stats?.total_metrics ?? 0)}
              </h2>
              <p className="text-[15px] text-on-surface-variant font-medium">Entities & Metrics Extracted</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/20 font-mono text-[12px] text-on-surface-variant">
            {stats?.total_entities ?? 0} entities · {stats?.total_metrics ?? 0} metrics
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-primary font-semibold">
                Workflow Governance
              </span>
              <h2 className="font-headline text-[36px] font-bold text-on-surface mt-1">
                {loading ? '—' : stats?.pending_verification ?? 0}
              </h2>
              <p className="text-[15px] text-on-surface-variant font-medium">Pending Geologist Sign-off</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">pending_actions</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/20">
            <Link to="/verification" className="font-mono text-[12px] text-primary font-semibold hover:underline">
              Open Verification Queue →
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-tertiary-container font-semibold">
                Quality Validation
              </span>
              <h2 className="font-headline text-[36px] font-bold text-error mt-1">
                {loading ? '—' : stats?.open_conflicts ?? 0}
              </h2>
              <p className="text-[15px] text-on-surface-variant font-medium">Open Discrepancies</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-error-container/50 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[24px]">gpp_maybe</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/20">
            <Link to="/verification" className="font-mono text-[12px] text-error font-semibold hover:underline">
              Resolve Discrepancies →
            </Link>
          </div>
        </div>
      </section>

      {/* Main Asymmetric 70/30 Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 space-y-6">
          {/* Urgent Conflict Banner if any open conflict exists */}
          {conflicts.length > 0 && (
            <div className="rounded-2xl p-6 bg-error-container/30 border border-error/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-error text-on-error flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">emergency</span>
                </div>
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-error font-bold">
                    Cross-Report Discrepancy Flagged
                  </span>
                  <p className="text-[15px] text-on-surface mt-1 font-medium">{conflicts[0].description}</p>
                </div>
              </div>
              <Link
                to="/verification"
                className="min-h-[44px] px-4 rounded-xl bg-error text-on-error font-headline text-[14px] font-semibold inline-flex items-center shrink-0 hover:opacity-90"
              >
                Resolve Conflict
              </Link>
            </div>
          )}

          {/* Recent Ingested Documents */}
          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/30">
            <div className="flex items-center justify-between pb-4">
              <div>
                <h2 className="font-headline text-[20px] font-semibold text-on-surface">Recent Ingested Documents</h2>
                <p className="text-[14px] text-on-surface-variant">Live records from SQLite repository</p>
              </div>
              <Link
                to="/repository"
                className="min-h-[40px] px-3.5 rounded-xl bg-surface-container text-primary font-mono text-[12px] font-semibold inline-flex items-center hover:bg-surface-container-high"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4 rounded-l-xl">Document Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Mine & Subsidiary</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-[15px]">
                  {stats?.recent_documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-on-surface">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">picture_as_pdf</span>
                          <span className="truncate max-w-xs">{doc.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-md bg-surface-container font-mono text-[11px] text-on-surface-variant">
                          {doc.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-on-surface">{doc.mine_name || '—'}</div>
                        <div className="font-mono text-[11px] text-outline">{doc.subsidiary || 'CMPDI'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] font-semibold ${
                            doc.processing_status === 'completed'
                              ? 'bg-secondary-container text-on-secondary-container'
                              : doc.processing_status === 'failed'
                              ? 'bg-error-container text-on-error-container'
                              : 'bg-surface-container-high text-primary'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {doc.processing_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/processing?doc=${doc.id}`}
                          className="px-3 py-1.5 rounded-lg text-primary hover:bg-surface-container font-mono text-[12px] font-semibold"
                        >
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {(!stats || stats.recent_documents.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-outline">
                        No documents found. Upload a geological report to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-4 space-y-6">
          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/30">
            <h2 className="font-headline text-[18px] font-semibold text-on-surface">Documents by Category</h2>
            <p className="text-[14px] text-on-surface-variant mb-4">Live repository distribution</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#004ac6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/30 space-y-3">
            <h2 className="font-headline text-[18px] font-semibold text-on-surface">Quick Demo Actions</h2>
            <p className="text-[14px] text-on-surface-variant">Jump directly to core SIH26023 capabilities:</p>
            <div className="space-y-2 pt-1">
              <Link
                to="/assistant"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
              >
                <span className="font-medium text-[15px]">Ask Grounded AI Question</span>
                <span className="material-symbols-outlined text-primary">arrow_forward</span>
              </Link>
              <Link
                to="/reports"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
              >
                <span className="font-medium text-[15px]">Export Cited PDF Report</span>
                <span className="material-symbols-outlined text-primary">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
