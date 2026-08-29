import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import GoogleLoginButton from './GoogleLoginButton';

/* ═══════════════════════════════════════════════════════════════════════════════
   LOGIN PAGE — Monochrome Industrial
   Design system: Dark mode, precise line borders, Geist/Fira Code fonts
   Authentication: Google OAuth 2.0 (Backend Passport Session & JWT Cookie)
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function LoginPage() {
  const { isAuthenticated, error, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve any redirect state passed from ProtectedRoute
  const redirectNotice = location.state?.message || location.state?.from?.pathname 
    ? `Authentication required to access ${location.state?.from?.pathname || 'the workspace'}.`
    : null;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen w-full bg-[#0b0b0b] text-[#e5e2e1] flex flex-col items-center justify-center p-6 sm:p-10 select-none overflow-y-auto">
      {/* Container */}
      <div className="w-full max-w-[420px] flex flex-col items-center">

        {/* ────────────── Brand Header ────────────── */}
        <div className="text-center mb-9">
          <Link
            to="/"
            className="
              inline-block
              text-3xl sm:text-4xl
              font-bold
              tracking-[-0.05em]
              text-white
              no-underline
              hover:opacity-85
              transition-opacity
            "
          >
            SandboxAI
          </Link>
          <div className="mt-3 h-px w-10 bg-white/20 mx-auto" />
        </div>

        {/* ────────────── Main Card ────────────── */}
        <div
          className="
            w-full
            bg-[#141414]
            border border-white/10
            rounded-2xl
            p-7 sm:p-9
            shadow-[0_24px_80px_rgba(0,0,0,0.6)]
            flex flex-col
          "
        >
          {/* Card Header */}
          <div className="text-center mb-8">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Sign in to SandboxAI
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-white/60 leading-relaxed">
              Secure single sign-on for developers.
            </p>
          </div>

          {/* ────────────── Dynamic Notices ────────────── */}
          {redirectNotice && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-950/20 p-3.5 text-xs text-amber-200 leading-relaxed">
              <span className="material-symbols-outlined text-sm shrink-0 mt-0.5 text-amber-400">
                lock
              </span>
              <span>{redirectNotice}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-950/20 p-3.5 text-xs text-rose-300 leading-relaxed">
              <span className="material-symbols-outlined text-sm shrink-0 mt-0.5 text-rose-400">
                error
              </span>
              <span>{error}</span>
            </div>
          )}

          {/* ────────────── Primary SSO Action ────────────── */}
          <div className="space-y-4">
            <GoogleLoginButton
              text="Continue with Google"
              monochrome={false}
              className="
                !w-full
                !h-13
                !py-3.5
                !px-5
                !rounded-xl
                !bg-white/5
                !border-white/15
                !text-white
                !text-sm
                !font-medium
                hover:!bg-white/10
                hover:!border-white/30
                active:!scale-[0.98]
                transition-all
                cursor-pointer
                shadow-sm
              "
            />

            <button
              type="button"
              onClick={loginWithGoogle}
              className="
                w-full
                h-13
                py-3.5
                px-5
                rounded-xl
                bg-white
                text-black
                font-semibold
                text-sm
                flex items-center justify-center gap-2.5
                hover:bg-white/90
                active:scale-[0.98]
                transition-all
                cursor-pointer
                shadow-md
              "
            >
              <span className="material-symbols-outlined text-lg">login</span>
              <span>Sign In with Single Sign-On</span>
            </button>
          </div>

          {/* ────────────── Security Badges ────────────── */}
          <div className="mt-8 pt-7 border-t border-white/10 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-xs text-white/50">
              <span className="material-symbols-outlined text-base text-white/40">
                verified_user
              </span>
              <span>Google OAuth 2.0 Verified Sign-In</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/50">
              <span className="material-symbols-outlined text-base text-white/40">
                key
              </span>
              <span>Stateless HTTP-Only JWT Session</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/50">
              <span className="material-symbols-outlined text-base text-white/40">
                terminal
              </span>
              <span>Instant K8s Sandbox Workspace Access</span>
            </div>
          </div>
        </div>

        {/* ────────────── Bottom Navigation & Terms ────────────── */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-xs text-white/50 leading-relaxed max-w-[320px] mx-auto">
            By signing in, you accept the SandboxAI developer terms and service policies.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="
                text-xs
                font-mono
                text-white/40
                hover:text-white
                transition-colors
                inline-flex items-center gap-1.5
                no-underline
              "
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Return to Home
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
