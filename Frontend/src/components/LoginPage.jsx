import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import GoogleLoginButton from './GoogleLoginButton';
import Navbar from './Navbar';

export default function LoginPage() {
  const { login, isAuthenticated, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectNotice = location.state?.message;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      // Error handled in auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-slate-100">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative overflow-hidden">
        {/* Ambient background blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, #4f46e5 0%, #22d3ee 60%, transparent 80%)', filter: 'blur(80px)' }} />

        <div className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-3xl glass-panel shadow-2xl animate-fade-slide-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 shadow-lg shadow-indigo-500/30">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h1>
            <p className="text-xs sm:text-sm text-slate-400">Sign in to access your AI frontend sandboxes</p>
          </div>

          {/* Redirect Notice */}
          {redirectNotice && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium text-center leading-normal">
              🔒 {redirectNotice}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium text-center">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 text-left">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4.5 py-3.5 rounded-2xl bg-[#051424]/90 border border-slate-700/60 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-sm shadow-inner transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5 text-left">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4.5 py-3.5 rounded-2xl bg-[#051424]/90 border border-slate-700/60 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-sm shadow-inner transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 rounded-2xl font-semibold text-white text-sm luminous-btn-primary transition-all duration-200 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-cyan-300 rounded-full animate-spin" />
                  Signing In…
                </span>
              ) : (
                'Sign In with Email'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-7 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-indigo-500/20" />
            </div>
            <span className="relative px-4 bg-[#0d1c2d] text-[11px] font-mono uppercase text-slate-400">
              Or continue with
            </span>
          </div>

          {/* Google Single Sign-On Button */}
          <GoogleLoginButton text="Sign in with Google" className="w-full !py-3.5 !rounded-2xl shadow-indigo-500/20" />

          {/* Footer note */}
          <p className="mt-8 text-xs text-slate-500 text-center">
            By signing in, you agree to SandboxAI's Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
