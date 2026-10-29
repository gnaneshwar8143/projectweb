import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link } from 'lucide-react';
import { useEditorStore } from '../../../store/editorStore';
import type { ElementStyles, WebElement } from '../../../types';

// ─── Reusable mini components ─────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[11px] text-surface-400 w-20 shrink-0">{children}</label>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <Label>{label}</Label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Input({ value, onChange, type = 'text', placeholder = '' }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-base text-[12px] py-1"
    />
  );
}

function NumberInput({ value, onChange, min, max, unit = 'px' }: { value: string; onChange: (v: string) => void; min?: number; max?: number; unit?: string }) {
  const num = parseFloat(value) || 0;
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={num}
        min={min}
        max={max}
        onChange={e => onChange(`${e.target.value}${unit}`)}
        className="input-base text-[12px] py-1 w-20"
      />
      <span className="text-[10px] text-surface-500">{unit}</span>
    </div>
  );
}

function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="color"
          value={value || '#000000'}
          onChange={e => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border border-surface-700 bg-surface-800 p-0.5"
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="#000000 or rgba()"
        className="input-base text-[11px] py-1 flex-1 font-mono"
      />
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="input-base text-[12px] py-1 appearance-none cursor-pointer"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Collapsible({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-surface-800">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-surface-400 hover:text-surface-200 transition-colors"
      >
        {title}
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// ─── Style helpers ────────────────────────────────────────────────────────────
function parsePx(v: string | undefined, fallback = 0): number {
  if (!v) return fallback;
  return parseFloat(v) || fallback;
}

// ─── Style panels ─────────────────────────────────────────────────────────────
function TypographyPanel({ styles, onStyle }: { styles: ElementStyles; onStyle: (k: keyof ElementStyles, v: string) => void }) {
  const FONT_FAMILIES = [
    { value: 'Inter, sans-serif', label: 'Inter' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Playfair Display, serif', label: 'Playfair Display' },
    { value: 'Roboto, sans-serif', label: 'Roboto' },
    { value: 'Montserrat, sans-serif', label: 'Montserrat' },
    { value: 'Poppins, sans-serif', label: 'Poppins' },
    { value: 'Oswald, sans-serif', label: 'Oswald' },
    { value: 'JetBrains Mono, monospace', label: 'JetBrains Mono' },
  ];

  const WEIGHTS = [
    { value: '300', label: 'Light (300)' }, { value: '400', label: 'Regular (400)' },
    { value: '500', label: 'Medium (500)' }, { value: '600', label: 'SemiBold (600)' },
    { value: '700', label: 'Bold (700)' }, { value: '800', label: 'ExtraBold (800)' }, { value: '900', label: 'Black (900)' },
  ];

  return (
    <>
      <Row label="Font">
        <Select value={styles.fontFamily ?? ''} onChange={v => onStyle('fontFamily', v)} options={FONT_FAMILIES} />
      </Row>
      <Row label="Size">
        <NumberInput value={styles.fontSize ?? '16px'} onChange={v => onStyle('fontSize', v)} />
      </Row>
      <Row label="Weight">
        <Select value={styles.fontWeight ?? '400'} onChange={v => onStyle('fontWeight', v)} options={WEIGHTS} />
      </Row>
      <Row label="Color">
        <ColorInput value={styles.color ?? '#000000'} onChange={v => onStyle('color', v)} />
      </Row>
      <Row label="Align">
        <div className="flex gap-1">
          {(['left', 'center', 'right', 'justify'] as const).map(align => {
            const Icon = { left: AlignLeft, center: AlignCenter, right: AlignRight, justify: AlignJustify }[align];
            return (
              <button
                key={align}
                onClick={() => onStyle('textAlign', align)}
                className={`p-1.5 rounded transition-all ${styles.textAlign === align ? 'bg-brand-600 text-white' : 'btn-ghost'}`}
              >
                <Icon size={12} />
              </button>
            );
          })}
        </div>
      </Row>
      <Row label="Line H.">
        <Input value={styles.lineHeight ?? '1.5'} onChange={v => onStyle('lineHeight', v)} placeholder="1.5" />
      </Row>
      <Row label="Spacing">
        <Input value={styles.letterSpacing ?? '0'} onChange={v => onStyle('letterSpacing', v)} placeholder="0px" />
      </Row>
    </>
  );
}

function SpacingPanel({ styles, onStyle }: { styles: ElementStyles; onStyle: (k: keyof ElementStyles, v: string) => void }) {
  const SpacingInput = ({ label, prop }: { label: string; prop: keyof ElementStyles }) => (
    <div className="flex flex-col items-center gap-1">
      <input
        type="number"
        value={parsePx(styles[prop] as string)}
        onChange={e => onStyle(prop, `${e.target.value}px`)}
        className="input-base text-[11px] py-0.5 text-center w-14"
      />
      <span className="text-[9px] text-surface-500">{label}</span>
    </div>
  );

  return (
    <>
      <p className="panel-label mb-2">Padding</p>
      <div className="grid grid-cols-3 gap-1 mb-1">
        <div />
        <SpacingInput label="Top" prop="paddingTop" />
        <div />
        <SpacingInput label="Left" prop="paddingLeft" />
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border border-surface-600 rounded" />
        </div>
        <SpacingInput label="Right" prop="paddingRight" />
        <div />
        <SpacingInput label="Bottom" prop="paddingBottom" />
        <div />
      </div>
      <p className="panel-label mb-2 mt-3">Margin</p>
      <div className="grid grid-cols-3 gap-1">
        <div />
        <SpacingInput label="Top" prop="marginTop" />
        <div />
        <SpacingInput label="Left" prop="marginLeft" />
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border border-dashed border-surface-600 rounded" />
        </div>
        <SpacingInput label="Right" prop="marginRight" />
        <div />
        <SpacingInput label="Bottom" prop="marginBottom" />
        <div />
      </div>
    </>
  );
}

function SizePanel({ styles, onStyle }: { styles: ElementStyles; onStyle: (k: keyof ElementStyles, v: string) => void }) {
  return (
    <>
      <Row label="Width">
        <Input value={styles.width ?? ''} onChange={v => onStyle('width', v)} placeholder="auto, 100%, 200px" />
      </Row>
      <Row label="Max W">
        <Input value={styles.maxWidth ?? ''} onChange={v => onStyle('maxWidth', v)} placeholder="none" />
      </Row>
      <Row label="Height">
        <Input value={styles.height ?? ''} onChange={v => onStyle('height', v)} placeholder="auto" />
      </Row>
      <Row label="Min H">
        <Input value={styles.minHeight ?? ''} onChange={v => onStyle('minHeight', v)} placeholder="0px" />
      </Row>
    </>
  );
}

function BackgroundPanel({ styles, onStyle }: { styles: ElementStyles; onStyle: (k: keyof ElementStyles, v: string) => void }) {
  return (
    <>
      <Row label="Color">
        <ColorInput value={styles.backgroundColor ?? ''} onChange={v => onStyle('backgroundColor', v)} />
      </Row>
      <Row label="Image">
        <Input value={styles.backgroundImage ?? ''} onChange={v => onStyle('backgroundImage', v)} placeholder="url(...)" />
      </Row>
      <Row label="Size">
        <Select value={styles.backgroundSize ?? 'cover'} onChange={v => onStyle('backgroundSize', v)} options={[
          { value: 'cover', label: 'Cover' }, { value: 'contain', label: 'Contain' }, { value: 'auto', label: 'Auto' }, { value: '100% 100%', label: 'Stretch' },
        ]} />
      </Row>
      <Row label="Position">
        <Select value={styles.backgroundPosition ?? 'center'} onChange={v => onStyle('backgroundPosition', v)} options={[
          { value: 'center', label: 'Center' }, { value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' },
        ]} />
      </Row>
    </>
  );
}

function BorderPanel({ styles, onStyle }: { styles: ElementStyles; onStyle: (k: keyof ElementStyles, v: string) => void }) {
  return (
    <>
      <Row label="Border">
        <Input value={styles.border ?? ''} onChange={v => onStyle('border', v)} placeholder="1px solid #e2e8f0" />
      </Row>
      <Row label="Radius">
        <NumberInput value={styles.borderRadius ?? '0px'} onChange={v => onStyle('borderRadius', v)} />
      </Row>
      <Row label="Shadow">
        <Input value={styles.boxShadow ?? ''} onChange={v => onStyle('boxShadow', v)} placeholder="0 4px 24px rgba(0,0,0,0.1)" />
      </Row>
      <Row label="Opacity">
        <div className="flex items-center gap-2">
          <input
            type="range" min={0} max={1} step={0.01}
            value={parseFloat(styles.opacity ?? '1')}
            onChange={e => onStyle('opacity', e.target.value)}
            className="flex-1 accent-brand-500"
          />
          <span className="text-[11px] text-surface-400 w-8 text-right">{Math.round(parseFloat(styles.opacity ?? '1') * 100)}%</span>
        </div>
      </Row>
    </>
  );
}

function LayoutPanel({ styles, onStyle }: { styles: ElementStyles; onStyle: (k: keyof ElementStyles, v: string) => void }) {
  return (
    <>
      <Row label="Display">
        <Select value={styles.display ?? 'block'} onChange={v => onStyle('display', v)} options={[
          { value: 'block', label: 'Block' }, { value: 'flex', label: 'Flex' }, { value: 'grid', label: 'Grid' }, { value: 'inline', label: 'Inline' }, { value: 'inline-block', label: 'Inline Block' },
        ]} />
      </Row>
      {styles.display === 'flex' && (
        <>
          <Row label="Direction">
            <Select value={styles.flexDirection ?? 'row'} onChange={v => onStyle('flexDirection', v)} options={[
              { value: 'row', label: 'Row' }, { value: 'row-reverse', label: 'Row Reverse' }, { value: 'column', label: 'Column' }, { value: 'column-reverse', label: 'Column Reverse' },
            ]} />
          </Row>
          <Row label="Justify">
            <Select value={styles.justifyContent ?? 'flex-start'} onChange={v => onStyle('justifyContent', v)} options={[
              { value: 'flex-start', label: 'Start' }, { value: 'center', label: 'Center' }, { value: 'flex-end', label: 'End' }, { value: 'space-between', label: 'Space Between' }, { value: 'space-around', label: 'Space Around' },
            ]} />
          </Row>
          <Row label="Align">
            <Select value={styles.alignItems ?? 'stretch'} onChange={v => onStyle('alignItems', v)} options={[
              { value: 'stretch', label: 'Stretch' }, { value: 'flex-start', label: 'Start' }, { value: 'center', label: 'Center' }, { value: 'flex-end', label: 'End' },
            ]} />
          </Row>
          <Row label="Wrap">
            <Select value={styles.flexWrap ?? 'nowrap'} onChange={v => onStyle('flexWrap', v)} options={[
              { value: 'nowrap', label: 'No Wrap' }, { value: 'wrap', label: 'Wrap' },
            ]} />
          </Row>
        </>
      )}
      {styles.display === 'grid' && (
        <Row label="Columns">
          <Input value={styles.gridTemplateColumns ?? ''} onChange={v => onStyle('gridTemplateColumns', v)} placeholder="repeat(3, 1fr)" />
        </Row>
      )}
      <Row label="Gap">
        <Input value={styles.gap ?? ''} onChange={v => onStyle('gap', v)} placeholder="16px" />
      </Row>
    </>
  );
}

// ─── Element-specific panels ──────────────────────────────────────────────────
function HeadingPanel({ element, onUpdate }: { element: any; onUpdate: (u: any) => void }) {
  return (
    <Collapsible title="Content">
      <Row label="Level">
        <Select value={String(element.level)} onChange={v => onUpdate({ level: parseInt(v) })} options={[
          { value: '1', label: 'H1 — Title' }, { value: '2', label: 'H2 — Section' },
          { value: '3', label: 'H3 — Subsection' }, { value: '4', label: 'H4' },
        ]} />
      </Row>
      <div className="mb-2">
        <Label>Text</Label>
        <textarea
          value={element.content}
          onChange={e => onUpdate({ content: e.target.value })}
          rows={3}
          className="input-base text-[12px] mt-1 resize-none"
        />
      </div>
    </Collapsible>
  );
}

function ParagraphPanel({ element, onUpdate }: { element: any; onUpdate: (u: any) => void }) {
  return (
    <Collapsible title="Content">
      <textarea
        value={element.content}
        onChange={e => onUpdate({ content: e.target.value })}
        rows={5}
        className="input-base text-[12px] resize-none"
        placeholder="Enter text content…"
      />
    </Collapsible>
  );
}

function ButtonPanel({ element, onUpdate }: { element: any; onUpdate: (u: any) => void }) {
  return (
    <Collapsible title="Button Settings">
      <Row label="Text">
        <Input value={element.text} onChange={v => onUpdate({ text: v })} placeholder="Button text" />
      </Row>
      <Row label="URL">
        <Input value={element.href} onChange={v => onUpdate({ href: v })} placeholder="https://…" />
      </Row>
      <Row label="Target">
        <Select value={element.target} onChange={v => onUpdate({ target: v })} options={[
          { value: '_self', label: 'Same Tab' }, { value: '_blank', label: 'New Tab' },
        ]} />
      </Row>
    </Collapsible>
  );
}

function ImagePanel({ element, onUpdate }: { element: any; onUpdate: (u: any) => void }) {
  return (
    <Collapsible title="Image Settings">
      <Row label="URL">
        <Input value={element.src} onChange={v => onUpdate({ src: v })} placeholder="https://…" />
      </Row>
      <Row label="Alt Text">
        <Input value={element.alt} onChange={v => onUpdate({ alt: v })} placeholder="Describe the image" />
      </Row>
      <Row label="Fit">
        <Select value={element.styles?.objectFit ?? 'cover'} onChange={v => onUpdate({ styles: { ...element.styles, objectFit: v } })} options={[
          { value: 'cover', label: 'Cover' }, { value: 'contain', label: 'Contain' }, { value: 'fill', label: 'Fill' }, { value: 'none', label: 'None' },
        ]} />
      </Row>
    </Collapsible>
  );
}

function NoSelection() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-5">
      <div className="w-12 h-12 bg-surface-800 rounded-xl flex items-center justify-center mb-3 border border-surface-700">
        <Link size={16} className="text-surface-500" />
      </div>
      <p className="text-[13px] font-medium text-surface-300 mb-1">No Element Selected</p>
      <p className="text-[12px] text-surface-500 leading-relaxed">Click on an element in the canvas to edit its properties here.</p>
    </div>
  );
}

// ─── Main Right Panel ─────────────────────────────────────────────────────────
export function RightPanel() {
  const { project, activePageId, selectedSectionId, selectedElementId, updateElement, updateSection, pushHistory } = useEditorStore();

  const page = project?.pages.find(p => p.id === activePageId);
  const section = page?.sections.find(s => s.id === selectedSectionId);
  const element = section?.elements.find(e => e.id === selectedElementId);

  const handleStyleChange = (key: keyof ElementStyles, value: string) => {
    if (!section || !element) return;
    updateElement(section.id, element.id, {
      styles: { ...element.styles, [key]: value },
    });
  };

  const handleUpdate = (updates: Partial<WebElement>) => {
    if (!section || !element) return;
    updateElement(section.id, element.id, updates);
  };

  const handleSectionStyle = (key: keyof ElementStyles, value: string) => {
    if (!section) return;
    updateSection(section.id, { styles: { ...section.styles, [key]: value } });
  };

  return (
    <aside className="w-[var(--panel-w)] flex flex-col bg-surface-950 border-l border-surface-800 shrink-0 overflow-hidden">
      {!element && !section ? (
        <NoSelection />
      ) : element ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-800 shrink-0">
            <div>
              <p className="text-[12px] font-semibold text-surface-100 capitalize">{element.name}</p>
              <p className="text-[10px] text-surface-500 capitalize">{element.type}</p>
            </div>
            <button
              onClick={() => { pushHistory('Delete'); useEditorStore.getState().deleteElement(section!.id, element.id); }}
              className="btn-ghost text-red-400 hover:text-red-300 p-1"
            >
              <X size={13} />
            </button>
          </div>

          {/* Panels */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {/* Element-specific */}
            {element.type === 'heading'   && <HeadingPanel element={element} onUpdate={handleUpdate} />}
            {element.type === 'paragraph' && <ParagraphPanel element={element} onUpdate={handleUpdate} />}
            {element.type === 'button'    && <ButtonPanel element={element} onUpdate={handleUpdate} />}
            {element.type === 'image'     && <ImagePanel element={element} onUpdate={handleUpdate} />}

            {/* Style panels — always shown */}
            <Collapsible title="Typography">
              <TypographyPanel styles={element.styles} onStyle={handleStyleChange} />
            </Collapsible>
            <Collapsible title="Size" defaultOpen={false}>
              <SizePanel styles={element.styles} onStyle={handleStyleChange} />
            </Collapsible>
            <Collapsible title="Spacing" defaultOpen={false}>
              <SpacingPanel styles={element.styles} onStyle={handleStyleChange} />
            </Collapsible>
            <Collapsible title="Background" defaultOpen={false}>
              <BackgroundPanel styles={element.styles} onStyle={handleStyleChange} />
            </Collapsible>
            <Collapsible title="Border & Shadow" defaultOpen={false}>
              <BorderPanel styles={element.styles} onStyle={handleStyleChange} />
            </Collapsible>
            {(element.type === 'container' || element.type === 'navbar') && (
              <Collapsible title="Layout" defaultOpen={false}>
                <LayoutPanel styles={element.styles} onStyle={handleStyleChange} />
              </Collapsible>
            )}
          </div>
        </>
      ) : section ? (
        <>
          <div className="flex items-center px-4 py-3 border-b border-surface-800 shrink-0">
            <div>
              <p className="text-[12px] font-semibold text-surface-100">{section.name}</p>
              <p className="text-[10px] text-surface-500">Section</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <Collapsible title="Size">
              <SizePanel styles={section.styles} onStyle={handleSectionStyle} />
            </Collapsible>
            <Collapsible title="Spacing" defaultOpen={false}>
              <SpacingPanel styles={section.styles} onStyle={handleSectionStyle} />
            </Collapsible>
            <Collapsible title="Background" defaultOpen={false}>
              <BackgroundPanel styles={section.styles} onStyle={handleSectionStyle} />
            </Collapsible>
            <Collapsible title="Border & Shadow" defaultOpen={false}>
              <BorderPanel styles={section.styles} onStyle={handleSectionStyle} />
            </Collapsible>
            <Collapsible title="Layout" defaultOpen={false}>
              <LayoutPanel styles={section.styles} onStyle={handleSectionStyle} />
            </Collapsible>
          </div>
        </>
      ) : null}
    </aside>
  );
}
