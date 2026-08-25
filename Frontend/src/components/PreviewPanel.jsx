import { useState, useRef, useEffect } from 'react';

export default function PreviewPanel({ previewUrl }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const iframeRef = useRef(null);
  const [key, setKey] = useState(0);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setIsLoading(true);
    setHasError(false);
    setKey(k => k + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Re-trigger on previewUrl change
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setKey(k => k + 1);
  }, [previewUrl]);

  return (
    <div className="flex flex-col h-full bg-[#020617]">
      {/* Browser chrome toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-indigo-500/15 bg-[#051424]">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_6px_rgba(244,63,94,0.4)]" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
        </div>

        {/* URL bar */}
        <div className="flex-1 flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs text-slate-300 font-mono bg-[#0d1c2d] border border-indigo-500/20 shadow-inner">
          {isLoading && (
            <span className="w-3.5 h-3.5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin flex-shrink-0" />
          )}
          {!isLoading && !hasError && (
            <svg className="text-cyan-400 flex-shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          )}
          {hasError && (
            <svg className="text-rose-400 flex-shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          <span className="truncate">{previewUrl}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            title="Refresh preview"
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-all cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={isRefreshing ? 'animate-spin' : ''}>
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
            </svg>
          </button>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-all cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Preview content */}
      <div className="relative flex-1 min-h-0">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#020617] z-10">
            <div className="w-10 h-10 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-xs font-mono text-cyan-300">Loading live preview…</p>
          </div>
        )}

        {/* Error state */}
        {hasError && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#020617] z-10">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white mb-1">Preview unavailable</p>
              <p className="text-xs text-slate-400 max-w-xs">The sandbox dev server may still be spinning up</p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-xl text-xs font-mono text-cyan-300 bg-[#0d1c2d] border border-cyan-500/30 hover:border-cyan-400 transition-colors cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        <iframe
          key={key}
          ref={iframeRef}
          src={previewUrl}
          onLoad={handleLoad}
          onError={handleError}
          className="w-full h-full border-0"
          title="Sandbox Preview"
          allow="cross-origin-isolated"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}
