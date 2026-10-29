import React, { useState } from 'react';
import { AuthPage } from './components/dashboard/AuthPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { Editor } from './components/editor/Editor';
import { useAuthStore } from './store/authStore';
import { useEditorStore } from './store/editorStore';
import type { Project } from './types';

type View = 'auth' | 'dashboard' | 'editor';

export default function App() {
  const { isAuthenticated } = useAuthStore();
  const { project } = useEditorStore();
  const [view, setView] = useState<View>(isAuthenticated ? 'dashboard' : 'auth');

  // Sync auth state
  React.useEffect(() => {
    if (!isAuthenticated && view !== 'auth') setView('auth');
  }, [isAuthenticated]);

  const handleOpenEditor = (_p: Project) => {
    setView('editor');
  };

  // Listen for auth store changes
  React.useEffect(() => {
    if (isAuthenticated && view === 'auth') {
      setView('dashboard');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return <AuthPage />;

  if (view === 'editor' && project) {
    return <Editor onBackToDashboard={() => setView('dashboard')} />;
  }

  return <Dashboard onOpenEditor={handleOpenEditor} />;
}
