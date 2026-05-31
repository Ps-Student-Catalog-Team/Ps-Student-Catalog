import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { MouseFollower } from './components/animations/MouseFollower';
import { ParticleNetwork } from './components/animations/ParticleNetwork';
import { AnimatedRoutes } from './components/layout/PageTransition';
import { Home } from './pages/Home';
import { Tutorials } from './pages/Tutorials';
import TutorialDetail from './pages/TutorialDetail';
import { About } from './pages/About';
import { Tools } from './pages/Tools';
import { Newest } from './pages/Newest';
import './index.css';

function AnimatedApp() {
  const location = useLocation();

  return (
    <AnimatedRoutes>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
            <Route path="/tutorials" element={<Tutorials />} />
            <Route path="/tutorial/:file" element={<TutorialDetail />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/about" element={<About />} />
            <Route path="/newest" element={<Newest />} />
      </Routes>
    </AnimatedRoutes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div style={{ margin: 0, padding: 0, position: 'relative' }}>
        <ParticleNetwork />
        <AnimatedApp />
        <MouseFollower />
      </div>
    </BrowserRouter>
  );
}

export default App;
