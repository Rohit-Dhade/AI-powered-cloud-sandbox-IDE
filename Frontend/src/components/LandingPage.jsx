import { useState, useEffect, useCallback } from 'react';
import { useSandbox } from '../context/SandboxContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../services/api';
import GoogleLoginButton from './GoogleLoginButton';

/* ═══════════════════════════════════════════════════════════════════════════════
   LANDING PAGE — Monochrome Industrial
   Reference: stitch_sandboxai_industrial_redesign/code_2.html
   Design:    stitch_sandboxai_industrial_redesign/DESIGN.md
   ═══════════════════════════════════════════════════════════════════════════════ */

/* ── Small reusable icon wrapper ── */
function NavIconButton({ icon, label, onClick }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="landing-nav-icon-btn"
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: 18, fontVariationSettings: "'FILL' 0" }}
      >
        {icon}
      </span>
    </button>
  );
}

/* ── Bento feature card ── */
function FeatureCard({ icon, title, description, watermarkIcon, className = '', children }) {
  return (
    <div className={`landing-feature-card ${className}`}>
      {/* Background watermark icon */}
      <div className="landing-feature-watermark">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 120, fontVariationSettings: "'FILL' 0" }}
        >
          {watermarkIcon || icon}
        </span>
      </div>

      {/* Icon badge */}
      <div className="landing-feature-badge">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 20, fontVariationSettings: "'FILL' 1", color: '#ffffff' }}
        >
          {icon}
        </span>
      </div>

      {/* Content + optional children (e.g. code snippet visual) */}
      {children}

      <div className="landing-feature-body">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

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

  /* ── Enable page scrolling while this component is mounted ── */
  useEffect(() => {
    document.documentElement.classList.add('landing-scroll');
    document.body.classList.add('landing-scroll');
    document.getElementById('root')?.classList.add('landing-scroll');

    return () => {
      document.documentElement.classList.remove('landing-scroll');
      document.body.classList.remove('landing-scroll');
      document.getElementById('root')?.classList.remove('landing-scroll');
    };
  }, []);

  /* ── Fetch user projects ── */
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
    <div className="landing-root">
      {/* ═══════════════════════════════════════════════════════════════════════
          TOP NAV — sticky, logo left, icon buttons right
          ═══════════════════════════════════════════════════════════════════════ */}
      <nav id="landing-topnav" className="landing-topnav">
        <div className="landing-topnav-left">
          <span className="landing-wordmark">SandboxAI</span>
        </div>

        <div className="landing-topnav-right">
          {/* Auth controls */}
          {isAuthenticated && user ? (
            <div className="landing-auth-pill">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="landing-auth-avatar" />
              ) : (
                <div className="landing-auth-avatar-fallback">
                  {user.name?.[0] || 'U'}
                </div>
              )}
              <span className="landing-auth-name">{user.name}</span>
              <button onClick={() => {/* logout handled by auth */ }} className="landing-auth-signout">
                Sign Out
              </button>
            </div>
          ) : (
            <GoogleLoginButton text="Sign In" className="!py-1.5 !px-3 !text-xs !rounded" />
          )}

          {/* Icon buttons */}
          <NavIconButton icon="circle" label="Status" />
          <NavIconButton icon="terminal" label="Terminal" />
          <NavIconButton icon="settings" label="Settings" />
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN CONTENT
          ═══════════════════════════════════════════════════════════════════════ */}
      <main className="landing-main">
        {/* Subtle grid background */}
        <div className="landing-grid-bg" />

        {/* ─── Hero Section ─── */}
        <section id="landing-hero" className="landing-hero">
          <div className="landing-hero-text">
            <h1 className="landing-hero-heading">
              The Architecture of{' '}
              <br className="landing-br-desktop" />
              <span className="landing-hero-heading-muted">AI-Native UI</span>
            </h1>
            <p className="landing-hero-sub">
              A developer-centric environment engineered for clarity and technical precision.
              Build, iterate, and deploy with industrial-grade efficiency.
            </p>
          </div>

          <div className="landing-hero-ctas">
            {!isAuthenticated ? (
              <>
                <button
                  className="landing-btn-primary"
                  onClick={() => navigate('/login')}
                >
                  Start Building
                  <span
                    className="material-symbols-outlined landing-btn-arrow"
                    style={{ fontSize: 16 }}
                  >
                    arrow_forward
                  </span>
                </button>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-btn-secondary"
                >
                  Documentation
                </a>
              </>
            ) : (
              <>
                <form onSubmit={handleCreateSandbox} className="landing-hero-form">
                  <input
                    type="text"
                    id="project-title-input"
                    placeholder="Project title…"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    disabled={starting}
                    className="landing-hero-input"
                  />
                  <button
                    type="submit"
                    id="start-sandbox-btn"
                    disabled={starting || !projectTitle.trim()}
                    className="landing-btn-primary"
                  >
                    {starting && !launchingProjectId ? (
                      <>
                        <span className="landing-spinner" />
                        Starting…
                      </>
                    ) : (
                      <>
                        Create Sandbox
                        <span
                          className="material-symbols-outlined landing-btn-arrow"
                          style={{ fontSize: 16 }}
                        >
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>
                </form>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-btn-secondary"
                >
                  Documentation
                </a>
              </>
            )}
          </div>

          {/* Auth notice */}
          {authRequiredNotice && (
            <div className="landing-auth-notice">
              ⚠ Sign in required. Click "Start Building" to authenticate.
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="landing-error-banner">
              <span style={{ fontWeight: 600 }}>Notice:</span> {error}
            </div>
          )}
        </section>

        {/* ─── Showcase Panel ─── */}
        <section id="landing-showcase" className="landing-showcase">
          {/* Bottom fade gradient */}
          <div className="landing-showcase-fade" />
          <div className="landing-showcase-frame">
            {/* Browser chrome dots */}
            <div className="landing-showcase-chrome">
              <div className="landing-chrome-dot" />
              <div className="landing-chrome-dot" />
              <div className="landing-chrome-dot" />
            </div>
            <img
              src="/workspace-showcase.png"
              alt="SandboxAI Workspace — IDE with live preview, code editor, and integrated terminal"
              className="landing-showcase-img"
              loading="lazy"
            />
          </div>
        </section>

        {/* ─── Previous Projects (authenticated only) ─── */}
        {isAuthenticated && (
          <section id="landing-projects" className="landing-projects">
            <div className="landing-projects-header">
              <h2 className="landing-section-heading">Your Projects</h2>
              <button
                onClick={fetchProjects}
                disabled={loadingProjects}
                className="landing-btn-secondary landing-btn-sm"
              >
                <span
                  className={`material-symbols-outlined ${loadingProjects ? 'animate-spin-slow' : ''}`}
                  style={{ fontSize: 14 }}
                >
                  refresh
                </span>
                Refresh
              </button>
            </div>

            {loadingProjects && projects.length === 0 ? (
              <div className="landing-projects-grid">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="landing-project-skeleton">
                    <div className="shimmer" style={{ width: 40, height: 40, borderRadius: '0.5rem' }} />
                    <div className="shimmer" style={{ height: 16, width: '75%', borderRadius: 4 }} />
                    <div className="shimmer" style={{ height: 12, width: '50%', borderRadius: 4 }} />
                  </div>
                ))}
              </div>
            ) : projectsError ? (
              <div className="landing-projects-error">
                Failed to load projects: {projectsError}
              </div>
            ) : projects.length === 0 ? (
              <div className="landing-projects-empty">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 32, color: 'var(--color-on-surface-variant)', marginBottom: 8 }}
                >
                  folder_open
                </span>
                <p style={{ fontWeight: 500, color: 'var(--color-on-surface)' }}>
                  No previous projects
                </p>
                <p style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
                  Enter a project title above to create your first sandbox.
                </p>
              </div>
            ) : (
              <div className="landing-projects-grid">
                {projects.map((project) => {
                  const isLaunching =
                    launchingProjectId === project._id ||
                    (starting && project._id === launchingProjectId);
                  const formattedDate = project.createdAt
                    ? new Date(project.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                    : 'Recent';

                  return (
                    <div key={project._id} className="landing-project-card">
                      <div className="landing-project-card-top">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 20, color: 'var(--color-primary)' }}
                        >
                          folder
                        </span>
                        <span className="landing-project-date">{formattedDate}</span>
                      </div>
                      <h3 className="landing-project-title">
                        {project.title || 'Untitled Project'}
                      </h3>
                      <p className="landing-project-id">
                        ID: {project._id.slice(-8)}
                      </p>
                      <button
                        onClick={() => handleResumeProject(project)}
                        disabled={starting}
                        className="landing-btn-primary landing-btn-sm"
                        style={{ marginTop: 'auto', width: '100%' }}
                      >
                        {isLaunching ? (
                          <>
                            <span className="landing-spinner" />
                            Launching…
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                              play_arrow
                            </span>
                            Resume Sandbox
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ─── Core Capabilities — Bento Grid ─── */}
        <section id="landing-capabilities" className="landing-capabilities">
          <h2 className="landing-section-heading">Core Capabilities</h2>

          <div className="landing-bento-grid">
            {/* Card 1 — AI Chat (1 col) */}
            <FeatureCard
              icon="chat"
              watermarkIcon="chat"
              title="Contextual AI Chat"
              description="Deeply integrated intelligence that understands your entire codebase, assisting with generation and refactoring in real-time."
            />

            {/* Card 2 — Live Preview (2 col span) */}
            <FeatureCard
              icon="visibility"
              watermarkIcon="visibility"
              title="Instant Live Preview"
              description="Render UI components concurrently as you type. Zero build-time delay, powered by an optimized rendering pipeline directly in your workspace."
              className="landing-bento-wide"
            >
              {/* Gradient overlay on hover */}
              <div className="landing-feature-gradient-overlay" />
            </FeatureCard>

            {/* Card 3 — Collaboration (full 3-col span) */}
            <FeatureCard
              icon="group_work"
              watermarkIcon="group_work"
              title="Synchronous Collaboration"
              description="Share your workspace instantly. Multiplayer cursor tracking and robust conflict resolution ensure seamless team workflows without external tools."
              className="landing-bento-full"
            >
              {/* Code snippet visual */}
              <div className="landing-collab-snippet">
                <div className="landing-collab-snippet-header">
                  <div className="landing-collab-snippet-dot" />
                  <span>CollabSession.ts</span>
                </div>
                <div className="landing-collab-snippet-lines">
                  <div className="landing-snippet-line" style={{ width: '75%' }} />
                  <div className="landing-snippet-line" style={{ width: '50%' }} />
                  <div className="landing-snippet-line landing-snippet-line-active" style={{ width: '83%' }}>
                    <div className="landing-snippet-cursor" />
                  </div>
                  <div className="landing-snippet-line" style={{ width: '66%' }} />
                </div>
              </div>
            </FeatureCard>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════════
          FOOTER — fixed bottom status bar
          ═══════════════════════════════════════════════════════════════════════ */}
      <footer id="landing-footer" className="landing-footer">
        <div className="landing-footer-left">
          <span>© {new Date().getFullYear()} SandboxAI</span>
        </div>
        <div className="landing-footer-right">
          <a href="#landing-hero">Status: Online</a>
          <a href="#landing-capabilities">Logs</a>
          <a href="#landing-showcase">Terminal</a>
        </div>
      </footer>
    </div>
  );
}
