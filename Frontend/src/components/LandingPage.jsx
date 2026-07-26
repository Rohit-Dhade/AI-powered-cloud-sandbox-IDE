import { useSandbox } from '../context/SandboxContext';

export default function LandingPage() {
  const { starting, error, createSandbox } = useSandbox();

  return (
    <div className="relative flex flex-col items-center justify-center h-full overflow-hidden bg-[#0a0a0f]">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', filter: 'blur(30px)' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Logo area */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 animate-fade-slide-in">
        {/* Icon */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center animate-pulse-glow"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 50%, #06b6d4 100%)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
              <path d="M7 8l2 2-2 2M11 12h4" />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-6xl font-extrabold tracking-tight mb-4">
          <span className="gradient-text">SandboxAI</span>
        </h1>
        <p className="text-xl text-slate-400 mb-2 font-medium">AI-Powered Frontend Studio</p>
        <p className="text-sm text-slate-500 max-w-md mb-12 leading-relaxed">
          Spin up an isolated sandbox, describe your UI to the AI, and watch your frontend come alive — with live preview and terminal access.
        </p>

        {/* Feature badges */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {[
            { icon: '⚡', label: 'Instant Sandbox' },
            { icon: '🤖', label: 'AI Code Gen' },
            { icon: '👁️', label: 'Live Preview' },
            { icon: '💻', label: 'Terminal Access' },
          ].map(({ icon, label }) => (
            <span key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-slate-300 glass">
              <span>{icon}</span>
              {label}
            </span>
          ))}
        </div>

        {/* CTA Button */}
        <button
          id="start-sandbox-btn"
          onClick={createSandbox}
          disabled={starting}
          className="relative group px-10 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #8b5cf6 100%)' }}
        >
          {/* Hover shine */}
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)' }} />
          <span className="relative flex items-center gap-3">
            {starting ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                Starting Sandbox…
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5,3 19,12 5,21" fill="currentColor" />
                </svg>
                Create Sandbox
              </>
            )}
          </span>
        </button>

        {/* Error */}
        {error && (
          <div className="mt-6 px-6 py-3 rounded-xl text-rose-300 text-sm glass border border-rose-500/20">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {/* Footer hint */}
        <p className="mt-10 text-xs text-slate-600">
          Each sandbox runs in an isolated Kubernetes container with full HMR support
        </p>
      </div>
    </div>
  );
}
