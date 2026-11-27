import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import type { ReportItem } from '../../types';

export const ReportGeneratorPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [title, setTitle] = useState('CMPDI Quarterly Geological & Production Summary');
  const [reportType, setReportType] = useState('summary');
  const [format, setFormat] = useState('pdf');
  const [generating, setGenerating] = useState(false);

  const loadReports = () => {
    api.get<ReportItem[]>('/reports').then((res) => setReports(res.data));
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await api.post('/reports/generate', { title, report_type: reportType, format });
      loadReports();
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (r: ReportItem) => {
    const res = await api.get(`/reports/${r.id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${r.title}.${r.format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-[28px] font-bold text-on-surface">Report Generator</h1>
        <p className="text-[16px] text-on-surface-variant">
          Generate structured PDF, DOCX, or XLSX reports directly from verified geological metrics and flagged discrepancies.
        </p>
      </div>

      <form
        onSubmit={handleGenerate}
        className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
      >
        <div className="md:col-span-2 space-y-1">
          <label className="block text-[14px] font-semibold">Report Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full min-h-[44px] px-4 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[15px]"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[14px] font-semibold">Template</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full min-h-[44px] px-4 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[15px]"
          >
            <option value="summary">Executive Summary</option>
            <option value="production">Production & Reserves</option>
            <option value="geological">Geological Exploration</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-[14px] font-semibold">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full min-h-[44px] px-4 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[15px]"
          >
            <option value="pdf">PDF Document</option>
            <option value="docx">Word (.docx)</option>
            <option value="xlsx">Excel (.xlsx)</option>
          </select>
        </div>
        <div className="md:col-span-4 flex justify-end">
          <button
            type="submit"
            disabled={generating}
            className="min-h-[44px] px-6 rounded-xl bg-primary text-on-primary font-headline font-semibold text-[15px] hover:bg-primary-container"
          >
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </form>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low font-mono text-[11px] uppercase text-on-surface-variant">
              <th className="py-3.5 px-5">Report Title</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Format</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-5 text-right">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 text-[15px]">
            {reports.map((r) => (
              <tr key={r.id}>
                <td className="py-4 px-5 font-semibold">{r.title}</td>
                <td className="py-4 px-4 capitalize">{r.report_type}</td>
                <td className="py-4 px-4 font-mono uppercase text-[12px]">{r.format}</td>
                <td className="py-4 px-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono text-[11px] font-semibold">
                    {r.status}
                  </span>
                </td>
                <td className="py-4 px-5 text-right">
                  <button
                    onClick={() => handleDownload(r)}
                    className="px-3.5 py-1.5 rounded-lg bg-surface-container-high text-primary font-mono text-[12px] font-semibold"
                  >
                    Download .{r.format}
                  </button>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-outline">
                  No reports generated yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
