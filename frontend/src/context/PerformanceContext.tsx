import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { useFpsMonitor } from '../hooks/useFpsMonitor';
import {
  TIER_CONFIG,
  detectDeviceTier,
  prefersReducedMotion,
  type AdaptiveLevel,
  type QualityPreference,
  type TierConfig,
} from '../utils/performanceTier';

export interface PerformanceSettings {
  backgroundParticles: boolean;
  particleConnections: boolean;
  particleGlow: boolean;
  mouseFollower: boolean;
  canvasParticles: boolean;
  pageTransitions: boolean;
  reducedMotion: boolean;
  qualityPreference: QualityPreference;
}

const STORAGE_KEY = 'ps-student-catalog-performance';

const DEFAULT_SETTINGS: PerformanceSettings = {
  backgroundParticles: true,
  particleConnections: true,
  particleGlow: true,
  mouseFollower: true,
  canvasParticles: true,
  pageTransitions: true,
  reducedMotion: false,
  qualityPreference: 'auto',
};

function loadSettings(): PerformanceSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_SETTINGS, reducedMotion: prefersReducedMotion() };
    }
    const parsed = JSON.parse(raw) as Partial<PerformanceSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

const LEVEL_ORDER: AdaptiveLevel[] = ['low', 'medium', 'high'];

interface SettingsContextValue {
  settings: PerformanceSettings;
  updateSetting: <K extends keyof PerformanceSettings>(
    key: K,
    value: PerformanceSettings[K]
  ) => void;
  resetSettings: () => void;
  deviceTier: AdaptiveLevel;
  adaptiveLevel: AdaptiveLevel;
  effectiveTier: AdaptiveLevel;
  tierConfig: TierConfig;
}

interface TelemetryContextValue {
  currentFps: number;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);
const TelemetryContext = createContext<TelemetryContextValue>({ currentFps: 60 });

const DOWNGRADE_SAMPLES = 3;
const UPGRADE_SAMPLES = 4;

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PerformanceSettings>(loadSettings);
  const [deviceTier] = useState<AdaptiveLevel>(detectDeviceTier);
  const [adaptiveLevel, setAdaptiveLevel] = useState<AdaptiveLevel>(deviceTier);
  const [currentFps, setCurrentFps] = useState(60);

  const levelRef = useRef(deviceTier);
  const lowStreakRef = useRef(0);
  const highStreakRef = useRef(0);

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
    setSettings({ ...DEFAULT_SETTINGS, reducedMotion: prefersReducedMotion() });
  }, []);

  const handleFpsUpdate = useCallback(
    (fps: number) => {
      setCurrentFps(fps);
      if (document.hidden) return;

      const levelIndex = LEVEL_ORDER.indexOf(levelRef.current);

      if (fps < 40) {
        highStreakRef.current = 0;
        lowStreakRef.current++;
        if (
          lowStreakRef.current >= DOWNGRADE_SAMPLES &&
          levelIndex > 0
        ) {
          const next = LEVEL_ORDER[levelIndex - 1];
          levelRef.current = next;
          setAdaptiveLevel(next);
          lowStreakRef.current = 0;
        }
      } else if (fps >= 55) {
        lowStreakRef.current = 0;
        highStreakRef.current++;
        const capIndex = LEVEL_ORDER.indexOf(deviceTier);
        if (
          highStreakRef.current >= UPGRADE_SAMPLES &&
          levelIndex < capIndex
        ) {
          const next = LEVEL_ORDER[levelIndex + 1];
          levelRef.current = next;
          setAdaptiveLevel(next);
          highStreakRef.current = 0;
        }
      } else {
        lowStreakRef.current = 0;
        highStreakRef.current = 0;
      }
    },
    [deviceTier]
  );

  useFpsMonitor(handleFpsUpdate, 1000);

  const effectiveTier: AdaptiveLevel =
    settings.qualityPreference === 'auto'
      ? adaptiveLevel
      : settings.qualityPreference;

  const settingsValue = useMemo<SettingsContextValue>(
    () => ({
      settings,
      updateSetting,
      resetSettings,
      deviceTier,
      adaptiveLevel,
      effectiveTier,
      tierConfig: TIER_CONFIG[effectiveTier],
    }),
    [settings, updateSetting, resetSettings, deviceTier, adaptiveLevel, effectiveTier]
  );

  const telemetryValue = useMemo<TelemetryContextValue>(
    () => ({ currentFps }),
    [currentFps]
  );

  return (
    <SettingsContext.Provider value={settingsValue}>
      <TelemetryContext.Provider value={telemetryValue}>
        {children}
      </TelemetryContext.Provider>
    </SettingsContext.Provider>
  );
}

export function usePerformance(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('usePerformance must be used within <PerformanceProvider>');
  }
  return ctx;
}

export function usePerformanceTelemetry(): TelemetryContextValue {
  return useContext(TelemetryContext);
}
