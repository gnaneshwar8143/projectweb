import React from 'react';
import { useEditorStore } from '../../../store/editorStore';
import { DEFAULT_THEME } from '../../../types';
import type { ThemeConfig } from '../../../types';

const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat',
  'Raleway', 'Nunito', 'Playfair Display', 'Merriweather', 'DM Sans',
  'Space Grotesk', 'Sora', 'Outfit', 'Plus Jakarta Sans',
];

const BORDER_RADIUS_OPTIONS: { value: ThemeConfig['borderRadius']; label: string }[] = [
  { value: 'none', label: 'None — 0px' },
  { value: 'sm',   label: 'Small — 4px' },
  { value: 'md',   label: 'Medium — 8px' },
  { value: 'lg',   label: 'Large — 12px' },
  { value: 'xl',   label: 'XL — 16px' },
  { value: 'full', label: 'Full — pill' },
];

interface ColorRowProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}
function ColorRow({ label, value, onChange }: ColorRowProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-surface-300 shrink-0 w-28">{label}</span>
      <div className="flex items-center gap-2 flex-1">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-surface-700 bg-surface-800 p-0.5 cursor-pointer shrink-0"
        />
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="input-base text-[11px] font-mono py-1.5 flex-1 min-w-0"
          maxLength={7}
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

export function ThemePanel() {
  const { project, updateTheme } = useEditorStore();
  const theme = project?.theme ?? DEFAULT_THEME;

  const set = (key: keyof ThemeConfig) => (value: string) =>
    updateTheme({ [key]: value } as Partial<ThemeConfig>);

  if (!project) return (
    <p className="text-[12px] text-surface-500 p-4 text-center">No project loaded</p>
  );

  return (
    <div className="p-3 flex flex-col gap-5">
      {/* Colors */}
      <section>
        <p className="panel-label mb-3">🎨 Brand Colors</p>
        <div className="flex flex-col gap-3">
          <ColorRow label="Primary"    value={theme.primaryColor}    onChange={set('primaryColor')} />
          <ColorRow label="Secondary"  value={theme.secondaryColor}  onChange={set('secondaryColor')} />
          <ColorRow label="Accent"     value={theme.accentColor}     onChange={set('accentColor')} />
          <ColorRow label="Text"       value={theme.textColor}       onChange={set('textColor')} />
          <ColorRow label="Background" value={theme.backgroundColor} onChange={set('backgroundColor')} />
        </div>
      </section>

      <div className="border-t border-surface-800" />

      {/* Typography */}
      <section>
        <p className="panel-label mb-3">🔤 Typography</p>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] text-surface-400 block mb-1">Heading Font</label>
            <select
              value={theme.headingFont}
              onChange={e => updateTheme({ headingFont: e.target.value })}
              className="input-base text-[12px] py-1.5 w-full"
            >
              {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-surface-400 block mb-1">Body Font</label>
            <select
              value={theme.bodyFont}
              onChange={e => updateTheme({ bodyFont: e.target.value })}
              className="input-base text-[12px] py-1.5 w-full"
            >
              {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
      </section>

      <div className="border-t border-surface-800" />

      {/* Border radius */}
      <section>
        <p className="panel-label mb-3">⬜ Border Radius</p>
        <div className="grid grid-cols-2 gap-1.5">
          {BORDER_RADIUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => updateTheme({ borderRadius: opt.value })}
              className={[
                'px-3 py-2 rounded-lg text-[11px] font-medium border transition-all text-left',
                theme.borderRadius === opt.value
                  ? 'bg-brand-600/20 border-brand-500 text-brand-300'
                  : 'bg-surface-900 border-surface-700 text-surface-400 hover:border-surface-600 hover:text-surface-200',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <div className="border-t border-surface-800" />

      {/* Live preview chip */}
      <section>
        <p className="panel-label mb-3">👁 Preview</p>
        <div
          className="rounded-xl p-5 flex flex-col gap-3 border border-surface-700"
          style={{ backgroundColor: theme.backgroundColor }}
        >
          <h3 style={{ fontFamily: `'${theme.headingFont}', sans-serif`, color: theme.textColor, margin: 0, fontSize: '18px', fontWeight: 700 }}>
            Heading Preview
          </h3>
          <p style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, color: theme.textColor, opacity: 0.7, margin: 0, fontSize: '13px', lineHeight: 1.6 }}>
            Body text preview with your selected font.
          </p>
          <div className="flex gap-2">
            <span style={{ backgroundColor: theme.primaryColor, color: '#fff', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
              Primary
            </span>
            <span style={{ backgroundColor: theme.accentColor, color: '#fff', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
              Accent
            </span>
          </div>
        </div>
      </section>

      {/* Reset */}
      <button
        onClick={() => updateTheme(DEFAULT_THEME)}
        className="btn-secondary w-full justify-center text-[12px] py-2"
      >
        Reset to defaults
      </button>
    </div>
  );
}
