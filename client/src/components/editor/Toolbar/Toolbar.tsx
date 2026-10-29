import React, { useState, useRef } from 'react';
import {
  Monitor, Tablet, Smartphone, Undo2, Redo2, Save, Eye,
  Download, Settings, Zap, ChevronDown, Circle, CheckCircle2,
} from 'lucide-react';
import { useEditorStore } from '../../../store/editorStore';
import type { Breakpoint } from '../../../types';

interface ToolbarProps {
  onSave: () => void;
  onPreview: () => void;
  onExport: () => void;
  onSettings: () => void;
}

const BREAKPOINTS: { key: Breakpoint; icon: React.ReactNode; label: string; width: string }[] = [
  { key: 'desktop', icon: <Monitor size={15} />, label: 'Desktop', width: '100%' },
  { key: 'tablet',  icon: <Tablet size={15} />,  label: 'Tablet',  width: '768px' },
  { key: 'mobile',  icon: <Smartphone size={15} />, label: 'Mobile', width: '390px' },
];

export function Toolbar({ onSave, onPreview, onExport, onSettings }: ToolbarProps) {
  const { project, isDirty, isSaving, previewMode, canUndo, canRedo, undo, redo, setPreviewMode, updateProjectName } = useEditorStore();
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  const startEditName = () => {
    setNameVal(project?.name ?? '');
    setEditingName(true);
    setTimeout(() => nameRef.current?.select(), 50);
  };

  const commitName = () => {
    if (nameVal.trim()) updateProjectName(nameVal.trim());
    setEditingName(false);
  };

  return (
    <header className="flex items-center justify-between h-[var(--toolbar-h)] px-3 border-b border-surface-800 bg-surface-950 shrink-0 z-50">
      {/* Left: Logo + project name */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 mr-1">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-[13px] text-white hidden sm:block">WebCraft</span>
        </div>

        <div className="w-px h-5 bg-surface-800" />

        {/* Project name inline edit */}
        {editingName ? (
          <input
            ref={nameRef}
            value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') setEditingName(false); }}
            className="bg-surface-800 border border-brand-500 rounded px-2 py-0.5 text-[13px] text-white outline-none w-44"
            autoFocus
          />
        ) : (
          <button
            onClick={startEditName}
            className="text-[13px] font-medium text-surface-200 hover:text-white transition-colors truncate max-w-[160px]"
            title="Click to rename"
          >
            {project?.name ?? 'Untitled Project'}
          </button>
        )}

        {/* Save status */}
        <div className="flex items-center gap-1.5 ml-1">
          {isSaving ? (
            <span className="text-[11px] text-surface-400 flex items-center gap-1">
              <div className="w-3 h-3 border border-surface-500 border-t-brand-400 rounded-full animate-spin" />
              Saving…
            </span>
          ) : isDirty ? (
            <span className="text-[11px] text-amber-400 flex items-center gap-1">
              <Circle size={6} className="fill-amber-400" /> Unsaved
            </span>
          ) : (
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={10} /> Saved
            </span>
          )}
        </div>
      </div>

      {/* Center: breakpoint switcher */}
      <div className="flex items-center gap-0.5 bg-surface-900 rounded-lg p-0.5 border border-surface-800">
        {BREAKPOINTS.map(bp => (
          <button
            key={bp.key}
            onClick={() => setPreviewMode(bp.key)}
            title={`${bp.label} (${bp.width})`}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all',
              previewMode === bp.key
                ? 'bg-surface-700 text-white shadow'
                : 'text-surface-400 hover:text-surface-200',
            ].join(' ')}
          >
            {bp.icon}
            <span className="hidden md:inline">{bp.label}</span>
          </button>
        ))}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        {/* Undo/Redo */}
        <button
          onClick={undo}
          disabled={!canUndo()}
          title="Undo (Ctrl+Z)"
          className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Undo2 size={15} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo()}
          title="Redo (Ctrl+Y)"
          className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Redo2 size={15} />
        </button>

        <div className="w-px h-5 bg-surface-800 mx-1" />

        <button onClick={onSave} className="btn-ghost" title="Save (Ctrl+S)">
          <Save size={15} />
        </button>
        <button onClick={onSettings} className="btn-ghost" title="Settings">
          <Settings size={15} />
        </button>

        <div className="w-px h-5 bg-surface-800 mx-1" />

        <button onClick={onPreview} className="btn-secondary text-[12px] py-1.5 px-3">
          <Eye size={14} /> Preview
        </button>
        <button onClick={onExport} className="btn-primary text-[12px] py-1.5 px-3">
          <Download size={14} /> Export
        </button>
      </div>
    </header>
  );
}
