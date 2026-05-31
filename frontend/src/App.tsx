import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { MouseFollower } from './components/animations/MouseFollower';
import { ParticleNetwork } from './components/animations/ParticleNetwork';
import { PageTransitionWrapper } from './components/layout/PageTransition';
import { Home } from './pages/Home';
import { Tutorials } from './pages/Tutorials';
import TutorialDetail from './pages/TutorialDetail';
import { About } from './pages/About';
import { Tools } from './pages/Tools';
import { Newest } from './pages/Newest';
import { PerformanceProvider } from './context/PerformanceContext';
import { PerformancePanel } from './components/settings/PerformancePanel';
import { usePerformance } from './context/PerformanceContext';
import './index.css';

function AnimatedApp() {
  const location = useLocation();

  return (
    <PageTransitionWrapper>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/tutorials" element={<Tutorials />} />
        <Route path="/tutorial/:file" element={<TutorialDetail />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/about" element={<About />} />
        <Route path="/newest" element={<Newest />} />
      </Routes>
    </PageTransitionWrapper>
  );
}

function AppInner() {
  const { settings } = usePerformance();

  return (
    <BrowserRouter>
      <div style={{ margin: 0, padding: 0, position: 'relative' }}>
        {/* 背景粒子网络 */}
        {settings.backgroundParticles && <ParticleNetwork />}

        {/* 主体内容（含页面切换动画，由 PageTransitionWrapper 自行读取 Context） */}
        <AnimatedApp />

        {/* 鼠标跟随特效 */}
        {settings.mouseFollower && <MouseFollower />}

        {/* 性能设置面板 */}
        <PerformancePanel />
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <PerformanceProvider>
      <AppInner />
    </PerformanceProvider>
  );
}

export default App;
