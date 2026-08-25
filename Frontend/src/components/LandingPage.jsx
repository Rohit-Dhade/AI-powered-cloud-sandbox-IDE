import { useState, useEffect, useCallback } from 'react';
import { useSandbox } from '../context/SandboxContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../services/api';
import Navbar from './Navbar';
import GoogleLoginButton from './GoogleLoginButton';

export default function LandingPage() {
  const { starting, error, createSandbox, resumeSandbox } = useSandbox();
  const { isAuthenticated, user } = useAuth();
  const [projectTitle, setProjectTitle] = useState('');
  const [authRequiredNotice, setAuthRequiredNotice] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState(null);
  const [launchingProjectId, setLaunchingProjectId] = useState(null);
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingProjects(true);
    setProjectsError(null);
    try {
      const data = await getProjects();
      setProjects(data.projects || []);
    } catch (err) {
      setProjectsError(err.message);
    } finally {
      setLoadingProjects(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateSandbox = (e) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    if (!isAuthenticated) {
      setAuthRequiredNotice(true);
      return;
    }

    setAuthRequiredNotice(false);
    createSandbox(projectTitle.trim());
  };

  const handleResumeProject = async (project) => {
    setLaunchingProjectId(project._id);
    try {
      await resumeSandbox(project);
    } finally {
      setLaunchingProjectId(null);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-[#020617] text-slate-100 overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <div className="relative flex-1 flex flex-col items-center justify-start px-6 sm:px-8 py-16 overflow-hidden">
        {/* Animated background orbs & deep space grid */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)', filter: 'blur(70px)' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)', filter: 'blur(70px)' }} />
          <div className="absolute top-[35%] right-[25%] w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)', filter: 'blur(50px)' }} />
          {/* Luminous grid pattern */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* Hero Section */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full animate-fade-slide-in">
          {/* Brand Icon */}
          <div className="mb-6 relative">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center animate-pulse-glow"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
                <path d="M7 8l2 2-2 2M11 12h4" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center shadow-[0_0_12px_#22d3ee]">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
            <span className="gradient-text">SandboxAI</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 mb-3 font-medium">AI-Powered Frontend Development Studio</p>
          <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
            Spin up an isolated sandbox, describe your UI to the AI, and watch your frontend come alive — with live preview and terminal access.
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {[
              { icon: '⚡', label: 'Instant Sandbox' },
              { icon: '🤖', label: 'AI Code Gen' },
              { icon: '👁️', label: 'Live Preview' },
              { icon: '💻', label: 'Terminal Access' },
            ].map(({ icon, label }) => (
              <span key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-medium text-slate-300 glass border border-indigo-500/20 shadow-sm">
                <span>{icon}</span>
                {label}
              </span>
            ))}
          </div>

          {/* Project Creation Container */}
          <div className="w-full max-w-lg p-8 sm:p-8 rounded-3xl glass-panel shadow-2xl mb-12">
            {/* If NOT authenticated notice */}
            {!isAuthenticated ? (
              <div className="flex flex-col gap-5">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-center gap-2.5 font-medium leading-normal">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>Sign in required to create new projects</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    id="project-title-input"
                    placeholder="Enter Project Title..."
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-[#051424]/90 border border-slate-700/60 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all text-center font-medium text-sm shadow-inner"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <GoogleLoginButton
                    text="Continue with Google to Create Project"
                    className="w-full !py-3.5 !rounded-2xl shadow-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => navigate('/login', { state: { message: 'Sign in to create your project' } })}
                    className="text-xs text-slate-400 hover:text-cyan-400 py-1 transition-colors"
                  >
                    Or view full Sign In page →
                  </button>
                </div>
              </div>
            ) : (
              /* Authenticated Form */
              <form onSubmit={handleCreateSandbox} className="flex flex-col gap-5">
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#0d1c2d]/80 border border-indigo-500/30 text-xs text-emerald-400 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
                    <span>Logged in as {user?.name || user?.email}</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400">New Project</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    id="project-title-input"
                    placeholder="Enter Project Title..."
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    disabled={starting}
                    className="w-full px-5 py-4 rounded-2xl bg-[#051424]/90 border border-slate-700/60 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all text-center font-medium text-sm shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  id="start-sandbox-btn"
                  disabled={starting || !projectTitle.trim()}
                  className="relative group w-full py-4 rounded-2xl text-white font-semibold text-base luminous-btn-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden shadow-lg"
                >
                  <span className="relative flex items-center justify-center gap-3">
                    {starting && !launchingProjectId ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-cyan-300 rounded-full animate-spin" />
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
              </form>
            )}
          </div>

          {/* Auth Required Notice */}
          {authRequiredNotice && (
            <div className="mt-2 p-3.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-medium animate-bounce mb-6">
              ⚠️ User is not logged in. Please click "Continue with Google" above to sign in and create your project.
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-8 px-6 py-3.5 rounded-xl text-rose-300 text-sm glass border border-rose-500/30">
              <span className="font-semibold">Notice:</span> {error}
            </div>
          )}
        </div>

        {/* Previous Projects Section */}
        {isAuthenticated && (
          <div className="relative z-10 w-full max-w-4xl mt-4 animate-fade-slide-in">
            <div className="flex items-center justify-between mb-8 border-b border-indigo-500/15 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.15)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white text-left">Your Previous Projects</h2>
                  <p className="text-xs text-slate-400 text-left mt-0.5">Select a project to resume its sandbox environment</p>
                </div>
              </div>

              <button
                onClick={fetchProjects}
                disabled={loadingProjects}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d1c2d] hover:bg-[#122131] border border-indigo-500/30 text-xs font-mono font-medium text-slate-300 hover:text-cyan-400 transition-all cursor-pointer shadow-sm"
                title="Refresh projects"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={loadingProjects ? 'animate-spin' : ''}
                >
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                Refresh
              </button>
            </div>

            {loadingProjects && projects.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="p-6 rounded-2xl glass-card animate-pulse flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80" />
                    <div className="h-5 bg-slate-800/80 rounded-md w-3/4" />
                    <div className="h-3 bg-slate-800/60 rounded-md w-1/2" />
                  </div>
                ))}
              </div>
            ) : projectsError ? (
              <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-800/40 text-rose-300 text-sm text-center">
                Failed to load projects: {projectsError}
              </div>
            ) : projects.length === 0 ? (
              <div className="p-10 rounded-3xl glass-panel text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-slate-400 mb-1">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-slate-200">No previous projects found</p>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">Enter a project title above and click "Create Sandbox" to build your first project!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {projects.map((project) => {
                  const isLaunching = launchingProjectId === project._id || (starting && project._id === launchingProjectId);
                  const formattedDate = project.createdAt
                    ? new Date(project.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent';

                  return (
                    <div
                      key={project._id}
                      className="group relative p-6 rounded-2xl glass-card text-left flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-cyan-300 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(34,211,238,0.15)]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                            </svg>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">{formattedDate}</span>
                        </div>

                        <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {project.title || 'Untitled Project'}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono mb-6">
                          ID: {project._id.slice(-8)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleResumeProject(project)}
                        disabled={starting}
                        className="w-full py-3 px-4 rounded-xl bg-indigo-600/15 hover:bg-indigo-600 border border-indigo-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                      >
                        {isLaunching ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-cyan-300/30 border-t-cyan-300 rounded-full animate-spin" />
                            <span>Launching...</span>
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            <span>Resume Sandbox</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer hint */}
        <p className="mt-14 text-xs font-mono text-slate-500 text-center">
          Each sandbox runs in an isolated Kubernetes container with full HMR support
        </p>
      </div>
    </div>
  );
}
