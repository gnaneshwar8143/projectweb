import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Toolbar } from './Toolbar/Toolbar';
import { LeftSidebar } from './LeftSidebar/LeftSidebar';
import { Canvas, EditorDndProvider } from './Canvas/Canvas';
import { RightPanel } from './RightPanel/RightPanel';
import { useEditorStore } from '../../store/editorStore';
import { projectsApi } from '../../api';
import { exportWebsite, exportToReactComponent } from '../../export/exportEngine';
import { X, Globe, Monitor, Tablet, Smartphone } from 'lucide-react';
import { ElementRenderer } from '../renderer/ElementRenderer';
import { DEFAULT_THEME, BORDER_RADIUS_MAP } from '../../types';

interface EditorProps {
  onBackToDashboard: () => void;
}

export function Editor({ onBackToDashboard }: EditorProps) {
  const { project, isDirty, setSaving, markSaved, pushHistory, previewMode } = useEditorStore();
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // ── Inject CSS theme tokens into :root whenever the project theme changes ──
  const theme = project?.theme ?? DEFAULT_THEME;
  const br = BORDER_RADIUS_MAP[theme.borderRadius ?? 'md'];
  useMemo(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color',   theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--accent-color',    theme.accentColor);
    root.style.setProperty('--text-color',      theme.textColor);
    root.style.setProperty('--bg-color',        theme.backgroundColor);
    root.style.setProperty('--heading-font',    `'${theme.headingFont}', system-ui, sans-serif`);
    root.style.setProperty('--body-font',       `'${theme.bodyFont}', system-ui, sans-serif`);
    root.style.setProperty('--border-radius',   br);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.primaryColor, theme.secondaryColor, theme.accentColor, theme.textColor,
      theme.backgroundColor, theme.headingFont, theme.bodyFont, br]);

  // Auto-save every 30s when dirty
  useEffect(() => {
    if (!isDirty || !project) return;
    const timer = setTimeout(handleSave, 30_000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); useEditorStore.getState().undo(); }
        if (e.key === 'y' || (e.shiftKey && e.key === 'z')) { e.preventDefault(); useEditorStore.getState().redo(); }
        if (e.key === 's') { e.preventDefault(); handleSave(); }
        if (e.key === 'c') {
          const { selectedSectionId, selectedElementId } = useEditorStore.getState();
          if (selectedSectionId && selectedElementId) {
            useEditorStore.getState().copyElement(selectedSectionId, selectedElementId);
          }
        }
        if (e.key === 'v') {
          const { selectedSectionId } = useEditorStore.getState();
          if (selectedSectionId) {
            useEditorStore.getState().pasteElement(selectedSectionId);
          }
        }
        if (e.key === 'd') {
          e.preventDefault();
          const { selectedSectionId, selectedElementId } = useEditorStore.getState();
          if (selectedSectionId && selectedElementId) {
            pushHistory('Duplicate element');
            useEditorStore.getState().duplicateElement(selectedSectionId, selectedElementId);
          }
        }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const tag = (e.target as HTMLElement).tagName;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
        const { selectedSectionId, selectedElementId } = useEditorStore.getState();
        if (selectedSectionId && selectedElementId) {
          e.preventDefault();
          pushHistory('Delete element');
          useEditorStore.getState().deleteElement(selectedSectionId, selectedElementId);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = useCallback(async () => {
    if (!project) return;
    setSaving(true);
    try {
      await projectsApi.update(project._id, project);
      markSaved();
    } catch {
      markSaved(); // Demo mode
    }
  }, [project, setSaving, markSaved]);

  const handleExport = async () => {
    if (!project) return;
    await exportWebsite(project);
  };

  const handleExportReact = async () => {
    if (!project) return;
    await exportToReactComponent(project);
  };

  const previewWidthMap = { desktop: '100%', tablet: '768px', mobile: '390px' } as const;
  const previewIconMap = { desktop: Monitor, tablet: Tablet, mobile: Smartphone } as const;

  return (
    // EditorDndProvider owns the DndContext — it wraps BOTH LeftSidebar and Canvas
    // so useDraggable (sidebar) and useDroppable/useSortable (canvas) share one context.
    <EditorDndProvider>
      {({ overSectionId, overCanvasEmpty }) => (
        <div className="h-screen flex flex-col overflow-hidden bg-surface-950">
          <Toolbar
            onSave={handleSave}
            onPreview={() => setShowPreview(true)}
            onExport={handleExport}
            onExportReact={handleExportReact}
            onSettings={() => setShowSettings(true)}
          />

          {/* Main 3-column layout */}
          <div className="flex flex-1 overflow-hidden">
            <LeftSidebar />
            <Canvas overSectionId={overSectionId} overCanvasEmpty={overCanvasEmpty} />
            <RightPanel />
          </div>

          {/* Preview modal */}
          {showPreview && project && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col z-50">
              <div className="flex items-center justify-between px-4 py-2 bg-surface-900 border-b border-surface-800 shrink-0">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-brand-400" />
                  <span className="text-[13px] font-medium text-surface-200">{project.name} — Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  {(['desktop', 'tablet', 'mobile'] as const).map(bp => {
                    const Icon = previewIconMap[bp];
                    return (
                      <button key={bp} onClick={() => useEditorStore.getState().setPreviewMode(bp)}
                        className={`btn-ghost p-1.5 ${previewMode === bp ? 'text-brand-400 bg-brand-600/20' : ''}`}
                        title={bp}
                      >
                        <Icon size={14} />
                      </button>
                    );
                  })}
                  <button onClick={() => setShowPreview(false)} className="btn-ghost ml-2">
                    <X size={15} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto flex justify-center bg-[#1a1d27] p-6">
                <div
                  className="bg-white shadow-2xl overflow-auto"
                  style={{ width: previewWidthMap[previewMode], maxWidth: '100%', transition: 'width 0.3s ease', fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100%' }}
                >
                  {/* Full preview render using ElementRenderer */}
                  {(() => {
                    const activePage = project.pages.find(p => p.id === useEditorStore.getState().activePageId)
                      ?? project.pages[0];
                    return activePage?.sections.map(section => (
                      <div key={section.id} style={section.styles as React.CSSProperties}>
                        {section.elements.map(element => (
                          <ElementRenderer
                            key={element.id}
                            element={element}
                            isSelected={false}
                            isHovered={false}
                            onClick={() => {}}
                            onMouseEnter={() => {}}
                            onMouseLeave={() => {}}
                            previewMode={previewMode}
                          />
                        ))}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Settings modal */}
          {showSettings && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 w-full max-w-md animate-slide-up">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[16px] font-bold text-white">Project Settings</h2>
                  <button onClick={() => setShowSettings(false)} className="btn-ghost"><X size={14} /></button>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="panel-label">Project Name</label>
                    <input
                      defaultValue={project?.name}
                      onChange={e => useEditorStore.getState().updateProjectName(e.target.value)}
                      className="input-base py-2.5 mt-1"
                    />
                  </div>
                  <div>
                    <label className="panel-label">Primary Color</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        defaultValue={project?.settings.primaryColor || '#6370f1'}
                        className="w-9 h-9 rounded border border-surface-700 bg-surface-800 p-0.5 cursor-pointer"
                      />
                      <input defaultValue={project?.settings.primaryColor || '#6370f1'} className="input-base py-2 font-mono text-[12px]" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button onClick={() => { handleSave(); setShowSettings(false); }} className="btn-primary flex-1 justify-center py-2.5">Save Settings</button>
                  <button onClick={onBackToDashboard} className="btn-secondary justify-center py-2.5 px-4 text-[12px]">← Dashboard</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </EditorDndProvider>
  );
}
