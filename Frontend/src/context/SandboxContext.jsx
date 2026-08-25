import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { startSandbox, createProject } from '../services/api';

const SandboxContext = createContext(null);

const SESSION_KEY = 'sandbox_session';

function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(data) {
  try {
    if (data) sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch { /* storage quota / private mode */ }
}

export function SandboxProvider({ children }) {
  // Restore from sessionStorage on first render so reloads keep the workspace
  const [sandbox, setSandbox] = useState(() => readSession());
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  // Keep sessionStorage in sync whenever sandbox changes
  useEffect(() => {
    writeSession(sandbox);
  }, [sandbox]);

  const createSandbox = useCallback(async (projectTitle) => {
    setStarting(true);
    setError(null);
    try {
      const title = typeof projectTitle === 'string' && projectTitle.trim() ? projectTitle.trim() : 'Untitled Project';
      const projectData = await createProject(title);
      const projectId = projectData.project._id;

      const data = await startSandbox(projectId);
      setSandbox({ sandboxId: data.sandboxId, previewUrl: data.previewUrl, projectId, title });
    } catch (err) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized') || err.message?.includes('missing')) {
        setError('Authentication required. Please sign in with Google to create a project.');
      } else {
        setError(err.message);
      }
    } finally {
      setStarting(false);
    }
  }, []);


  /** Resume an existing project by spinning up a new sandbox pod for it */
  const resumeSandbox = useCallback(async (project) => {
    setStarting(true);
    setError(null);
    try {
      const data = await startSandbox(project._id);
      setSandbox({ sandboxId: data.sandboxId, previewUrl: data.previewUrl, projectId: project._id, title: project.title });
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  }, []);

  /** Clear the active sandbox and go back to the landing/project-list page */
  const clearSandbox = useCallback(() => {
    setSandbox(null);
  }, []);

  return (
    <SandboxContext.Provider value={{ sandbox, starting, error, createSandbox, resumeSandbox, clearSandbox }}>
      {children}
    </SandboxContext.Provider>
  );
}

export function useSandbox() {
  const ctx = useContext(SandboxContext);
  if (!ctx) throw new Error('useSandbox must be used within SandboxProvider');
  return ctx;
}
