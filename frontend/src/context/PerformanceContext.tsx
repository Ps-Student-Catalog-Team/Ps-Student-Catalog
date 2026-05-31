import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface PerformanceSettings {
  backgroundParticles: boolean;   // ParticleNetwork 背景粒子
  mouseFollower: boolean;        // MouseFollower 鼠标跟随
  canvasParticles: boolean;       // CanvasParticleSystem 鼠标粒子轨迹
  pageTransitions: boolean;       // 页面切换动画
  reducedMotion: boolean;         // 全局减少动画
}

const DEFAULT_SETTINGS: PerformanceSettings = {
  backgroundParticles: true,
  mouseFollower: true,
  canvasParticles: true,
  pageTransitions: true,
  reducedMotion: false,
};

const STORAGE_KEY = 'ps-student-catalog-performance';

function loadSettings(): PerformanceSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    // 合并默认值，兼容旧版本
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
  /** 是否正在从 localStorage 恢复（避免首次渲染闪烁） */
  isLoaded: boolean;
}

const PerformanceContext = createContext<PerformanceContextValue | null>(null);

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PerformanceSettings>(loadSettings);
  const [isLoaded, _setIsLoaded] = useState(true);

  // 持久化到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // 静默失败（隐私模式等情况）
    }
  }, [settings]);

  // 当 reducedMotion 改变时同步到 CSS 媒体查询
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

  return (
    <PerformanceContext.Provider value={{ settings, updateSetting, resetSettings, isLoaded }}>
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
