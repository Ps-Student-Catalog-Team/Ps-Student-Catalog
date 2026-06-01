import { useRef, useCallback, useEffect } from 'react';

interface FpsMonitorResult {
  fps: number;
  isLowFps: boolean;
}

export function useFpsMonitor(
  onFpsUpdate: (fps: number) => void,
  updateInterval: number = 1000
): FpsMonitorResult {
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsRef = useRef(60);
  const rafIdRef = useRef<number>(0);

  const calculateFps = useCallback(() => {
    const now = performance.now();
    const elapsed = now - lastTimeRef.current;
    frameCountRef.current++;

    if (elapsed >= updateInterval) {
      const fps = Math.round((frameCountRef.current * 1000) / elapsed);
      fpsRef.current = fps;
      onFpsUpdate(fps);
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }

    rafIdRef.current = requestAnimationFrame(calculateFps);
  }, [onFpsUpdate, updateInterval]);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    frameCountRef.current = 0;
    rafIdRef.current = requestAnimationFrame(calculateFps);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [calculateFps]);

  return {
    fps: fpsRef.current,
    isLowFps: fpsRef.current < 30,
  };
}