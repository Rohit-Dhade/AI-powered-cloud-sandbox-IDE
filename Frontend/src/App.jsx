import { SandboxProvider, useSandbox } from './context/SandboxContext';
import LandingPage from './components/LandingPage';
import WorkspaceLayout from './components/WorkspaceLayout';

function AppContent() {
  const { sandbox } = useSandbox();
  return sandbox ? <WorkspaceLayout /> : <LandingPage />;
}

export default function App() {
  return (
    <SandboxProvider>
      <AppContent />
    </SandboxProvider>
  );
}
