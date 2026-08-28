import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSandbox } from '../context/SandboxContext';
import { useAuth } from '../context/AuthContext';
import ChatPanel from './ChatPanel';
import FileExplorer from './FileExplorer';
import TerminalPanel from './TerminalPanel';
import PreviewPanel from './PreviewPanel';

export default function WorkspaceLayout() {
  const { sandbox, clearSandbox } = useSandbox();
  const sandboxId = sandbox?.sandboxId;
  const previewUrl = sandbox?.previewUrl;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'code' | 'logs'
  const [activeRightTab, setActiveRightTab] = useState('preview'); // 'preview' | 'terminal'
  const [logs, setLogs] = useState([]);
  const [leftWidth, setLeftWidth] = useState(42); // percentage
  const isDraggingLeft = useRef(false);

  // Resize left panel
  const handleLeftMouseDown = () => {
    isDraggingLeft.current = true;
    document.addEventListener('mousemove', handleLeftMouseMove);
    document.addEventListener('mouseup', handleLeftMouseUp);
  };

  const handleLeftMouseMove = (e) => {
    if (!isDraggingLeft.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth >= 25 && newWidth <= 65) {
      setLeftWidth(newWidth);
    }
  };

  const handleLeftMouseUp = () => {
    isDraggingLeft.current = false;
    document.removeEventListener('mousemove', handleLeftMouseMove);
    document.removeEventListener('mouseup', handleLeftMouseUp);
  };

  // Tool logs callback
  const handleToolLog = useCallback((data, type = 'tool') => {
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), data, type, timestamp: Date.now() }]);
  }, []);

  const handleClearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const handleExit = () => {
    clearSandbox();
    navigate('/');
  };

  if (!sandboxId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] text-slate-100 p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_20px_rgba(34,211,238,0.15)] animate-pulse">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Active Sandbox Session</h2>
        <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
          Please create a new project or select an existing project from your dashboard to launch a sandbox environment.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3.5 rounded-2xl font-semibold text-white text-sm luminous-btn-primary shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          ← Return to Dashboard & Projects
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans">
      {/* Workspace Top Header */}
      <header className="h-14 flex items-center justify-between px-5 border-b border-indigo-500/15 bg-[#051424] z-30 shadow-md">
        {/* Left: Brand + Project Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <span className="font-extrabold text-sm gradient-text tracking-tight">SandboxAI</span>
          </div>

          <div className="h-4 w-px bg-slate-700/60" />

          {/* Sandbox Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d1c2d] border border-indigo-500/20 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-slate-300">
              ID: <span className="text-cyan-300 font-bold">{sandboxId.slice(0, 10)}…</span>
            </span>
          </div>
        </div>

        {/* Middle: Tab Controls for Left Panel */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0d1c2d] border border-indigo-500/20 shadow-inner">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span>✦</span>
            <span>AI Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'code'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span>📁</span>
            <span>Files</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span>📋</span>
            <span>Logs</span>
            {logs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-400 text-slate-950 font-bold">
                {logs.length}
              </span>
            )}
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d1c2d] border border-indigo-500/20 text-xs">
              <span className="text-slate-400 font-mono">User:</span>
              <span className="text-slate-200 font-semibold">{user.name || user.email}</span>
            </div>
          )}

          <button
            onClick={handleExit}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-medium transition-all cursor-pointer shadow-sm"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
            <span>Exit Sandbox</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Left Panel */}
        <div className="flex flex-col min-h-0 bg-[#051424]" style={{ width: `${leftWidth}%` }}>
          {activeTab === 'chat' && (
            <ChatPanel
              sandboxId={sandboxId}
              onToolLog={handleToolLog}
              onClearLogs={handleClearLogs}
            />
          )}
          {activeTab === 'code' && (
            <FileExplorer sandboxId={sandboxId} />
          )}
          {activeTab === 'logs' && (
            <div className="flex flex-col h-full bg-[#020617]">
              <div className="flex items-center justify-between px-5 py-3 border-b border-indigo-500/15 bg-[#051424]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Agent Execution Logs</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-[#0d1c2d]">
                    {logs.length} entries
                  </span>
                </div>
                <button
                  onClick={handleClearLogs}
                  className="px-3 py-1 rounded-lg text-xs font-mono text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-slate-700/60 transition-all cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 font-mono text-xs space-y-2.5 bg-[#020617]">
                {logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                    <p>No agent execution logs yet</p>
                    <p className="text-[11px] text-slate-600">Tool invocations will appear here in real-time</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-3 rounded-xl border leading-relaxed ${
                        log.type === 'error'
                          ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                          : 'bg-[#051424] border-indigo-500/20 text-cyan-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5">
                        <span className="uppercase tracking-wider font-bold text-indigo-400">[{log.type}]</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <pre className="whitespace-pre-wrap font-mono text-xs">{log.data}</pre>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Resizer Handle */}
        <div
          onMouseDown={handleLeftMouseDown}
          className="w-1.5 bg-[#020617] hover:bg-cyan-400/50 cursor-col-resize flex items-center justify-center group transition-colors z-20"
        >
          <div className="w-0.5 h-8 bg-slate-700 group-hover:bg-cyan-400 rounded-full transition-colors" />
        </div>

        {/* Right Panel (Preview & Terminal) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#020617]">
          {/* Right Panel Header / Tab switcher */}
          <div className="h-10 flex items-center justify-between px-4 border-b border-indigo-500/15 bg-[#051424]">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveRightTab('preview')}
                className={`flex items-center gap-2 px-3.5 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  activeRightTab === 'preview'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>👁️</span>
                <span>Live Preview</span>
              </button>
              <button
                onClick={() => setActiveRightTab('terminal')}
                className={`flex items-center gap-2 px-3.5 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  activeRightTab === 'terminal'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>💻</span>
                <span>Terminal</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-500 truncate max-w-xs">
              {previewUrl}
            </span>
          </div>

          {/* Right Panel Content */}
          <div className="flex-1 min-h-0">
            {activeRightTab === 'preview' ? (
              <PreviewPanel previewUrl={previewUrl} />
            ) : (
              <TerminalPanel sandboxId={sandboxId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
