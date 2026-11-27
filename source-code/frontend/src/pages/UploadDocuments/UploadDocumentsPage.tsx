import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

export const UploadDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Geological Reports');
  const [subsidiary, setSubsidiary] = useState('SECL');
  const [mineName, setMineName] = useState('');
  const [reportingYear, setReportingYear] = useState('2024');
  const [classification, setClassification] = useState('Internal');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('title', title || file.name);
      form.append('category', category);
      form.append('subsidiary', subsidiary);
      form.append('mine_name', mineName);
      form.append('reporting_year', reportingYear);
      form.append('classification', classification);
      form.append('auto_process', 'true');

      const res = await api.post('/documents/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/processing?doc=${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-headline text-[28px] font-bold text-on-surface">Upload Geological & Mining Document</h1>
        <p className="text-[16px] text-on-surface-variant">
          Supported formats: PDF, DOCX, XLSX, CSV, JPG, PNG. Uploaded documents are automatically processed for text, tables, entities, and conflict detection.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container text-[15px]">{error}</div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/30 shadow-sm space-y-5"
      >
        <div className="border-2 border-dashed border-outline-variant rounded-2xl p-8 text-center bg-surface-container-low/50">
          <span className="material-symbols-outlined text-[40px] text-primary">cloud_upload</span>
          <p className="mt-2 font-headline text-[17px] font-semibold text-on-surface">
            {file ? file.name : 'Choose a document file to ingest'}
          </p>
          <p className="text-[13px] text-outline mt-1">Max 200 MB · Stored securely with UUID key</p>
          <input
            type="file"
            accept=".pdf,.docx,.xlsx,.csv,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-4 block mx-auto text-[14px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-[14px] font-semibold">Document Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Gevra OCP Annual Production Report 2024"
              className="w-full min-h-[44px] px-4 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[15px]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[14px] font-semibold">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full min-h-[44px] px-4 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[15px]"
            >
              <option>Geological Reports</option>
              <option>Mining Reports</option>
              <option>Production Data</option>
              <option>Exploration Records</option>
              <option>Project Reports</option>
              <option>Historical Archives</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[14px] font-semibold">Subsidiary</label>
            <select
              value={subsidiary}
              onChange={(e) => setSubsidiary(e.target.value)}
              className="w-full min-h-[44px] px-4 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[15px]"
            >
              {['CMPDI', 'SECL', 'CCL', 'BCCL', 'WCL', 'NCL', 'MCL', 'ECL'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[14px] font-semibold">Mine Name</label>
            <input
              value={mineName}
              onChange={(e) => setMineName(e.target.value)}
              placeholder="e.g., Gevra OCP"
              className="w-full min-h-[44px] px-4 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[15px]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[14px] font-semibold">Reporting Year</label>
            <input
              value={reportingYear}
              onChange={(e) => setReportingYear(e.target.value)}
              placeholder="e.g., 2024"
              className="w-full min-h-[44px] px-4 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[15px]"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="block text-[14px] font-semibold">Access Classification</label>
            <select
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              className="w-full min-h-[44px] px-4 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[15px]"
            >
              <option value="Internal">Internal (All authorized employees)</option>
              <option value="Restricted">Restricted (Uploader & Admins only)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full min-h-[48px] rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline text-[16px] font-semibold shadow-sm disabled:opacity-60"
        >
          {uploading ? 'Uploading & Extracting Intelligence...' : 'Upload & Process Document'}
        </button>
      </form>
    </div>
  );
};
