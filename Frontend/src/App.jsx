import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SandboxProvider, useSandbox } from './context/SandboxContext';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import WorkspaceLayout from './components/WorkspaceLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function WorkspaceWrapper() {
  const { sandbox } = useSandbox();

  if (!sandbox) {
    return <Navigate to="/" replace />;
  }

  return <WorkspaceLayout />;
}

function MainApp() {
  const { sandbox } = useSandbox();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={sandbox ? <Navigate to="/workspace" replace /> : <LandingPage />}
      />
      <Route
        path="/login"
        element={
          <PublicRoute redirectIfAuthenticated={true}>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/workspace"
        element={
          <ProtectedRoute>
            <WorkspaceWrapper />
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SandboxProvider>
          <MainApp />
        </SandboxProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
