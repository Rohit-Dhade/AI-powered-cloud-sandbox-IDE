import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import GoogleLoginButton from './GoogleLoginButton';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="w-full h-16 border-b border-indigo-500/15 bg-[#020617]/80 backdrop-blur-xl px-6 flex items-center justify-between z-50 sticky top-0 shadow-lg shadow-black/40">
      {/* Brand logo */}
      <Link to="/" className="flex items-center gap-3.5 group">
        <div className="relative flex items-center justify-center">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 shadow-md shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
              <path d="M7 8l2 2-2 2M11 12h4" />
            </svg>
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="font-extrabold text-lg leading-none tracking-tight gradient-text">SandboxAI</span>
          <span className="text-[9px] font-mono tracking-widest text-cyan-400/80 mt-1 uppercase">Luminous Nexus</span>
        </div>
      </Link>

      {/* Auth State & Action */}
      <div className="flex items-center gap-3.5">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0d1c2d] border border-indigo-500/30 shadow-inner">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full border border-cyan-400/50 shadow-sm" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-xs text-white font-bold">
                  {user.name?.[0] || 'U'}
                </div>
              )}
              <span className="text-xs font-semibold text-slate-100">{user.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <button
              onClick={logout}
              className="text-xs font-semibold text-slate-300 hover:text-rose-400 px-4 py-2 rounded-xl border border-slate-700/60 hover:border-rose-500/40 bg-[#0d1c2d]/60 hover:bg-rose-950/20 transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              Sign In
            </Link>
            <GoogleLoginButton text="Continue with Google" className="!py-2 !px-4 !text-xs !rounded-xl" />
          </div>
        )}
      </div>
    </header>
  );
}
