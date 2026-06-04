import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface VpnSpeedData {
  uploadSpeed: number;
  downloadSpeed: number;
  timestamp: number;
}

interface SpeedHistory {
  time: number;
  upload: number;
  download: number;
}

interface VpnSpeedContextValue {
  speed: VpnSpeedData;
  history: SpeedHistory[];
  isLoading: boolean;
  error: string | null;
}

const VpnSpeedContext = createContext<VpnSpeedContextValue | null>(null);

const API_BASE_URL = '';

export function VpnSpeedProvider({ children }: { children: ReactNode }) {
  const [speed, setSpeed] = useState<VpnSpeedData>({
    uploadSpeed: 0,
    downloadSpeed: 0,
    timestamp: 0,
  });
  const [history, setHistory] = useState<SpeedHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpeed = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vpn-speed`);
      const data = await response.json();
      setSpeed({
        uploadSpeed: data.uploadSpeed || 0,
        downloadSpeed: data.downloadSpeed || 0,
        timestamp: data.timestamp || Date.now(),
      });
      setError(null);
    } catch (err) {
      console.error('获取VPN速率失败:', err);
      setError('无法获取速率数据');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpeed();
    const interval = setInterval(fetchSpeed, 3000);
    return () => clearInterval(interval);
  }, [fetchSpeed]);

  useEffect(() => {
    if (speed.timestamp > 0) {
      setHistory(prev => {
        const newHistory = [...prev, {
          time: speed.timestamp,
          upload: speed.uploadSpeed,
          download: speed.downloadSpeed,
        }];
        const maxHistoryLength = 30;
        if (newHistory.length > maxHistoryLength) {
          return newHistory.slice(-maxHistoryLength);
        }
        return newHistory;
      });
    }
  }, [speed]);

  return (
    <VpnSpeedContext.Provider value={{ speed, history, isLoading, error }}>
      {children}
    </VpnSpeedContext.Provider>
  );
}

export function useVpnSpeed(): VpnSpeedContextValue {
  const ctx = useContext(VpnSpeedContext);
  if (!ctx) {
    throw new Error('useVpnSpeed must be used within <VpnSpeedProvider>');
  }
  return ctx;
}

export function formatSpeed(bytesPerSecond: number): { value: number; unit: string } {
  if (bytesPerSecond < 1024) {
    return { value: Math.round(bytesPerSecond), unit: 'B/s' };
  } else if (bytesPerSecond < 1024 * 1024) {
    return { value: Math.round(bytesPerSecond / 1024), unit: 'KB/s' };
  } else {
    return { value: parseFloat((bytesPerSecond / (1024 * 1024)).toFixed(2)), unit: 'MB/s' };
  }
}