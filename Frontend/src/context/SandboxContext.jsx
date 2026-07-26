import { createContext, useContext, useState, useCallback } from 'react';
import { startSandbox } from '../services/api';

const SandboxContext = createContext(null);

export function SandboxProvider({ children }) {
  const [sandbox, setSandbox] = useState(null); // { sandboxId, previewUrl }
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  const createSandbox = useCallback(async () => {
    setStarting(true);
    setError(null);
    try {
      const data = await startSandbox();
      setSandbox({ sandboxId: data.sandboxId, previewUrl: data.previewUrl });
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  }, []);

  return (
    <SandboxContext.Provider value={{ sandbox, starting, error, createSandbox }}>
      {children}
    </SandboxContext.Provider>
  );
}

export function useSandbox() {
  const ctx = useContext(SandboxContext);
  if (!ctx) throw new Error('useSandbox must be used within SandboxProvider');
  return ctx;
}
