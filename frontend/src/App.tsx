import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { MouseFollower } from './components/animations/MouseFollower';
import { ParticleNetwork } from './components/animations/ParticleNetwork';
import { PageTransitionWrapper } from './components/layout/PageTransition';
import { PageLoader } from './components/ui/PageLoader';
import { Home } from './pages/Home';
import { PerformanceProvider } from './context/PerformanceContext';
import { PerformancePanel } from './components/settings/PerformancePanel';
import { usePerformance } from './context/PerformanceContext';
import { useHover, HoverProvider } from './context/HoverContext';
import { VpnSpeedProvider } from './context/VpnSpeedContext';
import './index.css';

const Tutorials = lazy(() => import('./pages/Tutorials').then(m => ({ default: m.Tutorials })));
const TutorialDetail = lazy(() => import('./pages/TutorialDetail'));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Tools = lazy(() => import('./pages/Tools').then(m => ({ default: m.Tools })));
const Newest = lazy(() => import('./pages/Newest').then(m => ({ default: m.Newest })));

function AnimatedApp() {
  const location = useLocation();

  return (
    <PageTransitionWrapper>
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/tutorial/:file" element={<TutorialDetail />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/about" element={<About />} />
          <Route path="/newest" element={<Newest />} />
        </Routes>
      </Suspense>
    </PageTransitionWrapper>
  );
}

function AppInner() {
  const { settings } = usePerformance();
  const { isHovering } = useHover();

  return (
    <BrowserRouter>
      <div style={{ margin: 0, padding: 0, position: 'relative' }}>
        {settings.backgroundParticles && <ParticleNetwork dimmed={isHovering} />}
        <AnimatedApp />
        {settings.mouseFollower && <MouseFollower />}
        <PerformancePanel />
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <PerformanceProvider>
      <VpnSpeedProvider>
        <HoverProvider>
          <AppInner />
        </HoverProvider>
      </VpnSpeedProvider>
    </PerformanceProvider>
  );
}

export default App;