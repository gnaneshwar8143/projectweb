import React, { useState } from 'react';
import {
  X, ChevronDown, ChevronRight, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, Link, Plus, Trash2,
} from 'lucide-react';
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

function CardPanel({ element, onUpdate }: { element: any; onUpdate: (u: any) => void }) {
  return (
    <Collapsible title="Card Settings">
      <Row label="Title">
        <Input value={element.title} onChange={v => onUpdate({ title: v })} placeholder="Card title" />
      </Row>
      <div className="mb-2.5">
        <Label>Description</Label>
        <textarea
          value={element.description}
          onChange={e => onUpdate({ description: e.target.value })}
          rows={3}
          className="input-base text-[12px] mt-1 resize-none w-full"
          placeholder="Card description"
        />
      </div>
      <Row label="Image URL">
        <Input value={element.image ?? ''} onChange={v => onUpdate({ image: v })} placeholder="https://…" />
      </Row>
      <Row label="Button Text">
        <Input value={element.buttonText ?? ''} onChange={v => onUpdate({ buttonText: v })} placeholder="Learn More" />
      </Row>
      <Row label="Button Link">
        <Input value={element.buttonHref ?? ''} onChange={v => onUpdate({ buttonHref: v })} placeholder="#" />
      </Row>
    </Collapsible>
  );
}

function NavbarPanel({ element, onUpdate }: { element: any; onUpdate: (u: any) => void }) {
  const links = element.links ?? [];

  const updateLink = (idx: number, key: string, val: string) => {
    const updated = links.map((l: any, i: number) => i === idx ? { ...l, [key]: val } : l);
    onUpdate({ links: updated });
  };

  const addLink = () => {
    onUpdate({ links: [...links, { label: 'New Link', href: '#' }] });
  };

  const removeLink = (idx: number) => {
    onUpdate({ links: links.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <Collapsible title="Navbar Settings">
      <Row label="Logo Text">
        <Input value={element.logo} onChange={v => onUpdate({ logo: v })} placeholder="Brand" />
      </Row>
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-surface-400">Navigation Links</span>
          <button onClick={addLink} className="btn-ghost text-[10px] py-0.5 px-1.5 flex items-center gap-1 text-brand-400">
            <Plus size={10} /> Add Link
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {links.map((link: any, i: number) => (
            <div key={i} className="flex items-center gap-1.5 bg-surface-900 p-2 rounded border border-surface-800">
              <input
                value={link.label}
                onChange={e => updateLink(i, 'label', e.target.value)}
                placeholder="Label"
                className="input-base text-[11px] py-1 flex-1"
              />
              <input
                value={link.href}
                onChange={e => updateLink(i, 'href', e.target.value)}
                placeholder="URL"
                className="input-base text-[11px] py-1 flex-1"
              />
              <button onClick={() => removeLink(i)} className="btn-ghost text-red-400 p-1">
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Collapsible>
  );
}

function TestimonialPanel({ element, onUpdate }: { element: any; onUpdate: (u: any) => void }) {
  return (
    <Collapsible title="Testimonial Settings">
      <div className="mb-2.5">
        <Label>Quote</Label>
        <textarea
          value={element.quote}
          onChange={e => onUpdate({ quote: e.target.value })}
          rows={3}
          className="input-base text-[12px] mt-1 resize-none w-full"
          placeholder="Quote text..."
        />
      </div>
      <Row label="Author">
        <Input value={element.author} onChange={v => onUpdate({ author: v })} placeholder="Jane Doe" />
      </Row>
      <Row label="Role">
        <Input value={element.role} onChange={v => onUpdate({ role: v })} placeholder="CEO at Acme" />
      </Row>
      <Row label="Avatar URL">
        <Input value={element.avatar ?? ''} onChange={v => onUpdate({ avatar: v })} placeholder="https://…" />
      </Row>
      <Row label="Rating">
        <Select
          value={String(element.rating ?? 5)}
          onChange={v => onUpdate({ rating: parseInt(v) })}
          options={[
            { value: '5', label: '★★★★★ (5 Stars)' },
            { value: '4', label: '★★★★☆ (4 Stars)' },
            { value: '3', label: '★★★☆☆ (3 Stars)' },
            { value: '2', label: '★★☆☆☆ (2 Stars)' },
            { value: '1', label: '★☆☆☆☆ (1 Star)' },
          ]}
        />
      </Row>
    </Collapsible>
  );
}

function PricingPanel({ element, onUpdate }: { element: any; onUpdate: (u: any) => void }) {
  const plans = element.plans ?? [];

  const updatePlan = (idx: number, updates: any) => {
    const updated = plans.map((p: any, i: number) => i === idx ? { ...p, ...updates } : p);
    onUpdate({ plans: updated });
  };

  const addPlan = () => {
    onUpdate({
      plans: [
        ...plans,
        {
          name: 'New Tier',
          price: '$49',
          period: '/mo',
          features: ['Feature 1', 'Feature 2'],
          buttonText: 'Get Started',
          highlighted: false,
        },
      ],
    });
  };

  const removePlan = (idx: number) => {
    onUpdate({ plans: plans.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <Collapsible title="Pricing Tiers">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-surface-400">Plans ({plans.length})</span>
        <button onClick={addPlan} className="btn-ghost text-[10px] py-0.5 px-1.5 flex items-center gap-1 text-brand-400">
          <Plus size={10} /> Add Tier
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {plans.map((plan: any, i: number) => (
          <div key={i} className="bg-surface-900 p-3 rounded-lg border border-surface-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-surface-200">Plan #{i + 1}</span>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-surface-400 flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={plan.highlighted}
                    onChange={e => updatePlan(i, { highlighted: e.target.checked })}
                    className="accent-brand-500 rounded"
                  />
                  Featured
                </label>
                {plans.length > 1 && (
                  <button onClick={() => removePlan(i)} className="btn-ghost text-red-400 p-0.5">
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input value={plan.name} onChange={v => updatePlan(i, { name: v })} placeholder="Name" />
              <Input value={plan.price} onChange={v => updatePlan(i, { price: v })} placeholder="Price" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input value={plan.period} onChange={v => updatePlan(i, { period: v })} placeholder="Period" />
              <Input value={plan.buttonText} onChange={v => updatePlan(i, { buttonText: v })} placeholder="Button" />
            </div>
            <div>
              <span className="text-[10px] text-surface-400 block mb-1">Features (comma-separated):</span>
              <textarea
                value={plan.features?.join(', ') ?? ''}
                onChange={e => updatePlan(i, { features: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                rows={2}
                className="input-base text-[11px] py-1 resize-none w-full"
                placeholder="Feature 1, Feature 2, Feature 3"
              />
            </div>
          </div>
        ))}
      </div>
    </Collapsible>
  );
}

function FormPanel({ element, onUpdate }: { element: any; onUpdate: (u: any) => void }) {
  const fields = element.fields ?? [];

  const updateField = (idx: number, updates: any) => {
    const updated = fields.map((f: any, i: number) => i === idx ? { ...f, ...updates } : f);
    onUpdate({ fields: updated });
  };

  const addField = () => {
    onUpdate({
      fields: [...fields, { type: 'text', label: 'New Field', placeholder: 'Enter value', required: false }],
    });
  };

  const removeField = (idx: number) => {
    onUpdate({ fields: fields.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <Collapsible title="Form Settings">
      <Row label="Button Text">
        <Input value={element.submitText} onChange={v => onUpdate({ submitText: v })} placeholder="Send Message" />
      </Row>
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-surface-400">Form Fields</span>
          <button onClick={addField} className="btn-ghost text-[10px] py-0.5 px-1.5 flex items-center gap-1 text-brand-400">
            <Plus size={10} /> Add Field
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {fields.map((field: any, i: number) => (
            <div key={i} className="bg-surface-900 p-2.5 rounded border border-surface-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Input value={field.label} onChange={v => updateField(i, { label: v })} placeholder="Label" />
                <button onClick={() => removeField(i)} className="btn-ghost text-red-400 p-1 ml-1">
                  <Trash2 size={11} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <Select
                  value={field.type}
                  onChange={v => updateField(i, { type: v })}
                  options={[
                    { value: 'text', label: 'Text' },
                    { value: 'email', label: 'Email' },
                    { value: 'tel', label: 'Phone' },
                    { value: 'textarea', label: 'Textarea' },
                  ]}
                />
                <Input value={field.placeholder} onChange={v => updateField(i, { placeholder: v })} placeholder="Placeholder" />
              </div>
              <label className="text-[10px] text-surface-400 flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={e => updateField(i, { required: e.target.checked })}
                  className="accent-brand-500 rounded"
                />
                Required field
              </label>
            </div>
          ))}
        </div>
      </div>
    </Collapsible>
  );
}

function FooterPanel({ element, onUpdate }: { element: any; onUpdate: (u: any) => void }) {
  const links = element.links ?? [];

  const updateLink = (idx: number, key: string, val: string) => {
    const updated = links.map((l: any, i: number) => i === idx ? { ...l, [key]: val } : l);
    onUpdate({ links: updated });
  };

  const addLink = () => {
    onUpdate({ links: [...links, { label: 'New Link', href: '#' }] });
  };

  const removeLink = (idx: number) => {
    onUpdate({ links: links.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <Collapsible title="Footer Settings">
      <Row label="Logo Text">
        <Input value={element.logo} onChange={v => onUpdate({ logo: v })} placeholder="Brand" />
      </Row>
      <Row label="Tagline">
        <Input value={element.tagline ?? ''} onChange={v => onUpdate({ tagline: v })} placeholder="Building great things." />
      </Row>
      <Row label="Copyright">
        <Input value={element.copyright ?? ''} onChange={v => onUpdate({ copyright: v })} placeholder="© 2026 Company." />
      </Row>
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-surface-400">Footer Links</span>
          <button onClick={addLink} className="btn-ghost text-[10px] py-0.5 px-1.5 flex items-center gap-1 text-brand-400">
            <Plus size={10} /> Add Link
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {links.map((link: any, i: number) => (
            <div key={i} className="flex items-center gap-1.5 bg-surface-900 p-2 rounded border border-surface-800">
              <input
                value={link.label}
                onChange={e => updateLink(i, 'label', e.target.value)}
                placeholder="Label"
                className="input-base text-[11px] py-1 flex-1"
              />
              <input
                value={link.href}
                onChange={e => updateLink(i, 'href', e.target.value)}
                placeholder="URL"
                className="input-base text-[11px] py-1 flex-1"
              />
              <button onClick={() => removeLink(i)} className="btn-ghost text-red-400 p-1">
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Collapsible>
  );
}

function VideoPanel({ element, onUpdate }: { element: any; onUpdate: (u: any) => void }) {
  return (
    <Collapsible title="Video Settings">
      <Row label="Video URL">
        <Input value={element.src} onChange={v => onUpdate({ src: v })} placeholder="https://… or .mp4 URL" />
      </Row>
      <Row label="Poster URL">
        <Input value={element.poster ?? ''} onChange={v => onUpdate({ poster: v })} placeholder="Thumbnail URL" />
      </Row>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <label className="text-[11px] text-surface-400 flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={element.autoplay}
            onChange={e => onUpdate({ autoplay: e.target.checked })}
            className="accent-brand-500 rounded"
          />
          Autoplay
        </label>
        <label className="text-[11px] text-surface-400 flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={element.loop}
            onChange={e => onUpdate({ loop: e.target.checked })}
            className="accent-brand-500 rounded"
          />
          Loop
        </label>
        <label className="text-[11px] text-surface-400 flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={element.muted}
            onChange={e => onUpdate({ muted: e.target.checked })}
            className="accent-brand-500 rounded"
          />
          Muted
        </label>
        <label className="text-[11px] text-surface-400 flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={element.controls}
            onChange={e => onUpdate({ controls: e.target.checked })}
            className="accent-brand-500 rounded"
          />
          Controls
        </label>
      </div>
    </Collapsible>
  );
}

function GalleryPanel({ element, onUpdate }: { element: any; onUpdate: (u: any) => void }) {
  const images = element.images ?? [];

  const updateImage = (idx: number, key: string, val: string) => {
    const updated = images.map((img: any, i: number) => i === idx ? { ...img, [key]: val } : img);
    onUpdate({ images: updated });
  };

  const addImage = () => {
    onUpdate({
      images: [
        ...images,
        { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', alt: 'Gallery Image' },
      ],
    });
  };

  const removeImage = (idx: number) => {
    onUpdate({ images: images.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <Collapsible title="Gallery Settings">
      <Row label="Columns">
        <Select
          value={String(element.columns ?? 3)}
          onChange={v => onUpdate({ columns: parseInt(v) })}
          options={[
            { value: '1', label: '1 Column' },
            { value: '2', label: '2 Columns' },
            { value: '3', label: '3 Columns' },
            { value: '4', label: '4 Columns' },
          ]}
        />
      </Row>
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-surface-400">Images ({images.length})</span>
          <button onClick={addImage} className="btn-ghost text-[10px] py-0.5 px-1.5 flex items-center gap-1 text-brand-400">
            <Plus size={10} /> Add Image
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {images.map((img: any, i: number) => (
            <div key={i} className="flex items-center gap-2 bg-surface-900 p-2 rounded border border-surface-800">
              <img src={img.src} alt={img.alt} className="w-9 h-9 object-cover rounded shrink-0 bg-surface-800" />
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <input
                  value={img.src}
                  onChange={e => updateImage(i, 'src', e.target.value)}
                  placeholder="URL"
                  className="input-base text-[10px] py-0.5"
                />
                <input
                  value={img.alt}
                  onChange={e => updateImage(i, 'alt', e.target.value)}
                  placeholder="Alt text"
                  className="input-base text-[10px] py-0.5"
                />
              </div>
              <button onClick={() => removeImage(i)} className="btn-ghost text-red-400 p-1">
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Collapsible>
  );
}

function HtmlPanel({ element, onUpdate }: { element: any; onUpdate: (u: any) => void }) {
  return (
    <Collapsible title="HTML Code">
      <textarea
        value={element.html}
        onChange={e => onUpdate({ html: e.target.value })}
        rows={6}
        className="input-base text-[11px] font-mono resize-none w-full"
        placeholder="<div>Custom HTML here</div>"
      />
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
            {/* Element-specific content panels */}
            {element.type === 'heading'     && <HeadingPanel element={element} onUpdate={handleUpdate} />}
            {element.type === 'paragraph'   && <ParagraphPanel element={element} onUpdate={handleUpdate} />}
            {element.type === 'button'      && <ButtonPanel element={element} onUpdate={handleUpdate} />}
            {element.type === 'image'       && <ImagePanel element={element} onUpdate={handleUpdate} />}
            {element.type === 'card'        && <CardPanel element={element} onUpdate={handleUpdate} />}
            {element.type === 'navbar'      && <NavbarPanel element={element} onUpdate={handleUpdate} />}
            {element.type === 'pricing'     && <PricingPanel element={element} onUpdate={handleUpdate} />}
            {element.type === 'testimonial' && <TestimonialPanel element={element} onUpdate={handleUpdate} />}
            {element.type === 'form'        && <FormPanel element={element} onUpdate={handleUpdate} />}
            {element.type === 'footer'      && <FooterPanel element={element} onUpdate={handleUpdate} />}
            {element.type === 'video'       && <VideoPanel element={element} onUpdate={handleUpdate} />}
            {element.type === 'gallery'     && <GalleryPanel element={element} onUpdate={handleUpdate} />}
            {element.type === 'html'        && <HtmlPanel element={element} onUpdate={handleUpdate} />}

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
