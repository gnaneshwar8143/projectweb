import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { useEditorStore } from '../../../store/editorStore';
import { useAuthStore } from '../../../store/authStore';
import type { Section } from '../../../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const PROMPT_EXAMPLES = [
  'Modern dark-mode hero section for a SaaS startup with a bold headline and CTA',
  'Pricing table with 3 tiers (Free, Pro, Enterprise) on a dark background',
  'Testimonials section with 3 customer reviews, star ratings, and author info',
  'Contact form with name, email, and message fields on a clean white background',
  'Feature grid showing 3 benefits of a fitness app with icons and descriptions',
  'Restaurant menu section with a dark background and warm accent colors',
];

export function AiPanel() {
  const { addSection, pushHistory } = useEditorStore();
  const token = useAuthStore(s => s.token);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const generate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/ai/generate-section`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json() as { success: boolean; data?: { section: Section }; error?: string };

      if (!data.success || !data.data?.section) {
        throw new Error(data.error ?? 'Failed to generate section');
      }

      pushHistory('AI: generate section');
      addSection(data.data.section);
      setLastGenerated(data.data.section.name);
      setPrompt('');
    } catch (err: any) {
      setError(err.message ?? 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-brand-600 flex items-center justify-center shrink-0">
          <Sparkles size={14} className="text-white" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-white leading-tight">AI Section Generator</p>
          <p className="text-[10px] text-surface-500 leading-tight">Describe a section to generate it instantly</p>
        </div>
      </div>

      {/* Prompt input */}
      <div className="flex flex-col gap-2">
        <label className="panel-label">Your prompt</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate(); }}
          placeholder="Describe the section you want to create…"
          rows={4}
          className="input-base text-[12px] py-2.5 resize-none leading-relaxed"
        />
        <p className="text-[10px] text-surface-600">Tip: Press Ctrl+Enter to generate</p>
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={!prompt.trim() || loading}
        className="btn-primary w-full justify-center py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #6370f1)' }}
      >
        {loading ? (
          <><Loader2 size={14} className="animate-spin" /> Generating…</>
        ) : (
          <><Sparkles size={14} /> Generate Section</>
        )}
      </button>

      {/* Success message */}
      {lastGenerated && !loading && !error && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <span className="text-emerald-400 text-[18px]">✓</span>
          <div>
            <p className="text-[12px] font-semibold text-emerald-400">Section added!</p>
            <p className="text-[11px] text-surface-500 truncate">"{lastGenerated}"</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-[12px] text-red-400">{error}</p>
        </div>
      )}

      <div className="border-t border-surface-800" />

      {/* Example prompts */}
      <div>
        <p className="panel-label mb-2">✨ Example prompts</p>
        <div className="flex flex-col gap-1">
          {PROMPT_EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => setPrompt(ex)}
              className="group flex items-start gap-2 px-3 py-2 rounded-lg text-left hover:bg-surface-800 transition-colors border border-transparent hover:border-surface-700"
            >
              <ChevronRight size={11} className="text-brand-500 shrink-0 mt-1" />
              <span className="text-[11px] text-surface-400 group-hover:text-surface-200 leading-relaxed">{ex}</span>
            </button>
          ))}
        </div>
      </div>

      {/* API key notice */}
      <div className="px-3 py-3 bg-surface-900 border border-surface-800 rounded-xl">
        <p className="text-[11px] text-surface-500 leading-relaxed">
          <span className="text-surface-300 font-semibold">Pro tip:</span> Add{' '}
          <code className="text-brand-400 bg-surface-800 px-1 rounded text-[10px]">OPENAI_API_KEY</code> or{' '}
          <code className="text-brand-400 bg-surface-800 px-1 rounded text-[10px]">GOOGLE_API_KEY</code>{' '}
          to your server <code className="text-[10px] text-surface-400">.env</code> for AI-powered generation.
          Without a key, smart rule-based generation is used.
        </p>
      </div>
    </div>
  );
}
