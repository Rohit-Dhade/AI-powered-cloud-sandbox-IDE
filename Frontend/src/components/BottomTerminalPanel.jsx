import { useState } from 'react';

export default function BottomTerminalPanel() {
  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' | 'output' | 'problems'
  const [isExpanded, setIsExpanded] = useState(true);
  const [terminalLogs, setTerminalLogs] = useState([
    { type: 'success', text: 'vite v4.4.5 ready in 240 ms' },
    { type: 'info', text: '➜ Local: http://localhost:3000/' },
    { type: 'info', text: '➜ Network: use --host to expose' },
    { type: 'info', text: '➜ press h to show help' },
  ]);

  const [outputLogs, setOutputLogs] = useState([
    '[build] 42 modules transformed.',
    '[vite] hmr update /src/components/ProfileCard.tsx',
    '[vite] (client) re-optimizing dependencies',
    '[info] compilation finished in 18ms',
  ]);

  const [problems, setProblems] = useState([]);

  const handleClear = () => {
    if (activeTab === 'terminal') setTerminalLogs([]);
    if (activeTab === 'output') setOutputLogs([]);
  };

  return (
    <section
      className={`shrink-0 flex flex-col bg-surface border border-white/10 rounded-lg overflow-hidden transition-all duration-200 ${
        isExpanded ? 'h-48' : 'h-8'
      }`}
    >
      {/* Header Bar */}
      <div className="h-8 border-b border-white/10 flex items-center px-4 bg-surface-container-low shrink-0 select-none">
        <div className="flex items-center gap-4 font-label-sm text-label-sm text-on-surface-variant h-full">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`h-full flex items-center uppercase tracking-wider transition-colors cursor-pointer border-0 bg-transparent px-0 ${
              activeTab === 'terminal'
                ? 'text-primary border-b border-primary font-medium'
                : 'hover:text-white'
            }`}
          >
            Terminal
          </button>
          <button
            onClick={() => setActiveTab('output')}
            className={`h-full flex items-center uppercase tracking-wider transition-colors cursor-pointer border-0 bg-transparent px-0 ${
              activeTab === 'output'
                ? 'text-primary border-b border-primary font-medium'
                : 'hover:text-white'
            }`}
          >
            Output
          </button>
          <button
            onClick={() => setActiveTab('problems')}
            className={`h-full flex items-center uppercase tracking-wider transition-colors cursor-pointer border-0 bg-transparent px-0 ${
              activeTab === 'problems'
                ? 'text-primary border-b border-primary font-medium'
                : 'hover:text-white'
            }`}
          >
            Problems{' '}
            <span className="bg-white/10 px-1.5 py-0.5 rounded-full ml-1 text-[10px] text-on-surface">
              {problems.length}
            </span>
          </button>
        </div>

        {/* Action icons */}
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={handleClear}
            title="Clear Console"
            className="material-symbols-outlined text-[16px] text-on-surface-variant hover:text-white transition-colors border-0 bg-transparent p-0 cursor-pointer active:scale-95"
          >
            delete
          </button>
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            title={isExpanded ? 'Collapse' : 'Expand'}
            className="material-symbols-outlined text-[16px] text-on-surface-variant hover:text-white transition-colors border-0 bg-transparent p-0 cursor-pointer active:scale-95"
          >
            {isExpanded ? 'expand_more' : 'expand_less'}
          </button>
        </div>
      </div>

      {/* Panel Content (only visible when expanded) */}
      {isExpanded && (
        <div className="flex-1 p-3 bg-surface-dim font-code-md text-code-md text-on-surface-variant overflow-y-auto">
          {activeTab === 'terminal' && (
            <div className="flex flex-col gap-1">
              {terminalLogs.map((log, idx) => (
                <div key={idx}>
                  {log.type === 'success' ? (
                    <span className="text-[#98c379]">{log.text}</span>
                  ) : (
                    <span className="text-on-surface">{log.text}</span>
                  )}
                </div>
              ))}
              <div className="mt-2 flex items-center gap-2 text-on-surface">
                <span className="text-[#c678dd]">sandboxai</span>
                <span className="text-[#56b6c2]">@workspace</span>{' '}
                <span className="text-[#e5c07b]">~ %</span>
                <span className="animate-pulse w-2 h-4 bg-white inline-block" />
              </div>
            </div>
          )}

          {activeTab === 'output' && (
            <div className="flex flex-col gap-1 font-mono">
              {outputLogs.length === 0 ? (
                <span className="text-on-surface-variant/50">No output logs</span>
              ) : (
                outputLogs.map((log, idx) => (
                  <div key={idx} className="text-[#61afef]">
                    {log}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'problems' && (
            <div className="flex items-center justify-center h-full text-on-surface-variant/50">
              {problems.length === 0 ? (
                <span>No problems have been detected in the workspace.</span>
              ) : (
                problems.map((p, i) => <div key={i}>{p}</div>)
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
