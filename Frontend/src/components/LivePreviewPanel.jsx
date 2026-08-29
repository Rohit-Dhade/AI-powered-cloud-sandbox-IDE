import { useState } from 'react';

export default function LivePreviewPanel() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <section className="h-full flex flex-col bg-surface border border-white/10 rounded-lg overflow-hidden relative">
      {/* Mock Browser Bar */}
      <div className="h-10 border-b border-white/10 flex items-center px-3 bg-surface-container-low shrink-0 gap-3">
        {/* Traffic-light Dots */}
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
        </div>

        {/* URL Pill */}
        <div className="flex-1 flex items-center bg-[#0a0a0a] border border-white/10 rounded h-6 px-2 gap-2">
          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
            lock
          </span>
          <span className="font-code-md text-[11px] text-on-surface-variant truncate">
            localhost:3000/preview
          </span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          title="Refresh Preview"
          className="text-on-surface-variant hover:text-white transition-colors duration-150 active:scale-95 border-0 bg-transparent cursor-pointer p-0 flex items-center justify-center"
        >
          <span
            className={`material-symbols-outlined text-[16px] ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          >
            refresh
          </span>
        </button>
      </div>

      {/* White Preview Content Area */}
      <div className="flex-1 bg-white flex items-center justify-center p-4 relative overflow-auto">
        {/* Profile Card Preview */}
        <div className="w-full max-w-sm p-6 border border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center gap-4 text-black">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-400 text-3xl">
              person
            </span>
          </div>
          <div className="text-center">
            <h3 className="text-gray-900 font-bold text-lg font-sans">
              Jane Doe
            </h3>
            <p className="text-gray-500 text-sm font-sans">
              Senior UI Engineer
            </p>
          </div>
          <button className="w-full bg-black text-white rounded px-4 py-2 text-sm font-medium hover:bg-gray-800 active:scale-95 transition-all duration-150 border-0 cursor-pointer">
            Connect
          </button>
        </div>
      </div>
    </section>
  );
}
