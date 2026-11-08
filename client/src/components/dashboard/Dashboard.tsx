import React, { useState, useEffect } from 'react';
import {
  Plus, Search, MoreHorizontal, Pencil, Copy, Trash2, Calendar,
  ExternalLink, Zap, LogOut, User, Globe,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useEditorStore } from '../../store/editorStore';
import { projectsApi } from '../../api';
import type { Project } from '../../types';
import { DEFAULT_THEME } from '../../types';
import { v4 as uuid } from 'uuid';

// ─── Create empty project ─────────────────────────────────────────────────────
function createEmptyProject(name: string, userId: string): Project {
  const pageId = uuid();
  return {
    _id: uuid(),
    name,
    description: '',
    pages: [{
      id: pageId,
      name: 'Home',
      slug: 'home',
      sections: [],
      meta: { title: name, description: '', keywords: '' },
    }],
    settings: { fonts: ['Inter'], globalStyles: '', primaryColor: '#6370f1' },
    theme: DEFAULT_THEME,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  };
}

// ─── Project card ─────────────────────────────────────────────────────────────
function ProjectCard({
  project, onOpen, onRename, onDuplicate, onDelete,
}: {
  project: Project;
  onOpen: (p: Project) => void;
  onRename: (p: Project) => void;
  onDuplicate: (p: Project) => void;
  onDelete: (p: Project) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group relative bg-surface-900 border border-surface-800 rounded-xl overflow-hidden hover:border-surface-700 transition-all hover:shadow-xl hover:shadow-black/20">
      {/* Thumbnail */}
      <div
        className="h-40 bg-gradient-to-br from-surface-800 to-surface-900 flex items-center justify-center cursor-pointer relative overflow-hidden"
        onClick={() => onOpen(project)}
      >
        <Globe size={36} className="text-surface-700" />
        <div className="absolute inset-0 bg-brand-600/0 group-hover:bg-brand-600/5 transition-all flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 bg-brand-600 text-white text-[12px] font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-all translate-y-2 group-hover:translate-y-0">
            <ExternalLink size={11} /> Open Editor
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[13px] font-semibold text-surface-100 truncate">{project.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Calendar size={10} className="text-surface-500 shrink-0" />
              <span className="text-[11px] text-surface-500">
                {new Date(project.updatedAt).toLocaleDateString()}
              </span>
              <span className="text-surface-700">·</span>
              <span className="text-[11px] text-surface-500">{project.pages.length} page{project.pages.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Context menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="btn-ghost p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-surface-800 border border-surface-700 rounded-xl shadow-xl z-50 py-1 animate-fade-in">
                {[
                  { icon: <ExternalLink size={12} />, label: 'Open Editor', action: () => onOpen(project) },
                  { icon: <Pencil size={12} />, label: 'Rename', action: () => onRename(project) },
                  { icon: <Copy size={12} />, label: 'Duplicate', action: () => onDuplicate(project) },
                  { icon: <Trash2 size={12} />, label: 'Delete', action: () => onDelete(project), danger: true },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => { item.action(); setMenuOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium transition-colors ${item.danger ? 'text-red-400 hover:bg-red-600/10' : 'text-surface-300 hover:bg-surface-700'}`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {menuOpen && <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
interface DashboardProps {
  onOpenEditor: (project: Project) => void;
}

export function Dashboard({ onOpenEditor }: DashboardProps) {
  const { user, logout } = useAuthStore();
  const { setProject } = useEditorStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [renameTarget, setRenameTarget] = useState<Project | null>(null);
  const [renameVal, setRenameVal] = useState('');

  // Load projects
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await projectsApi.list();
        setProjects(res.data.data ?? []);
      } catch {
        // Demo mode: show empty state
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const openProject = (p: Project) => {
    setProject(p);
    onOpenEditor(p);
  };

  const createProject = async () => {
    if (!newName.trim()) return;
    const p = createEmptyProject(newName.trim(), user?._id ?? 'demo');
    try {
      const res = await projectsApi.create(newName.trim());
      const created = res.data.data!;
      setProjects(prev => [created, ...prev]);
      openProject(created);
    } catch {
      // Demo: create locally
      setProjects(prev => [p, ...prev]);
      openProject(p);
    }
    setCreating(false);
    setNewName('');
  };

  const handleDuplicate = (p: Project) => {
    const clone: Project = {
      ...JSON.parse(JSON.stringify(p)),
      _id: uuid(),
      name: `${p.name} (Copy)`,
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => [clone, ...prev]);
  };

  const handleDelete = (p: Project) => {
    setProjects(prev => prev.filter(pr => pr._id !== p._id));
    projectsApi.delete(p._id).catch(() => {});
    setDeleteTarget(null);
  };

  const handleRename = (p: Project) => {
    if (!renameVal.trim()) return;
    const updated = { ...p, name: renameVal.trim(), updatedAt: new Date().toISOString() };
    setProjects(prev => prev.map(pr => pr._id === p._id ? updated : pr));
    projectsApi.update(p._id, { name: renameVal.trim() }).catch(() => {});
    setRenameTarget(null);
  };

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-surface-800 bg-surface-950 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-[15px] text-white">WebCraft Studio</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[13px] text-surface-400">
            <div className="w-7 h-7 bg-brand-700 rounded-full flex items-center justify-center">
              <User size={13} className="text-brand-200" />
            </div>
            {user?.name}
          </div>
          <button onClick={logout} className="btn-ghost text-[12px] flex items-center gap-1.5 text-surface-500">
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {/* Title row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">My Projects</h1>
            <p className="text-[13px] text-surface-400 mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setCreating(true)} className="btn-primary px-4 py-2 text-[13px]">
            <Plus size={14} /> New Project
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="input-base pl-9"
          />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface-900 border border-surface-800 rounded-xl h-56 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-surface-800 rounded-2xl flex items-center justify-center mb-4 border border-surface-700">
              <Globe size={24} className="text-surface-600" />
            </div>
            <h3 className="text-[15px] font-semibold text-surface-300 mb-2">
              {search ? 'No projects match your search' : 'No projects yet'}
            </h3>
            <p className="text-[13px] text-surface-500 max-w-xs leading-relaxed mb-4">
              {search ? 'Try a different search term.' : 'Create your first project to get started building amazing websites.'}
            </p>
            {!search && (
              <button onClick={() => setCreating(true)} className="btn-primary">
                <Plus size={14} /> Create First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* New project card */}
            <button
              onClick={() => setCreating(true)}
              className="h-56 border-2 border-dashed border-surface-700 hover:border-brand-600/50 rounded-xl flex flex-col items-center justify-center gap-2 text-surface-500 hover:text-brand-400 transition-all group"
            >
              <div className="w-10 h-10 bg-surface-800 group-hover:bg-brand-600/20 rounded-xl flex items-center justify-center transition-colors">
                <Plus size={20} />
              </div>
              <span className="text-[13px] font-medium">New Project</span>
            </button>
            {filtered.map(p => (
              <ProjectCard
                key={p._id}
                project={p}
                onOpen={openProject}
                onRename={(p) => { setRenameTarget(p); setRenameVal(p.name); }}
                onDuplicate={handleDuplicate}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create modal */}
      {creating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 w-full max-w-sm animate-slide-up shadow-2xl">
            <h2 className="text-[16px] font-bold text-white mb-4">New Project</h2>
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') createProject(); if (e.key === 'Escape') setCreating(false); }}
              placeholder="Project name…"
              className="input-base py-3 mb-4 text-[14px]"
            />
            <div className="flex gap-2">
              <button onClick={createProject} disabled={!newName.trim()} className="btn-primary flex-1 justify-center py-2.5">Create Project</button>
              <button onClick={() => setCreating(false)} className="btn-secondary flex-1 justify-center py-2.5">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Rename modal */}
      {renameTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 w-full max-w-sm animate-slide-up shadow-2xl">
            <h2 className="text-[16px] font-bold text-white mb-4">Rename Project</h2>
            <input
              autoFocus
              value={renameVal}
              onChange={e => setRenameVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(renameTarget); if (e.key === 'Escape') setRenameTarget(null); }}
              className="input-base py-3 mb-4 text-[14px]"
            />
            <div className="flex gap-2">
              <button onClick={() => handleRename(renameTarget)} className="btn-primary flex-1 justify-center py-2.5">Save</button>
              <button onClick={() => setRenameTarget(null)} className="btn-secondary flex-1 justify-center py-2.5">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 w-full max-w-sm animate-slide-up shadow-2xl">
            <h2 className="text-[16px] font-bold text-white mb-2">Delete Project?</h2>
            <p className="text-[13px] text-surface-400 mb-6">
              This will permanently delete "<strong className="text-surface-200">{deleteTarget.name}</strong>". This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button onClick={() => handleDelete(deleteTarget)} className="btn-danger flex-1 justify-center py-2.5 text-[13px]">Delete</button>
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1 justify-center py-2.5 text-[13px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
