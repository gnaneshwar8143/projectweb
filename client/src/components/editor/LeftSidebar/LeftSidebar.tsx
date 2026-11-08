import React, { useState } from 'react';
import {
  Type, Image as ImageIcon, MousePointer, Video, Minus, Layout, Maximize,
  Navigation, Grid, CreditCard, DollarSign, MessageSquare, FileText, Anchor,
  Layers, FileCode, Plus, Trash2, Copy, ChevronRight, Upload,
  Search, Check, Palette, Sparkles, Columns2, Columns3,
} from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { useEditorStore } from '../../../store/editorStore';
import { TEMPLATES } from '../../../templates';
import type { ElementType } from '../../../types';
import { v4 as uuid } from 'uuid';
import { ThemePanel } from './ThemePanel';
import { AiPanel } from './AiPanel';

// ─── Draggable sidebar element ────────────────────────────────────────────────
function DraggableElement({ type, label, icon, variant }: { type: ElementType; label: string; icon: React.ReactNode; variant?: '2col' | '3col' }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${type}${variant ? `-${variant}` : ''}`,
    // label is required by SidebarDragPreview for the overlay
    data: { fromSidebar: true, elementType: type, label, variant },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={[
        'flex items-center gap-2 px-3 py-2 rounded-lg cursor-grab transition-all text-[12px] font-medium',
        'text-surface-300 hover:bg-surface-800 hover:text-white border border-transparent hover:border-surface-700',
        isDragging ? 'opacity-50 shadow-lg scale-105 bg-surface-800 border-surface-600' : '',
      ].join(' ')}
    >
      <span className="text-brand-400 shrink-0">{icon}</span>
      {label}
    </div>
  );
}

const ELEMENT_GROUPS = [
  {
    label: 'Text',
    items: [
      { type: 'heading' as ElementType, label: 'Heading', icon: <Type size={14} /> },
      { type: 'paragraph' as ElementType, label: 'Paragraph', icon: <FileText size={14} /> },
    ],
  },
  {
    label: 'Media',
    items: [
      { type: 'image' as ElementType, label: 'Image', icon: <ImageIcon size={14} /> },
      { type: 'video' as ElementType, label: 'Video', icon: <Video size={14} /> },
      { type: 'gallery' as ElementType, label: 'Gallery', icon: <Grid size={14} /> },
    ],
  },
  {
    label: 'Interactive',
    items: [
      { type: 'button' as ElementType, label: 'Button', icon: <MousePointer size={14} /> },
      { type: 'form' as ElementType, label: 'Contact Form', icon: <FileCode size={14} /> },
    ],
  },
  {
    label: 'Layout',
    items: [
      { type: 'container' as ElementType, label: 'Container', icon: <Layout size={14} /> },
      { type: 'container' as ElementType, label: '2 Columns', variant: '2col' as const, icon: <Columns2 size={14} /> },
      { type: 'container' as ElementType, label: '3 Columns', variant: '3col' as const, icon: <Columns3 size={14} /> },
      { type: 'spacer' as ElementType, label: 'Spacer', icon: <Maximize size={14} /> },
      { type: 'divider' as ElementType, label: 'Divider', icon: <Minus size={14} /> },
    ],
  },
  {
    label: 'Sections',
    items: [
      { type: 'navbar' as ElementType, label: 'Navbar', icon: <Navigation size={14} /> },
      { type: 'card' as ElementType, label: 'Card', icon: <CreditCard size={14} /> },
      { type: 'pricing' as ElementType, label: 'Pricing Table', icon: <DollarSign size={14} /> },
      { type: 'testimonial' as ElementType, label: 'Testimonial', icon: <MessageSquare size={14} /> },
      { type: 'footer' as ElementType, label: 'Footer', icon: <Anchor size={14} /> },
    ],
  },
];

// ─── Elements Tab ─────────────────────────────────────────────────────────────
function ElementsTab() {
  const [search, setSearch] = useState('');
  const q = search.toLowerCase();
  const filtered = ELEMENT_GROUPS.map(g => ({
    ...g,
    items: g.items.filter(i => !q || i.label.toLowerCase().includes(q)),
  })).filter(g => g.items.length > 0);

  return (
    <div className="flex flex-col gap-1 p-3">
      <div className="relative mb-3">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search elements…"
          className="input-base pl-7 text-[12px]"
        />
      </div>
      {filtered.map(group => (
        <div key={group.label} className="mb-3">
          <p className="panel-label px-1 mb-2">{group.label}</p>
          <div className="grid grid-cols-2 gap-1">
            {group.items.map(item => (
              <DraggableElement key={item.label} {...item} />
            ))}
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <p className="text-[12px] text-surface-500 text-center py-8">No elements match "{search}"</p>
      )}
    </div>
  );
}

// ─── Templates Tab ────────────────────────────────────────────────────────────
function TemplatesTab() {
  const { loadTemplate, pushHistory } = useEditorStore();
  const [applied, setApplied] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const applyTemplate = (id: string) => {
    const tpl = TEMPLATES.find(t => t.id === id);
    if (!tpl) return;
    pushHistory('Load template');
    loadTemplate(tpl.build());
    setApplied(id);
    setConfirming(null);
  };

  return (
    <div className="p-3 flex flex-col gap-3">
      {TEMPLATES.map(tpl => (
        <div key={tpl.id} className="rounded-xl overflow-hidden border border-surface-800 hover:border-surface-700 transition-all group">
          <div className="relative h-28 overflow-hidden">
            <img src={tpl.thumbnail} alt={tpl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute bottom-2 left-2 text-[10px] font-semibold bg-brand-600/80 text-white px-2 py-0.5 rounded-full">
              {tpl.category}
            </span>
          </div>
          <div className="p-3 bg-surface-900">
            <p className="text-[13px] font-semibold text-surface-100 mb-0.5">{tpl.name}</p>
            <p className="text-[11px] text-surface-400 mb-3 leading-relaxed">{tpl.description}</p>
            {confirming === tpl.id ? (
              <div className="flex gap-1">
                <button onClick={() => applyTemplate(tpl.id)} className="btn-primary text-[11px] py-1 flex-1 justify-center">
                  <Check size={11} /> Apply
                </button>
                <button onClick={() => setConfirming(null)} className="btn-secondary text-[11px] py-1 flex-1 justify-center">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(tpl.id)}
                className="btn-secondary text-[11px] py-1 w-full justify-center"
              >
                {applied === tpl.id ? <><Check size={11} className="text-emerald-400" /> Applied</> : 'Use Template'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Pages Tab ────────────────────────────────────────────────────────────────
function PagesTab() {
  const { project, activePageId, setActivePage, addPage, renamePage, deletePage, duplicatePage } = useEditorStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');

  const pages = project?.pages ?? [];

  const startRename = (id: string, name: string) => { setEditingId(id); setEditVal(name); };
  const commitRename = (id: string) => { renamePage(id, editVal); setEditingId(null); };

  return (
    <div className="p-3 flex flex-col gap-2">
      <button onClick={addPage} className="btn-primary w-full justify-center text-[12px]">
        <Plus size={13} /> Add Page
      </button>
      <div className="flex flex-col gap-1 mt-2">
        {pages.map(page => (
          <div
            key={page.id}
            onClick={() => setActivePage(page.id)}
            className={[
              'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all',
              activePageId === page.id ? 'bg-brand-600/20 border border-brand-600/30' : 'hover:bg-surface-800 border border-transparent',
            ].join(' ')}
          >
            {editingId === page.id ? (
              <input
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
                onBlur={() => commitRename(page.id)}
                onKeyDown={e => { if (e.key === 'Enter') commitRename(page.id); if (e.key === 'Escape') setEditingId(null); }}
                className="flex-1 bg-transparent border-b border-brand-500 text-[12px] text-white outline-none"
                autoFocus
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <>
                <ChevronRight size={12} className={activePageId === page.id ? 'text-brand-400' : 'text-surface-600'} />
                <span className={`flex-1 text-[12px] font-medium truncate ${activePageId === page.id ? 'text-brand-300' : 'text-surface-300'}`}>
                  {page.name}
                </span>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity" onClick={e => e.stopPropagation()}>
                  <button onClick={() => startRename(page.id, page.name)} className="btn-ghost p-0.5" title="Rename">
                    <Type size={10} />
                  </button>
                  <button onClick={() => duplicatePage(page.id)} className="btn-ghost p-0.5" title="Duplicate">
                    <Copy size={10} />
                  </button>
                  {pages.length > 1 && (
                    <button onClick={() => deletePage(page.id)} className="btn-ghost p-0.5 text-red-400 hover:text-red-300" title="Delete">
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Layers Tab ───────────────────────────────────────────────────────────────
function LayersTab() {
  const { project, activePageId, selectedSectionId, selectedElementId, selectElement, selectSection } = useEditorStore();
  const page = project?.pages.find(p => p.id === activePageId);

  if (!page) return <p className="text-[12px] text-surface-500 p-4">No page selected</p>;

  return (
    <div className="p-3">
      {page.sections.length === 0 ? (
        <p className="text-[12px] text-surface-500 text-center py-8">No sections yet</p>
      ) : (
        <div className="flex flex-col gap-1">
          {page.sections.map(section => (
            <div key={section.id} className="border border-surface-800 rounded-lg overflow-hidden">
              <button
                onClick={() => selectSection(section.id)}
                className={[
                  'w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-left transition-all',
                  selectedSectionId === section.id && !selectedElementId ? 'bg-brand-600/20 text-brand-300' : 'text-surface-300 hover:bg-surface-800',
                ].join(' ')}
              >
                <Layout size={11} className="text-brand-500 shrink-0" />
                {section.name}
              </button>
              {section.elements.map(el => (
                <button
                  key={el.id}
                  onClick={() => selectElement(section.id, el.id)}
                  className={[
                    'w-full flex items-center gap-2 pl-7 pr-3 py-1.5 text-[11px] text-left transition-all',
                    selectedElementId === el.id ? 'bg-brand-600/15 text-brand-400' : 'text-surface-500 hover:bg-surface-800 hover:text-surface-300',
                  ].join(' ')}
                >
                  <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                  {el.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Assets Tab ───────────────────────────────────────────────────────────────
function AssetsTab() {
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState<{ id: string; name: string; url: string }[]>([]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setAssets(prev => [...prev, { id: uuid(), name: file.name, url: reader.result as string }]);
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="p-3 flex flex-col gap-3">
      <label className="btn-primary w-full justify-center text-[12px] cursor-pointer">
        <Upload size={13} /> {uploading ? 'Uploading…' : 'Upload Image'}
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </label>
      {assets.length === 0 ? (
        <div className="text-center py-10">
          <ImageIcon size={28} className="text-surface-600 mx-auto mb-2" />
          <p className="text-[12px] text-surface-500">No assets yet.<br />Upload images to use them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {assets.map(asset => (
            <div key={asset.id} className="relative group rounded-lg overflow-hidden border border-surface-800 aspect-square bg-surface-900">
              <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                <button onClick={() => setAssets(prev => prev.filter(a => a.id !== asset.id))} className="btn-danger text-[10px] py-0.5 px-2">
                  <Trash2 size={10} /> Delete
                </button>
              </div>
              <p className="absolute bottom-0 left-0 right-0 text-[9px] truncate px-1 py-0.5 bg-black/60 text-surface-300">{asset.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Left Sidebar ────────────────────────────────────────────────────────
export function LeftSidebar() {
  const { sidebarTab, setSidebarTab } = useEditorStore();

  const TABS: { key: typeof sidebarTab; icon: React.ReactNode; label: string }[] = [
    { key: 'elements',  icon: <Layout size={14} />,    label: 'Elements' },
    { key: 'templates', icon: <Palette size={14} />,   label: 'Templates' },
    { key: 'pages',     icon: <FileText size={14} />,  label: 'Pages' },
    { key: 'layers',    icon: <Layers size={14} />,    label: 'Layers' },
    { key: 'assets',    icon: <ImageIcon size={14} />, label: 'Assets' },
    { key: 'theme',     icon: <Palette size={14} />,   label: 'Theme' },
    { key: 'ai',        icon: <Sparkles size={14} />,  label: 'AI' },
  ];

  return (
    <aside className="w-[var(--sidebar-w)] flex flex-col bg-surface-950 border-r border-surface-800 shrink-0 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-surface-800 shrink-0">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSidebarTab(tab.key)}
            title={tab.label}
            className={[
              'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-semibold uppercase tracking-wide transition-all border-b-2',
              sidebarTab === tab.key
                ? 'text-brand-400 border-brand-500 bg-surface-900'
                : 'text-surface-500 border-transparent hover:text-surface-300',
            ].join(' ')}
          >
            {tab.icon}
            <span className="hidden lg:block">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {sidebarTab === 'elements'  && <ElementsTab />}
        {sidebarTab === 'templates' && <TemplatesTab />}
        {sidebarTab === 'pages'     && <PagesTab />}
        {sidebarTab === 'layers'    && <LayersTab />}
        {sidebarTab === 'assets'    && <AssetsTab />}
        {sidebarTab === 'theme'     && <ThemePanel />}
        {sidebarTab === 'ai'        && <AiPanel />}
      </div>
    </aside>
  );
}
