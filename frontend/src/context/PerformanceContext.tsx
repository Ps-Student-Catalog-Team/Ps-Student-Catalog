import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useFpsMonitor } from '../hooks/useFpsMonitor';

export interface PerformanceSettings {
  backgroundParticles: boolean;
  mouseFollower: boolean;
  canvasParticles: boolean;
  pageTransitions: boolean;
  reducedMotion: boolean;
}

export type AdaptiveLevel = 'high' | 'medium' | 'low';

const DEFAULT_SETTINGS: PerformanceSettings = {
  backgroundParticles: true,
  mouseFollower: true,
  canvasParticles: true,
  pageTransitions: true,
  reducedMotion: false,
};

const STORAGE_KEY = 'ps-student-catalog-performance';

const PARTICLE_MULTIPLIERS: Record<AdaptiveLevel, number> = {
  high: 1.0,
  medium: 0.7,
  low: 0.5,
};

function loadSettings(): PerformanceSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

interface PerformanceContextValue {
  settings: PerformanceSettings;
  updateSetting: <K extends keyof PerformanceSettings>(
    key: K,
    value: PerformanceSettings[K]
  ) => void;
  resetSettings: () => void;
  isLoaded: boolean;
  currentFps: number;
  adaptiveLevel: AdaptiveLevel;
  particleCountMultiplier: number;
  updateFps: (fps: number) => void;
}

const PerformanceContext = createContext<PerformanceContextValue | null>(null);

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PerformanceSettings>(loadSettings);
  const [isLoaded, _setIsLoaded] = useState(true);
  const [currentFps, setCurrentFps] = useState(60);
  const [adaptiveLevel, setAdaptiveLevel] = useState<AdaptiveLevel>('high');
  const lowFpsStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // 静默失败
    }
  }, [settings]);

  useEffect(() => {
    if (settings.reducedMotion) {
      document.documentElement.style.setProperty('--motion-speed', '0');
    } else {
      document.documentElement.style.removeProperty('--motion-speed');
    }
  }, [settings.reducedMotion]);

  const updateSetting = useCallback(
    <K extends keyof PerformanceSettings>(key: K, value: PerformanceSettings[K]) => {
      setSettings(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
  }, []);

  const updateFps = useCallback((fps: number) => {
    setCurrentFps(fps);

    const now = performance.now();

    if (fps < 30) {
      if (lowFpsStartTimeRef.current === null) {
        lowFpsStartTimeRef.current = now;
      } else if (now - lowFpsStartTimeRef.current >= 5000) {
        setAdaptiveLevel('low');
      }
    } else {
      lowFpsStartTimeRef.current = null;

      if (fps >= 50) {
        setAdaptiveLevel('high');
      } else if (fps >= 30) {
        setAdaptiveLevel('medium');
      }
    }
  }, []);

  useFpsMonitor(updateFps, 1000);

  const particleCountMultiplier = PARTICLE_MULTIPLIERS[adaptiveLevel];

  return (
    <PerformanceContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        isLoaded,
        currentFps,
        adaptiveLevel,
        particleCountMultiplier,
        updateFps,
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance(): PerformanceContextValue {
  const ctx = useContext(PerformanceContext);
  if (!ctx) {
    throw new Error('usePerformance must be used within <PerformanceProvider>');
  }
  return ctx;
}