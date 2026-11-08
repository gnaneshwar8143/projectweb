import React, { useCallback, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  useDroppable,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, Active } from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical, Plus, Trash2, Copy, Eye, EyeOff,
  Lock, Unlock, ChevronUp, ChevronDown,
} from 'lucide-react';
import { useEditorStore } from '../../../store/editorStore';
import { ElementRenderer } from '../../renderer/ElementRenderer';
import { createElement, createSection, createColumns } from '../../renderer/elementFactory';
import type { Section, WebElement, ElementType } from '../../../types';

// ─── Types for drag data payloads ─────────────────────────────────────────────
interface SidebarDragData {
  fromSidebar: true;
  elementType: ElementType;
  label: string;
  variant?: '2col' | '3col';
}
interface CanvasDragData {
  fromSidebar: false;
  sectionId: string;
  elementId: string;
}
type DragData = SidebarDragData | CanvasDragData;

// ─── Section drop zone ────────────────────────────────────────────────────────
// NOTE: pointer-events MUST be enabled (not 'none') for useDroppable to work.
function SectionDropZone({ sectionId, isOver }: { sectionId: string; isOver: boolean }) {
  const { setNodeRef } = useDroppable({
    id: `section-drop-${sectionId}`,
    data: { sectionId },
  });
  return (
    <div
      ref={setNodeRef}
      className="absolute inset-0 rounded transition-all duration-150 z-10"
      style={{
        outline: isOver ? '2px solid #6370f1' : 'none',
        background: isOver ? 'rgba(99,112,241,0.04)' : 'transparent',
        pointerEvents: 'none', // visual only — real drop is handled by DndContext
      }}
    />
  );
}

// ─── Section toolbar ──────────────────────────────────────────────────────────
function SectionToolbar({
  section, index, total,
}: { section: Section; index: number; total: number }) {
  const { deleteSection, duplicateSection, updateSection, reorderSections, pushHistory } = useEditorStore();

  return (
    <div className="absolute -top-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-brand-700 text-white rounded-t-md px-1 py-0.5 z-50 pointer-events-auto">
      <GripVertical size={12} className="cursor-move text-brand-200 mr-0.5" />
      <span className="text-[10px] font-semibold text-brand-100 mr-1 max-w-[80px] truncate">{section.name}</span>
      <button
        onClick={() => { if (index > 0) { pushHistory('Move section'); reorderSections(index, index - 1); } }}
        disabled={index === 0}
        className="p-0.5 hover:bg-brand-600 rounded disabled:opacity-40"
        title="Move up"
      ><ChevronUp size={10} /></button>
      <button
        onClick={() => { if (index < total - 1) { pushHistory('Move section'); reorderSections(index, index + 1); } }}
        disabled={index === total - 1}
        className="p-0.5 hover:bg-brand-600 rounded disabled:opacity-40"
        title="Move down"
      ><ChevronDown size={10} /></button>
      <button
        onClick={() => { pushHistory('Toggle visibility'); updateSection(section.id, { hidden: !section.hidden }); }}
        className="p-0.5 hover:bg-brand-600 rounded"
        title="Toggle visibility"
      >{section.hidden ? <EyeOff size={10} /> : <Eye size={10} />}</button>
      <button
        onClick={() => { pushHistory('Lock section'); updateSection(section.id, { locked: !section.locked }); }}
        className="p-0.5 hover:bg-brand-600 rounded"
        title="Toggle lock"
      >{section.locked ? <Lock size={10} /> : <Unlock size={10} />}</button>
      <button
        onClick={() => { pushHistory('Duplicate section'); duplicateSection(section.id); }}
        className="p-0.5 hover:bg-brand-600 rounded"
        title="Duplicate"
      ><Copy size={10} /></button>
      <button
        onClick={() => { pushHistory('Delete section'); deleteSection(section.id); }}
        className="p-0.5 hover:bg-red-600 rounded"
        title="Delete"
      ><Trash2 size={10} /></button>
    </div>
  );
}

// ─── Sortable element wrapper ─────────────────────────────────────────────────
function SortableElement({
  element, sectionId, isSelected, isHovered, onSelect, onHover,
}: {
  element: WebElement;
  sectionId: string;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (sectionId: string, elementId: string) => void;
  onHover: (id: string | null) => void;
}) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({
    id: element.id,
    data: {
      fromSidebar: false,
      sectionId,
      elementId: element.id,
    } satisfies CanvasDragData,
  });

  const { deleteElement, duplicateElement, updateElement, pushHistory, previewMode } = useEditorStore();

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    position: 'relative',
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/el">
      {/* Action bar — only when selected */}
      {isSelected && (
        <div className="absolute -top-7 left-0 flex items-center gap-0.5 bg-brand-600 text-white rounded-t-md px-1 py-0.5 z-50 pointer-events-auto">
          <div
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-brand-500 rounded"
            title="Drag to reorder"
          >
            <GripVertical size={10} />
          </div>
          <span className="text-[10px] font-semibold text-brand-100 max-w-[60px] truncate">{element.name}</span>
          <button
            onClick={(e) => { e.stopPropagation(); pushHistory('Duplicate'); duplicateElement(sectionId, element.id); }}
            className="p-0.5 hover:bg-brand-500 rounded"
            title="Duplicate (Ctrl+D)"
          ><Copy size={10} /></button>
          <button
            onClick={(e) => { e.stopPropagation(); pushHistory('Toggle visibility'); updateElement(sectionId, element.id, { hidden: !element.hidden }); }}
            className="p-0.5 hover:bg-brand-500 rounded"
            title="Toggle visibility"
          >{element.hidden ? <EyeOff size={10} /> : <Eye size={10} />}</button>
          <button
            onClick={(e) => { e.stopPropagation(); pushHistory('Delete'); deleteElement(sectionId, element.id); }}
            className="p-0.5 hover:bg-red-600 rounded"
            title="Delete (Del)"
          ><Trash2 size={10} /></button>
        </div>
      )}
      <ElementRenderer
        element={element}
        isSelected={isSelected}
        isHovered={isHovered && !isSelected}
        onClick={(e) => { e.stopPropagation(); onSelect(sectionId, element.id); }}
        onMouseEnter={() => onHover(element.id)}
        onMouseLeave={() => onHover(null)}
        onContentChange={(val) => {
          if (element.type === 'button') {
            updateElement(sectionId, element.id, { text: val });
          } else {
            updateElement(sectionId, element.id, { content: val });
          }
        }}
        previewMode={previewMode}
      />
    </div>
  );
}

// ─── Section renderer ─────────────────────────────────────────────────────────
function SectionRenderer({
  section, index, total, overSectionId,
}: {
  section: Section;
  index: number;
  total: number;
  overSectionId: string | null;
}) {
  const {
    selectedSectionId, selectedElementId, hoveredElementId,
    selectElement, selectSection, setHovered, addElement,
  } = useEditorStore();

  const isSelectedSection = selectedSectionId === section.id && !selectedElementId;
  const isOver = overSectionId === section.id;

  return (
    <div
      className={[
        'canvas-section relative group',
        isSelectedSection ? 'ring-2 ring-brand-500 ring-offset-0' : '',
        section.hidden ? 'opacity-40' : '',
      ].join(' ')}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('.web-element')) return;
        selectSection(section.id);
      }}
    >
      <SectionToolbar section={section} index={index} total={total} />
      {/* Drop zone indicator (visual only) */}
      <SectionDropZone sectionId={section.id} isOver={isOver} />

      {/* Section content */}
      <div style={section.styles as React.CSSProperties}>
        <SortableContext
          items={section.elements.map(e => e.id)}
          strategy={rectSortingStrategy}
        >
          {section.elements.length === 0 ? (
            <div
              className={[
                'flex flex-col items-center justify-center py-16 px-4 text-center',
                'border-2 border-dashed rounded-xl transition-all',
                isOver
                  ? 'border-brand-400 bg-brand-500/5'
                  : 'border-surface-300/30',
              ].join(' ')}
            >
              <p className="text-[13px] text-surface-400 mb-3">
                {isOver ? '✦ Drop here to add element' : 'Drop elements from sidebar or quick-add:'}
              </p>
              {!isOver && (
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {(['heading', 'paragraph', 'button', 'image', 'card', 'navbar'] as const).map(type => (
                    <button
                      key={type}
                      onClick={(e) => {
                        e.stopPropagation();
                        const el = createElement(type);
                        useEditorStore.getState().pushHistory(`Add ${type}`);
                        addElement(section.id, el);
                      }}
                      className="btn-secondary text-[11px] py-1 px-2.5 capitalize flex items-center gap-1 hover:border-brand-500 hover:text-brand-300"
                    >
                      <Plus size={10} /> {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {section.elements.map(el => (
                <SortableElement
                  key={el.id}
                  element={el}
                  sectionId={section.id}
                  isSelected={selectedElementId === el.id}
                  isHovered={hoveredElementId === el.id}
                  onSelect={selectElement}
                  onHover={setHovered}
                />
              ))}
              {/* Drop insertion indicator at bottom when hovering with sidebar item */}
              {isOver && (
                <div className="h-1 bg-brand-500 rounded-full mx-4 my-2 animate-pulse" />
              )}
            </>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

// ─── Empty canvas drop zone ───────────────────────────────────────────────────
function EmptyCanvasDrop({ onAddSection, isOver }: { onAddSection: () => void; isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: 'canvas-empty' });
  return (
    <div
      ref={setNodeRef}
      className={[
        'flex flex-col items-center justify-center min-h-full text-center transition-all p-8',
        isOver ? 'bg-brand-500/8' : '',
      ].join(' ')}
    >
      <div className="mb-6">
        <div className={[
          'w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 border transition-all',
          isOver
            ? 'bg-brand-600/20 border-brand-500 scale-110'
            : 'bg-surface-800 border-surface-700',
        ].join(' ')}>
          <Plus size={28} className={isOver ? 'text-brand-400' : 'text-surface-500'} />
        </div>
        <h3 className="text-[16px] font-semibold text-surface-200 mb-2">
          {isOver ? 'Drop to create a new section' : 'Start building your website'}
        </h3>
        <p className="text-[13px] text-surface-500 max-w-xs leading-relaxed">
          {isOver
            ? 'The element will be placed in a new section.'
            : 'Drag elements from the left panel onto the canvas, or start with a template.'}
        </p>
      </div>
      {!isOver && (
        <div className="flex gap-3">
          <button onClick={onAddSection} className="btn-primary">
            <Plus size={14} /> Add Section
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Drag overlay preview ────────────────────────────────────────────────────
function SidebarDragPreview({ active }: { active: Active | null }) {
  if (!active) return null;
  const data = active.data.current as DragData | undefined;
  if (!data?.fromSidebar) return null;
  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl shadow-2xl text-[13px] font-semibold cursor-grabbing"
      style={{ boxShadow: '0 8px 32px rgba(99,112,241,0.4)' }}
    >
      <Plus size={14} />
      {data.label}
    </div>
  );
}

// ─── Main Canvas (now receives DndContext context from Editor) ─────────────────
export interface CanvasProps {
  // DnD state passed from the shared DndContext in Editor
  overSectionId: string | null;
  overCanvasEmpty: boolean;
}

export function Canvas({ overSectionId, overCanvasEmpty }: CanvasProps) {
  const {
    project, activePageId, previewMode, showGrid,
    addSection, selectElement, selectSection,
  } = useEditorStore();

  const page = project?.pages.find(p => p.id === activePageId);

  const canvasWidthMap = { desktop: '100%', tablet: '768px', mobile: '390px' } as const;

  const handleAddSection = () => {
    const section = createSection(`Section ${(page?.sections.length ?? 0) + 1}`);
    useEditorStore.getState().pushHistory('Add section');
    addSection(section);
  };

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--canvas-bg)]">
        <p className="text-surface-500 text-[13px]">No page selected</p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-auto bg-[var(--canvas-bg)] flex justify-center"
      onClick={() => { selectSection(null); selectElement(null, null); }}
      style={{
        backgroundImage: showGrid
          ? 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)'
          : 'none',
        backgroundSize: '20px 20px',
      }}
    >
      <div
        className="shadow-2xl transition-all duration-300 origin-top relative"
        style={{
          width: canvasWidthMap[previewMode],
          minHeight: '100%',
          maxWidth: '100%',
          backgroundColor: project?.theme?.backgroundColor || '#ffffff',
          color: project?.theme?.textColor || '#1e293b',
          fontFamily: project?.theme?.bodyFont ? `'${project.theme.bodyFont}', Inter, system-ui, sans-serif` : 'Inter, system-ui, sans-serif',
        }}
        onClick={e => e.stopPropagation()}
      >
        {page.sections.length === 0 ? (
          <EmptyCanvasDrop
            onAddSection={handleAddSection}
            isOver={overCanvasEmpty}
          />
        ) : (
          <>
            {page.sections.map((section, idx) => (
              <SectionRenderer
                key={section.id}
                section={section}
                index={idx}
                total={page.sections.length}
                overSectionId={overSectionId}
              />
            ))}
            {/* Add section strip at bottom */}
            <div className="flex justify-center py-6 bg-[var(--canvas-bg)]">
              <button
                onClick={handleAddSection}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium text-surface-400 hover:text-surface-200 border border-dashed border-surface-700 hover:border-surface-600 transition-all"
              >
                <Plus size={13} /> Add Section
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Shared DnD Context wrapper — mounts at Editor level ────────────────────
// This component owns the DndContext so both LeftSidebar (useDraggable)
// and Canvas (useDroppable / useSortable) share the same context tree.
export function EditorDndProvider({ children }: { children: (props: {
  overSectionId: string | null;
  overCanvasEmpty: boolean;
}) => React.ReactNode }) {
  const { project, activePageId, addSection, addElement, moveElement, pushHistory } = useEditorStore();
  const [activeItem, setActiveItem] = useState<Active | null>(null);
  const [overSectionId, setOverSectionId] = useState<string | null>(null);
  const [overCanvasEmpty, setOverCanvasEmpty] = useState(false);

  const activeDragRef = useRef<{
    type: 'sidebar' | 'element';
    elementType?: ElementType;
    label?: string;
    variant?: '2col' | '3col';
    sectionId?: string;
    elementId?: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Require 8px movement before drag starts — prevents accidental drags on clicks
        distance: 8,
      },
    })
  );

  const getPage = useCallback(() => {
    if (!project || !activePageId) return null;
    return project.pages.find(p => p.id === activePageId) ?? null;
  }, [project, activePageId]);

  // Resolve which section the dragged item is over
  const resolveOverSection = useCallback((overId: string): string | null => {
    const page = getPage();
    if (!page) return null;

    // Explicit section drop zone
    if (overId.startsWith('section-drop-')) {
      return overId.replace('section-drop-', '');
    }

    // Dropped directly on an element — find its parent section
    for (const s of page.sections) {
      if (s.elements.some(e => e.id === overId)) return s.id;
    }

    // Dropped on section area itself (overId is a section id)
    if (page.sections.some(s => s.id === overId)) return overId;

    return null;
  }, [getPage]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as DragData | undefined;
    setActiveItem(event.active);
    if (data?.fromSidebar) {
      activeDragRef.current = {
        type: 'sidebar',
        elementType: data.elementType,
        label: data.label,
        variant: data.variant,
      };
    } else if (data && !data.fromSidebar) {
      activeDragRef.current = { type: 'element', sectionId: data.sectionId, elementId: data.elementId };
    }
  }, []);

  const handleDragOver = useCallback((event: { over: { id: string | number } | null }) => {
    if (!event.over) {
      setOverSectionId(null);
      setOverCanvasEmpty(false);
      return;
    }
    const overId = String(event.over.id);
    if (overId === 'canvas-empty') {
      setOverCanvasEmpty(true);
      setOverSectionId(null);
    } else {
      setOverCanvasEmpty(false);
      setOverSectionId(resolveOverSection(overId));
    }
  }, [resolveOverSection]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveItem(null);
    setOverSectionId(null);
    setOverCanvasEmpty(false);

    const { over } = event;
    const drag = activeDragRef.current;
    activeDragRef.current = null;

    const page = getPage();
    if (!drag || !page) return;

    // ── Case 1: Sidebar item dropped ─────────────────────────────────────────
    if (drag.type === 'sidebar' && drag.elementType) {
      const overId = over ? String(over.id) : null;

      if (!overId) return; // dropped outside — cancel

      const elType = drag.elementType;
      const makeNewElement = () => {
        if (elType === 'container' && drag.variant === '2col') return createColumns(2);
        if (elType === 'container' && drag.variant === '3col') return createColumns(3);
        return createElement(elType);
      };

      // Dropped on empty canvas → create new section
      if (overId === 'canvas-empty') {
        const section = createSection('Section 1');
        const el = makeNewElement();
        pushHistory(`Add ${drag.label ?? drag.elementType}`);
        addSection(section);
        // Use setTimeout to ensure section is in store before adding element
        setTimeout(() => addElement(section.id, el), 0);
        return;
      }

      // Find target section
      let targetSectionId = resolveOverSection(overId);

      // If still not found, use the last section as fallback
      if (!targetSectionId && page.sections.length > 0) {
        targetSectionId = page.sections[page.sections.length - 1].id;
      }

      // Still no section → create one
      if (!targetSectionId) {
        const section = createSection(`Section ${page.sections.length + 1}`);
        const el = makeNewElement();
        pushHistory(`Add ${drag.label ?? drag.elementType}`);
        addSection(section);
        setTimeout(() => addElement(section.id, el), 0);
        return;
      }

      const el = makeNewElement();
      pushHistory(`Add ${drag.label ?? drag.elementType}`);
      addElement(targetSectionId, el);
      return;
    }

    // ── Case 2: Existing canvas element reordered ─────────────────────────────
    if (drag.type === 'element' && drag.elementId && drag.sectionId && over) {
      const overId = String(over.id);
      let targetSectionId = drag.sectionId;
      let targetIndex = -1;

      for (const section of page.sections) {
        const idx = section.elements.findIndex(e => e.id === overId);
        if (idx !== -1) {
          targetSectionId = section.id;
          targetIndex = idx;
          break;
        }
      }

      if (targetSectionId === drag.sectionId) {
        // Reorder within same section
        const section = page.sections.find(s => s.id === drag.sectionId);
        if (section && targetIndex !== -1) {
          const oldIdx = section.elements.findIndex(e => e.id === drag.elementId);
          if (oldIdx !== -1 && oldIdx !== targetIndex) {
            pushHistory('Reorder element');
            const reordered = arrayMove(section.elements, oldIdx, targetIndex);
            useEditorStore.getState().updateSection(drag.sectionId, { elements: reordered } as any);
          }
        }
      } else if (targetIndex !== -1) {
        pushHistory('Move element to section');
        moveElement(drag.sectionId, targetSectionId, drag.elementId, targetIndex);
      }
    }
  }, [getPage, addSection, addElement, moveElement, pushHistory, resolveOverSection]);

  const handleDragCancel = useCallback(() => {
    setActiveItem(null);
    setOverSectionId(null);
    setOverCanvasEmpty(false);
    activeDragRef.current = null;
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children({ overSectionId, overCanvasEmpty })}
      {/* Drag overlay: shown under the cursor during drag */}
      <DragOverlay dropAnimation={null}>
        <SidebarDragPreview active={activeItem} />
      </DragOverlay>
    </DndContext>
  );
}
