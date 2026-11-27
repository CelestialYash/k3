import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../stores/AuthContext';
import type { DocumentItem } from '../../types';

const CATEGORIES = [
  '',
  'Geological Reports',
  'Mining Reports',
  'Production Data',
  'Exploration Records',
  'Project Reports',
  'Historical Archives',
];

export const DocumentRepositoryPage: React.FC = () => {
  const { hasMinRole } = useAuth();
  const [searchParams] = useSearchParams();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState('');
  const [subsidiary, setSubsidiary] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDocs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (subsidiary) params.set('subsidiary', subsidiary);

    api
      .get<DocumentItem[]>(`/documents?${params.toString()}`)
      .then((res) => setDocs(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDocs();
  }, [category, subsidiary]);

  const handleDownload = async (doc: DocumentItem) => {
    const res = await api.get(`/documents/${doc.id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.original_filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async (doc: DocumentItem) => {
    if (!window.confirm(`Delete "${doc.title}"?`)) return;
    await api.delete(`/documents/${doc.id}`);
    loadDocs();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-[28px] font-bold text-on-surface">Document Repository</h1>
          <p className="text-[16px] text-on-surface-variant">
            Centralized, access-controlled repository of geological and mining records.
          </p>
        </div>
        {hasMinRole('researcher') && (
          <Link
            to="/upload"
            className="min-h-[44px] px-5 rounded-xl bg-primary text-on-primary font-headline text-[15px] font-semibold inline-flex items-center gap-2 hover:bg-primary-container"
          >
            <span className="material-symbols-outlined text-[20px]">upload_file</span>
            <span>Upload Document</span>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadDocs()}
          placeholder="Filter by title, mine name, or filename..."
          className="flex-1 min-w-[220px] min-h-[44px] px-4 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[15px]"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="min-h-[44px] px-4 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[15px]"
        >
          <option value="">All Categories</option>
          {CATEGORIES.filter(Boolean).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={subsidiary}
          onChange={(e) => setSubsidiary(e.target.value)}
          className="min-h-[44px] px-4 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[15px]"
        >
          <option value="">All Subsidiaries</option>
          {['CMPDI', 'SECL', 'CCL', 'BCCL', 'WCL', 'NCL', 'MCL', 'ECL'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={loadDocs}
          className="min-h-[44px] px-5 rounded-xl bg-primary text-on-primary font-semibold text-[15px] hover:bg-primary-container"
        >
          Apply
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-5">Document</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Mine / Subsidiary</th>
                <th className="py-3.5 px-4">Year</th>
                <th className="py-3.5 px-4">Classification</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-[15px]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-outline">
                    Loading documents...
                  </td>
                </tr>
              ) : docs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-outline">
                    No matching documents found.
                  </td>
                </tr>
              ) : (
                docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-surface-container-low/40">
                    <td className="py-4 px-5">
                      <div className="font-semibold text-on-surface">{doc.title}</div>
                      <div className="font-mono text-[11px] text-outline">
                        {doc.original_filename} · {(doc.file_size / 1024).toFixed(1)} KB · {doc.page_count} page(s)
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-md bg-surface-container font-mono text-[11px]">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium">{doc.mine_name || '—'}</div>
                      <div className="font-mono text-[11px] text-outline">{doc.subsidiary || '—'}</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-[13px]">{doc.reporting_year || '—'}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold ${
                          doc.classification === 'Restricted'
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {doc.classification}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-semibold ${
                          doc.processing_status === 'completed'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-surface-container-high text-primary'
                        }`}
                      >
                        {doc.processing_status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                      <Link
                        to={`/processing?doc=${doc.id}`}
                        className="px-3 py-1.5 rounded-lg bg-surface-container-high text-primary font-mono text-[12px] font-semibold hover:opacity-90"
                      >
                        View & Extract
                      </Link>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-mono text-[12px] hover:bg-surface-container-high"
                      >
                        Download
                      </button>
                      {hasMinRole('admin') && (
                        <button
                          onClick={() => handleDelete(doc)}
                          className="px-2.5 py-1.5 rounded-lg text-error hover:bg-error-container/40 font-mono text-[12px]"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
