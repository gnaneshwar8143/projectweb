import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuid } from 'uuid';
import type {
  EditorState, Project, Page, Section, WebElement,
  Breakpoint, HistoryEntry, ThemeConfig,
} from '../types';
import { DEFAULT_THEME } from '../types';

const MAX_HISTORY = 50;

interface EditorActions {
  // Project
  setProject: (project: Project) => void;
  updateProjectName: (name: string) => void;
  markDirty: () => void;
  markSaved: () => void;
  setSaving: (v: boolean) => void;

  // Pages
  setActivePage: (pageId: string) => void;
  addPage: () => void;
  renamePage: (pageId: string, name: string) => void;
  duplicatePage: (pageId: string) => void;
  deletePage: (pageId: string) => void;
  getActivePage: () => Page | null;

  // Sections
  addSection: (section: Section, index?: number) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  deleteSection: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;

  // Elements
  addElement: (sectionId: string, element: WebElement, index?: number) => void;
  addElementToContainer: (containerId: string, element: WebElement, index?: number) => void;
  updateElement: (sectionId: string, elementId: string, updates: Partial<WebElement>) => void;
  deleteElement: (sectionId: string, elementId: string) => void;
  duplicateElement: (sectionId: string, elementId: string) => void;
  moveElement: (fromSectionId: string, toSectionId: string, elementId: string, toIndex: number) => void;

  // Selection
  selectElement: (sectionId: string | null, elementId: string | null) => void;
  selectSection: (sectionId: string | null) => void;
  setHovered: (elementId: string | null) => void;

  // Preview
  setPreviewMode: (mode: Breakpoint) => void;

  // Sidebar
  setSidebarTab: (tab: EditorState['sidebarTab']) => void;

  // History
  pushHistory: (description: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Grid
  toggleGrid: () => void;

  // Clipboard
  clipboard: WebElement | null;
  copyElement: (sectionId: string, elementId: string) => void;
  pasteElement: (sectionId: string) => void;

  // Theme
  updateTheme: (updates: Partial<ThemeConfig>) => void;

  // Load template
  loadTemplate: (pages: Page[]) => void;
}

type EditorStore = EditorState & EditorActions;

const initialState: EditorState = {
  project: null,
  activePageId: null,
  selectedElementId: null,
  selectedSectionId: null,
  hoveredElementId: null,
  previewMode: 'desktop',
  isDirty: false,
  isSaving: false,
  history: [],
  historyIndex: -1,
  sidebarTab: 'elements',
  showGrid: false,
};

// Recursive helpers for tree operations (containers)
function findElementInTree(elements: WebElement[], id: string): WebElement | null {
  for (const el of elements) {
    if (el.id === id) return el;
    if (el.children && el.children.length > 0) {
      const found = findElementInTree(el.children, id);
      if (found) return found;
    }
  }
  return null;
}

function removeElementFromTree(elements: WebElement[], id: string): boolean {
  const idx = elements.findIndex(e => e.id === id);
  if (idx !== -1) {
    elements.splice(idx, 1);
    return true;
  }
  for (const el of elements) {
    if (el.children && el.children.length > 0) {
      if (removeElementFromTree(el.children, id)) return true;
    }
  }
  return false;
}

export const useEditorStore = create<EditorStore>()(
  immer((set, get) => ({
    ...initialState,
    clipboard: null,

    // ── Helpers ──────────────────────────────────────────────────────────────
    getActivePage: () => {
      const { project, activePageId } = get();
      if (!project || !activePageId) return null;
      return project.pages.find(p => p.id === activePageId) ?? null;
    },

    // ── Project ───────────────────────────────────────────────────────────────
    setProject: (project) => set(state => {
      state.project = project;
      if (!state.project.theme) state.project.theme = DEFAULT_THEME;
      state.activePageId = project.pages[0]?.id ?? null;
      state.selectedElementId = null;
      state.selectedSectionId = null;
      state.history = [{ pages: JSON.parse(JSON.stringify(project.pages)), timestamp: Date.now(), description: 'Initial load' }];
      state.historyIndex = 0;
      state.isDirty = false;
    }),

    updateProjectName: (name) => set(state => {
      if (state.project) state.project.name = name;
      state.isDirty = true;
    }),

    markDirty: () => set(s => { s.isDirty = true; }),
    markSaved: () => set(s => { s.isDirty = false; s.isSaving = false; }),
    setSaving: (v) => set(s => { s.isSaving = v; }),

    // ── Pages ─────────────────────────────────────────────────────────────────
    setActivePage: (pageId) => set(s => {
      s.activePageId = pageId;
      s.selectedElementId = null;
      s.selectedSectionId = null;
    }),

    addPage: () => set(state => {
      if (!state.project) return;
      const newPage: Page = {
        id: uuid(),
        name: `Page ${state.project.pages.length + 1}`,
        slug: `page-${state.project.pages.length + 1}`,
        sections: [],
        meta: { title: '', description: '', keywords: '' },
      };
      state.project.pages.push(newPage);
      state.activePageId = newPage.id;
      state.isDirty = true;
    }),

    renamePage: (pageId, name) => set(state => {
      if (!state.project) return;
      const page = state.project.pages.find(p => p.id === pageId);
      if (page) {
        page.name = name;
        page.slug = name.toLowerCase().replace(/\s+/g, '-');
      }
      state.isDirty = true;
    }),

    duplicatePage: (pageId) => set(state => {
      if (!state.project) return;
      const page = state.project.pages.find(p => p.id === pageId);
      if (!page) return;
      const clone: Page = JSON.parse(JSON.stringify(page));
      clone.id = uuid();
      clone.name = `${page.name} (Copy)`;
      clone.slug = `${page.slug}-copy`;
      state.project.pages.push(clone);
      state.activePageId = clone.id;
      state.isDirty = true;
    }),

    deletePage: (pageId) => set(state => {
      if (!state.project || state.project.pages.length <= 1) return;
      state.project.pages = state.project.pages.filter(p => p.id !== pageId);
      if (state.activePageId === pageId) {
        state.activePageId = state.project.pages[0]?.id ?? null;
      }
      state.isDirty = true;
    }),

    // ── Sections ──────────────────────────────────────────────────────────────
    addSection: (section, index) => set(state => {
      if (!state.project || !state.activePageId) return;
      const page = state.project.pages.find(p => p.id === state.activePageId);
      if (!page) return;
      if (index !== undefined) {
        page.sections.splice(index, 0, section);
      } else {
        page.sections.push(section);
      }
      state.selectedSectionId = section.id;
      state.isDirty = true;
    }),

    updateSection: (sectionId, updates) => set(state => {
      if (!state.project || !state.activePageId) return;
      const page = state.project.pages.find(p => p.id === state.activePageId);
      if (!page) return;
      const section = page.sections.find(s => s.id === sectionId);
      if (section) Object.assign(section, updates);
      state.isDirty = true;
    }),

    deleteSection: (sectionId) => set(state => {
      if (!state.project || !state.activePageId) return;
      const page = state.project.pages.find(p => p.id === state.activePageId);
      if (!page) return;
      page.sections = page.sections.filter(s => s.id !== sectionId);
      if (state.selectedSectionId === sectionId) {
        state.selectedSectionId = null;
        state.selectedElementId = null;
      }
      state.isDirty = true;
    }),

    duplicateSection: (sectionId) => set(state => {
      if (!state.project || !state.activePageId) return;
      const page = state.project.pages.find(p => p.id === state.activePageId);
      if (!page) return;
      const idx = page.sections.findIndex(s => s.id === sectionId);
      if (idx === -1) return;
      const clone: Section = JSON.parse(JSON.stringify(page.sections[idx]));
      clone.id = uuid();
      clone.name = `${clone.name} (Copy)`;
      // Re-assign all element IDs to avoid conflicts
      clone.elements = clone.elements.map(el => ({ ...el, id: uuid() }));
      page.sections.splice(idx + 1, 0, clone);
      state.selectedSectionId = clone.id;
      state.isDirty = true;
    }),

    reorderSections: (fromIndex, toIndex) => set(state => {
      if (!state.project || !state.activePageId) return;
      const page = state.project.pages.find(p => p.id === state.activePageId);
      if (!page) return;
      const [moved] = page.sections.splice(fromIndex, 1);
      page.sections.splice(toIndex, 0, moved);
      state.isDirty = true;
    }),

    // ── Elements ──────────────────────────────────────────────────────────────
    addElement: (sectionId, element, index) => set(state => {
      if (!state.project || !state.activePageId) return;
      const page = state.project.pages.find(p => p.id === state.activePageId);
      if (!page) return;
      const section = page.sections.find(s => s.id === sectionId);
      if (!section) return;
      if (index !== undefined) {
        section.elements.splice(index, 0, element);
      } else {
        section.elements.push(element);
      }
      state.selectedSectionId = sectionId;
      state.selectedElementId = element.id;
      state.isDirty = true;
    }),

    addElementToContainer: (containerId, element, index) => set(state => {
      if (!state.project || !state.activePageId) return;
      const page = state.project.pages.find(p => p.id === state.activePageId);
      if (!page) return;
      for (const section of page.sections) {
        const container = findElementInTree(section.elements, containerId);
        if (container) {
          if (!container.children) container.children = [];
          if (index !== undefined) {
            container.children.splice(index, 0, element);
          } else {
            container.children.push(element);
          }
          state.selectedSectionId = section.id;
          state.selectedElementId = element.id;
          state.isDirty = true;
          return;
        }
      }
    }),

    updateElement: (sectionId, elementId, updates) => set(state => {
      if (!state.project || !state.activePageId) return;
      const page = state.project.pages.find(p => p.id === state.activePageId);
      if (!page) return;
      const section = page.sections.find(s => s.id === sectionId);
      if (!section) return;
      const el = findElementInTree(section.elements, elementId);
      if (el) Object.assign(el, updates);
      state.isDirty = true;
    }),

    deleteElement: (sectionId, elementId) => set(state => {
      if (!state.project || !state.activePageId) return;
      const page = state.project.pages.find(p => p.id === state.activePageId);
      if (!page) return;
      const section = page.sections.find(s => s.id === sectionId);
      if (!section) return;
      removeElementFromTree(section.elements, elementId);
      if (state.selectedElementId === elementId) state.selectedElementId = null;
      state.isDirty = true;
    }),

    duplicateElement: (sectionId, elementId) => set(state => {
      if (!state.project || !state.activePageId) return;
      const page = state.project.pages.find(p => p.id === state.activePageId);
      if (!page) return;
      const section = page.sections.find(s => s.id === sectionId);
      if (!section) return;
      const idx = section.elements.findIndex(e => e.id === elementId);
      if (idx === -1) return;
      const clone: WebElement = JSON.parse(JSON.stringify(section.elements[idx]));
      clone.id = uuid();
      section.elements.splice(idx + 1, 0, clone);
      state.selectedElementId = clone.id;
      state.isDirty = true;
    }),

    moveElement: (fromSectionId, toSectionId, elementId, toIndex) => set(state => {
      if (!state.project || !state.activePageId) return;
      const page = state.project.pages.find(p => p.id === state.activePageId);
      if (!page) return;
      const fromSection = page.sections.find(s => s.id === fromSectionId);
      const toSection = page.sections.find(s => s.id === toSectionId);
      if (!fromSection || !toSection) return;
      const elIdx = fromSection.elements.findIndex(e => e.id === elementId);
      if (elIdx === -1) return;
      const [el] = fromSection.elements.splice(elIdx, 1);
      toSection.elements.splice(toIndex, 0, el);
      state.selectedSectionId = toSectionId;
      state.isDirty = true;
    }),

    // ── Selection ─────────────────────────────────────────────────────────────
    selectElement: (sectionId, elementId) => set(s => {
      s.selectedSectionId = sectionId;
      s.selectedElementId = elementId;
    }),
    selectSection: (sectionId) => set(s => {
      s.selectedSectionId = sectionId;
      s.selectedElementId = null;
    }),
    setHovered: (elementId) => set(s => { s.hoveredElementId = elementId; }),

    // ── Preview ───────────────────────────────────────────────────────────────
    setPreviewMode: (mode) => set(s => { s.previewMode = mode; }),

    // ── Sidebar ───────────────────────────────────────────────────────────────
    setSidebarTab: (tab) => set(s => { s.sidebarTab = tab; }),

    // ── History ───────────────────────────────────────────────────────────────
    pushHistory: (description) => set(state => {
      if (!state.project) return;
      const snapshot: HistoryEntry = {
        pages: JSON.parse(JSON.stringify(state.project.pages)),
        timestamp: Date.now(),
        description,
      };
      // Truncate redo stack
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push(snapshot);
      if (state.history.length > MAX_HISTORY) {
        state.history.shift();
      } else {
        state.historyIndex++;
      }
    }),

    undo: () => set(state => {
      if (!state.project || state.historyIndex <= 0) return;
      state.historyIndex--;
      const entry = state.history[state.historyIndex];
      state.project.pages = JSON.parse(JSON.stringify(entry.pages));
      state.selectedElementId = null;
      state.selectedSectionId = null;
      state.isDirty = true;
    }),

    redo: () => set(state => {
      if (!state.project || state.historyIndex >= state.history.length - 1) return;
      state.historyIndex++;
      const entry = state.history[state.historyIndex];
      state.project.pages = JSON.parse(JSON.stringify(entry.pages));
      state.selectedElementId = null;
      state.selectedSectionId = null;
      state.isDirty = true;
    }),

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    // ── Grid ──────────────────────────────────────────────────────────────────
    toggleGrid: () => set(s => { s.showGrid = !s.showGrid; }),

    // ── Clipboard ─────────────────────────────────────────────────────────────
    copyElement: (sectionId, elementId) => set(state => {
      if (!state.project || !state.activePageId) return;
      const page = state.project.pages.find(p => p.id === state.activePageId);
      if (!page) return;
      const section = page.sections.find(s => s.id === sectionId);
      if (!section) return;
      const el = section.elements.find(e => e.id === elementId);
      if (el) state.clipboard = JSON.parse(JSON.stringify(el));
    }),

    pasteElement: (sectionId) => set(state => {
      if (!state.clipboard || !state.project || !state.activePageId) return;
      const page = state.project.pages.find(p => p.id === state.activePageId);
      if (!page) return;
      const section = page.sections.find(s => s.id === sectionId);
      if (!section) return;
      const clone: WebElement = JSON.parse(JSON.stringify(state.clipboard));
      clone.id = uuid();
      section.elements.push(clone);
      state.selectedElementId = clone.id;
      state.isDirty = true;
    }),

    // ── Theme ─────────────────────────────────────────────────────────────────
    updateTheme: (updates) => set(state => {
      if (!state.project) return;
      state.project.theme = { ...(state.project.theme ?? DEFAULT_THEME), ...updates };
      state.isDirty = true;
    }),

    // ── Template ──────────────────────────────────────────────────────────────
    loadTemplate: (pages) => set(state => {
      if (!state.project) return;
      state.project.pages = JSON.parse(JSON.stringify(pages));
      state.activePageId = pages[0]?.id ?? null;
      state.selectedElementId = null;
      state.selectedSectionId = null;
      state.isDirty = true;
    }),
  }))
);
