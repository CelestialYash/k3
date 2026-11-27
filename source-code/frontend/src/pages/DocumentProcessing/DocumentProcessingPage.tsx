import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import type { DocumentItem, DocumentPage, ExtractedEntity, ExtractedMetric } from '../../types';

export const DocumentProcessingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState(searchParams.get('doc') || '');
  const [pages, setPages] = useState<DocumentPage[]>([]);
  const [entities, setEntities] = useState<ExtractedEntity[]>([]);
  const [metrics, setMetrics] = useState<ExtractedMetric[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    api.get<DocumentItem[]>('/documents').then((res) => {
      setDocs(res.data);
      if (!selectedDocId && res.data.length > 0) {
        setSelectedDocId(res.data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedDocId) return;
    setSearchParams({ doc: selectedDocId });
    Promise.all([
      api.get<DocumentPage[]>(`/documents/${selectedDocId}/pages`),
      api.get<ExtractedEntity[]>(`/documents/${selectedDocId}/entities`),
      api.get<ExtractedMetric[]>(`/documents/${selectedDocId}/metrics`),
    ]).then(([p, e, m]) => {
      setPages(p.data);
      setEntities(e.data);
      setMetrics(m.data);
    });
  }, [selectedDocId]);

  const handleReprocess = async () => {
    if (!selectedDocId) return;
    setProcessing(true);
    try {
      await api.post(`/documents/${selectedDocId}/process`);
      const [p, e, m] = await Promise.all([
        api.get<DocumentPage[]>(`/documents/${selectedDocId}/pages`),
        api.get<ExtractedEntity[]>(`/documents/${selectedDocId}/entities`),
        api.get<ExtractedMetric[]>(`/documents/${selectedDocId}/metrics`),
      ]);
      setPages(p.data);
      setEntities(e.data);
      setMetrics(m.data);
    } finally {
      setProcessing(false);
    }
  };

  const selectedDoc = docs.find((d) => d.id === selectedDocId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-[28px] font-bold text-on-surface">Document Preview & Extraction</h1>
          <p className="text-[16px] text-on-surface-variant">
            Inspect page-wise extracted text alongside AI-identified geological entities and numerical metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="min-h-[44px] px-4 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-[15px] max-w-xs"
          >
            {docs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
          <button
            onClick={handleReprocess}
            disabled={processing || !selectedDocId}
            className="min-h-[44px] px-4 rounded-xl bg-primary text-on-primary font-semibold text-[14px] hover:bg-primary-container disabled:opacity-60"
          >
            {processing ? 'Processing...' : 'Re-run Extraction'}
          </button>
        </div>
      </div>

      {/* Split View */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Page-wise Extracted Content */}
        <div className="xl:col-span-7 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <h2 className="font-headline text-[18px] font-semibold">
              {selectedDoc ? selectedDoc.title : 'Extracted Document Content'}
            </h2>
            <span className="font-mono text-[12px] text-outline">{pages.length} page(s)</span>
          </div>

          {pages.length === 0 ? (
            <p className="text-outline py-8 text-center">No extracted pages available.</p>
          ) : (
            <div className="space-y-4 max-h-[680px] overflow-y-auto pr-1">
              {pages.map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/30 space-y-2">
                  <div className="flex items-center justify-between font-mono text-[11px] text-outline">
                    <span className="font-bold text-primary">PAGE {p.page_number}</span>
                    <span>
                      Method: {p.extraction_method} · Confidence:{' '}
                      {p.ocr_confidence ? `${Math.round(p.ocr_confidence * 100)}%` : 'N/A'}
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap font-body text-[15px] text-on-surface leading-relaxed">
                    {p.text_content || '[No text extracted on this page]'}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: AI Extraction Inspector */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-6 space-y-4">
            <h2 className="font-headline text-[18px] font-semibold">Extracted Numerical Metrics ({metrics.length})</h2>
            {metrics.length === 0 ? (
              <p className="text-[14px] text-outline">No numerical metrics detected.</p>
            ) : (
              <div className="space-y-3 max-h-[340px] overflow-y-auto">
                {metrics.map((m) => (
                  <div key={m.id} className="p-3.5 rounded-xl bg-surface-container-low/60 border border-outline-variant/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[14px] text-on-surface">{m.metric_name}</span>
                      <span className="font-mono text-[12px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                        {Math.round(m.confidence * 100)}% conf
                      </span>
                    </div>
                    <div className="font-mono text-[16px] font-bold text-primary">
                      {m.original_value} {m.unit}
                    </div>
                    <p className="text-[12px] text-on-surface-variant italic">Page {m.page_number}: “{m.supporting_text}”</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-6 space-y-4">
            <h2 className="font-headline text-[18px] font-semibold">Identified Entities ({entities.length})</h2>
            <div className="flex flex-wrap gap-2">
              {entities.map((ent) => (
                <span
                  key={ent.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-[13px]"
                >
                  <span className="font-mono text-[10px] uppercase text-primary font-bold">{ent.entity_type}</span>
                  <span className="font-medium text-on-surface">{ent.entity_value}</span>
                </span>
              ))}
              {entities.length === 0 && <p className="text-[14px] text-outline">No entities extracted.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
