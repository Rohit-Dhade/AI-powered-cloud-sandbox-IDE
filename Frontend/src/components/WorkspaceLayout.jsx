import { useState, useRef, useCallback, useEffect } from 'react';
import ChatPanel from './ChatPanel';
import PreviewPanel from './PreviewPanel';
import TerminalPanel from './TerminalPanel';
import FileExplorer from './FileExplorer';
import { useSandbox } from '../context/SandboxContext';

const TABS = ['Preview', 'Files'];
const BOTTOM_TABS = ['Terminal', 'Logs'];

function ResizeHandleH({ onResize }) {
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onMouseDown = useCallback((e) => {
    dragging.current = true;
    startX.current = e.clientX;
    startWidth.current = e.currentTarget.parentElement?.getBoundingClientRect().width || 0;

    const onMouseMove = (e) => {
      if (!dragging.current) return;
      onResize(e.clientX - startX.current);
    };
    const onMouseUp = () => {
      dragging.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [onResize]);

  return (
    <div
      onMouseDown={onMouseDown}
      className="resize-handle w-1 flex-shrink-0 relative group"
    >
      <div className="absolute inset-0 group-hover:bg-indigo-500/40 transition-colors duration-150" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full bg-white/10 group-hover:bg-indigo-400/60 transition-colors duration-150" />
    </div>
  );
}

function ResizeHandleV({ onResize }) {
  const dragging = useRef(false);
  const startY = useRef(0);

  const onMouseDown = useCallback((e) => {
    dragging.current = true;
    startY.current = e.clientY;

    const onMouseMove = (e) => {
      if (!dragging.current) return;
      onResize(e.clientY - startY.current);
      startY.current = e.clientY;
    };
    const onMouseUp = () => {
      dragging.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [onResize]);

  return (
    <div
      onMouseDown={onMouseDown}
      className="resize-handle-v h-1 flex-shrink-0 relative group"
    >
      <div className="absolute inset-0 group-hover:bg-indigo-500/40 transition-colors duration-150" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-0.5 w-8 rounded-full bg-white/10 group-hover:bg-indigo-400/60 transition-colors duration-150" />
    </div>
  );
}

export default function WorkspaceLayout() {
  const { sandbox } = useSandbox();
  const { sandboxId, previewUrl } = sandbox;

  // Panel state
  const [chatWidth, setChatWidth] = useState(340);
  const [rightTopHeight, setRightTopHeight] = useState(null); // null = auto (60%)
  const [activeRightTab, setActiveRightTab] = useState('Preview');
  const [activeBottomTab, setActiveBottomTab] = useState('Terminal');

  const containerRef = useRef(null);

  // Compute rightTopHeight default based on container
  useEffect(() => {
    const el = containerRef.current;
    if (el && rightTopHeight === null) {
      setRightTopHeight(Math.floor(el.getBoundingClientRect().height * 0.6));
    }
  }, [rightTopHeight]);

  const handleChatResize = useCallback((dx) => {
    setChatWidth(w => Math.max(260, Math.min(600, w + dx)));
  }, []);

  const handleVerticalResize = useCallback((dy) => {
    setRightTopHeight(h => {
      const el = containerRef.current;
      const maxH = el ? el.getBoundingClientRect().height - 120 : 600;
      return Math.max(120, Math.min(maxH, (h || 400) + dy));
    });
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f]">
      {/* Top navigation bar */}
      <header className="flex items-center gap-4 px-4 py-2.5 border-b border-white/5 bg-[#0f0f1a] flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M7 8l2 2-2 2M11 12h4" />
            </svg>
          </div>
          <span className="font-bold text-sm text-slate-200">SandboxAI</span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-white/10" />

        {/* Sandbox badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg glass">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-slate-400">{sandboxId.slice(0, 18)}…</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 glass hover:text-white hover:border-indigo-500/30 transition-all duration-200"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Open Preview
          </a>
        </div>
      </header>

      {/* Main content */}
      <div ref={containerRef} className="flex flex-1 min-h-0">
        {/* Chat panel */}
        <div className="flex-shrink-0 flex flex-col border-r border-white/5" style={{ width: `${chatWidth}px` }}>
          <ChatPanel sandboxId={sandboxId} />
        </div>

        {/* Horizontal resize handle */}
        <ResizeHandleH onResize={handleChatResize} />

        {/* Right side: preview + terminal stacked */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Right top: tab panel */}
          <div className="flex flex-col border-b border-white/5" style={rightTopHeight ? { height: `${rightTopHeight}px`, minHeight: 0 } : { flex: '3', minHeight: 0 }}>
            {/* Tab bar */}
            <div className="flex items-center gap-0 border-b border-white/5 bg-[#0f0f1a] flex-shrink-0">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveRightTab(tab)}
                  className={`px-5 py-2.5 text-xs font-medium border-b-2 transition-all duration-200
                    ${activeRightTab === tab
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                      : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/3'}`}
                >
                  {tab === 'Preview' && (
                    <span className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                      {tab}
                    </span>
                  )}
                  {tab === 'Files' && (
                    <span className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                      {tab}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {activeRightTab === 'Preview' && <PreviewPanel previewUrl={previewUrl} />}
              {activeRightTab === 'Files' && <FileExplorer sandboxId={sandboxId} />}
            </div>
          </div>

          {/* Vertical resize */}
          <ResizeHandleV onResize={handleVerticalResize} />

          {/* Bottom panel: terminal */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Bottom tab bar */}
            <div className="flex items-center gap-0 border-b border-white/5 bg-[#0f0f1a] flex-shrink-0">
              {BOTTOM_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveBottomTab(tab)}
                  className={`px-5 py-2.5 text-xs font-medium border-b-2 transition-all duration-200
                    ${activeBottomTab === tab
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                      : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/3'}`}
                >
                  {tab === 'Terminal' && (
                    <span className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="4 17 10 11 4 5" />
                        <line x1="12" y1="19" x2="20" y2="19" />
                      </svg>
                      {tab}
                    </span>
                  )}
                  {tab === 'Logs' && (
                    <span className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                      {tab}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Terminal content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {activeBottomTab === 'Terminal' && <TerminalPanel sandboxId={sandboxId} />}
              {activeBottomTab === 'Logs' && (
                <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-500 h-full">
                  <p className="text-emerald-400">✓ Sandbox started: {sandboxId}</p>
                  <p className="mt-1">Preview URL: {previewUrl}</p>
                  <p className="mt-1 text-slate-600">Waiting for activity…</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
