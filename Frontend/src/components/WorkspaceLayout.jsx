import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSandbox } from '../context/SandboxContext';
import { useAuth } from '../context/AuthContext';
import AIAssistantPanel from './AIAssistantPanel';
import CodeEditorPanel from './CodeEditorPanel';
import LivePreviewPanel from './LivePreviewPanel';
import BottomTerminalPanel from './BottomTerminalPanel';

/* ═══════════════════════════════════════════════════════════════════════════════
   WORKSPACE LAYOUT SHELL — Monochrome Industrial
   Reference: stitch_sandboxai_industrial_redesign/code.html
   Design:    stitch_sandboxai_industrial_redesign/DESIGN.md
   ═══════════════════════════════════════════════════════════════════════════════ */

const NAV_TABS = [
  { id: 'explorer', label: 'Explorer', icon: 'folder_open' },
  { id: 'search', label: 'Search', icon: 'search' },
  { id: 'extensions', label: 'Extensions', icon: 'extension' },
  { id: 'source_control', label: 'Source Control', icon: 'account_tree' },
];

export default function WorkspaceLayout() {
  const { sandbox, clearSandbox } = useSandbox();
  const sandboxId = sandbox?.sandboxId;
  const { user } = useAuth();
  const navigate = useNavigate();

  // Active navigation tab state (drives active styling for both top nav tabs and left rail icons)
  const [activeNavTab, setActiveNavTab] = useState('explorer');

  const handleExit = () => {
    clearSandbox();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden antialiased selection:bg-white/20 bg-[#0a0a0a] text-[#e5e2e1] font-sans">
      {/* ═══════════════════════════════════════════════════════════════════════
          TOP HEADER BAR (hidden on mobile, visible md:flex)
          ═══════════════════════════════════════════════════════════════════════ */}
      <header className="hidden md:flex justify-between items-center px-panel-padding w-full h-14 bg-surface text-primary font-body-md text-body-md border-b border-white/10 shrink-0 z-20">
        {/* Left: Logo / Wordmark */}
        <div className="flex items-center gap-4">
          <span className="font-headline-md text-headline-md font-bold text-on-surface">
            SandboxAI
          </span>
          {sandboxId && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ID: {sandboxId.slice(0, 8)}…</span>
            </div>
          )}
        </div>

        {/* Middle: Navigation Tabs for TopNav */}
        <nav className="flex gap-gutter items-center h-full">
          {NAV_TABS.map((tab) => {
            const isActive = activeNavTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveNavTab(tab.id)}
                className={`h-full flex items-center font-label-sm text-label-sm transition-colors duration-150 active:scale-95 cursor-pointer border-0 bg-transparent ${
                  isActive
                    ? 'text-primary border-b-2 border-primary pb-1 font-medium'
                    : 'text-on-surface-variant hover:text-on-surface hover:border-white/30'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Icon buttons + User Avatar */}
        <div className="flex items-center gap-4">
          <button
            title="Circle indicator"
            className="material-symbols-outlined cursor-pointer hover:border-white/30 hover:text-white transition-colors duration-150 active:scale-95 text-on-surface-variant text-body-md border-0 bg-transparent p-0"
          >
            circle
          </button>
          <button
            title="Terminal view"
            className="material-symbols-outlined cursor-pointer hover:border-white/30 hover:text-white transition-colors duration-150 active:scale-95 text-on-surface-variant text-body-md border-0 bg-transparent p-0"
          >
            terminal
          </button>
          <button
            onClick={() => setActiveNavTab('settings')}
            title="Settings"
            className="material-symbols-outlined cursor-pointer hover:border-white/30 hover:text-white transition-colors duration-150 active:scale-95 text-on-surface-variant text-body-md border-0 bg-transparent p-0"
          >
            settings
          </button>

          {/* User avatar or fallback */}
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || 'User avatar'}
              className="w-8 h-8 rounded-full border border-white/10 ml-2 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full border border-white/10 ml-2 bg-white/10 flex items-center justify-center text-xs font-bold text-primary">
              {user?.name?.[0] || 'U'}
            </div>
          )}

          <button
            onClick={handleExit}
            title="Exit Workspace"
            className="ml-2 text-xs font-mono px-3 py-1 rounded border border-white/10 hover:border-white/30 text-on-surface-variant hover:text-white active:scale-95 transition-colors duration-150 cursor-pointer"
          >
            Exit
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════
          MIDDLE BODY: LEFT RAIL + MAIN CONTENT AREA
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── Left Icon Rail (hidden on mobile, visible md:flex) ─── */}
        <aside className="hidden md:flex flex-col items-center py-4 gap-stack-gap h-full w-16 bg-surface text-primary font-label-sm text-label-sm border-r border-white/10 shrink-0 transition-all duration-200">
          {/* Top: Project Icon */}
          <div className="mb-6 flex flex-col items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 rounded border border-white/10 group-hover:border-white/30 transition-colors bg-surface-container-high flex items-center justify-center text-primary font-bold text-sm">
              <span className="material-symbols-outlined text-xl">token</span>
            </div>
          </div>

          {/* Middle: 4 Main Nav Icon Buttons */}
          <div className="flex flex-col w-full px-2 gap-2 flex-1">
            {NAV_TABS.map((tab) => {
              const isActive = activeNavTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveNavTab(tab.id)}
                  title={tab.label}
                  className={`w-full h-12 flex justify-center items-center rounded transition-all duration-200 cursor-pointer border-0 bg-transparent ${
                    isActive
                      ? 'text-primary bg-white/5 hover:bg-white/10'
                      : 'text-on-surface-variant hover:bg-white/10 hover:text-on-surface'
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {tab.icon}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Pinned Tabs: Account & Settings */}
          <div className="flex flex-col w-full px-2 gap-2 mt-auto">
            <button
              onClick={() => setActiveNavTab('account')}
              title="Account"
              className={`w-full h-12 flex justify-center items-center rounded transition-all duration-200 cursor-pointer border-0 bg-transparent ${
                activeNavTab === 'account'
                  ? 'text-primary bg-white/5 hover:bg-white/10'
                  : 'text-on-surface-variant hover:bg-white/10 hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined">person</span>
            </button>
            <button
              onClick={() => setActiveNavTab('settings')}
              title="Settings"
              className={`w-full h-12 flex justify-center items-center rounded transition-all duration-200 cursor-pointer border-0 bg-transparent ${
                activeNavTab === 'settings'
                  ? 'text-primary bg-white/5 hover:bg-white/10'
                  : 'text-on-surface-variant hover:bg-white/10 hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </aside>

        {/* ─── Main Content Area: 12-Column Responsive Grid Container ─── */}
        <main className="flex-1 flex flex-col p-panel-padding gap-gutter overflow-y-auto md:overflow-hidden bg-[#0a0a0a]">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-gutter min-h-0">
            {/* Panel 1: AI Assistant (col-span-3) */}
            <div className="md:col-span-3 min-h-[350px] md:min-h-0 h-full">
              <AIAssistantPanel />
            </div>

            {/* Panel 2: Code Editor (col-span-5) */}
            <div className="md:col-span-5 min-h-[400px] md:min-h-0 h-full">
              <CodeEditorPanel />
            </div>

            {/* Panel 3: Live Preview (col-span-4) */}
            <div className="md:col-span-4 min-h-[350px] md:min-h-0 h-full">
              <LivePreviewPanel />
            </div>
          </div>

          {/* Bottom Panel: Terminal & Logs (Full width 12 cols / bottom) */}
          <div className="mt-gutter md:mt-0">
            <BottomTerminalPanel />
          </div>
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          FIXED BOTTOM STATUS BAR FOOTER
          ═══════════════════════════════════════════════════════════════════════ */}
      <footer className="w-full h-8 flex justify-between items-center px-4 bg-surface-container-lowest text-on-surface-variant font-code-md text-code-md border-t border-white/10 shrink-0 relative z-10">
        <div>
          <span>© {new Date().getFullYear()} SandboxAI</span>
        </div>
        <div className="flex gap-4">
          <span className="cursor-pointer hover:text-primary transition-colors duration-150">
            Status: Online
          </span>
          <span className="cursor-pointer hover:text-primary transition-colors duration-150">
            Logs
          </span>
          <span className="cursor-pointer hover:text-primary transition-colors duration-150 text-primary">
            Terminal
          </span>
        </div>
      </footer>
    </div>
  );
}
