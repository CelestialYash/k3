import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import type { AIAnswer } from '../../types';

const SUGGESTIONS = [
  'What were the proved coal reserves and stripping ratio of Gevra OCP in 2021 vs 2024?',
  'What is the Seam IV thickness recorded in North Karanpura?',
  'What is the approved peak capacity of Gevra OCP?',
];

export const AIAssistantPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [scope, setScope] = useState('all');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ q: string; res: AIAnswer }[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleAsk = async (qText?: string) => {
    const query = (qText ?? question).trim();
    if (!query) return;
    setError('');
    setLoading(true);
    try {
      const res = await api.post<AIAnswer>('/assistant/ask', {
        question: query,
        conversation_id: conversationId,
        search_scope: scope,
      });
      setConversationId(res.data.conversation_id);
      setHistory((prev) => [{ q: query, res: res.data }, ...prev]);
      if (!qText) setQuestion('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to query AI Assistant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header & Strict Evidence Badge */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <h1 className="font-headline text-[32px] font-bold text-on-surface tracking-tight">
            Geological & Mining Research Assistant
          </h1>
          <p className="text-[17px] text-on-surface-variant">
            Ask questions across verified CMPDI & Coal India archives with page-level source citations.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-secondary-container/40 text-on-secondary-container px-4 py-2.5 rounded-xl border border-secondary/20 shrink-0">
          <span className="material-symbols-outlined text-[20px]">verified_user</span>
          <div className="text-[13px] font-semibold">Strict Evidence Mode Active</div>
        </div>
      </div>

      {/* Query Box */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/40 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[14px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-semibold">Scope:</span>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="px-3 py-1 rounded-lg bg-surface-container-low border border-outline-variant/40 text-[14px]"
            >
              <option value="all">All Authorized Archives</option>
              <option value="SECL">SECL (Gevra / Kusmunda)</option>
              <option value="CCL">CCL (North Karanpura / Ashok)</option>
              <option value="BCCL">BCCL (Moonidih / Jharia)</option>
            </select>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="relative flex items-center"
        >
          <span className="material-symbols-outlined text-[24px] text-outline absolute left-4">search</span>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question grounded in your uploaded geological reports..."
            className="w-full h-14 pl-12 pr-44 bg-surface-container-low rounded-xl text-[16px] text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 h-10 px-5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-headline text-[14px] font-semibold flex items-center gap-1.5 disabled:opacity-60"
          >
            <span>{loading ? 'Analyzing...' : 'Search & Analyze'}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </form>

        <div className="space-y-2 pt-1">
          <div className="text-[13px] text-outline font-medium">Try asking:</div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleAsk(s)}
                className="text-left px-3.5 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container hover:text-primary text-[14px] text-on-surface border border-outline-variant/30 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="p-4 rounded-xl bg-error-container text-on-error-container">{error}</div>}

      {/* Answer History */}
      <div className="space-y-8">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-4">
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">person</span>
              <p className="text-[17px] font-medium text-on-surface">{item.q}</p>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                <h2 className="font-headline text-[20px] font-bold text-on-surface">
                  Source-Grounded Intelligence Response
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-semibold ${
                    item.res.evidence_sufficient
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-error-container text-on-error-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {item.res.evidence_sufficient ? 'verified' : 'info'}
                  </span>
                  {item.res.evidence_sufficient
                    ? `Cited Sources (${item.res.citations.length})`
                    : 'Insufficient Evidence'}
                </span>
              </div>

              <div className="text-[16px] text-on-surface whitespace-pre-line leading-relaxed">
                {item.res.answer}
              </div>

              {item.res.citations.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-mono text-[12px] uppercase tracking-wider text-outline font-semibold">
                    Cited Primary Documents & Excerpts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.res.citations.map((cit, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/30 flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="font-bold text-primary">Citation [{cIdx + 1}]</span>
                            <span className="font-mono text-[12px] text-outline">
                              Page {cit.page_number ?? 1} · {Math.round(cit.relevance_score * 100)}% match
                            </span>
                          </div>
                          <h4 className="font-headline font-semibold text-[15px] text-on-surface">
                            {cit.document_title}
                          </h4>
                          <blockquote className="text-[13px] text-on-surface-variant italic border-l-2 border-primary/40 pl-3">
                            “{cit.excerpt}”
                          </blockquote>
                        </div>
                        <Link
                          to={`/processing?doc=${cit.document_id}`}
                          className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline"
                        >
                          <span>Open in Document Inspector</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
