import { useEffect, useRef, useCallback } from 'react';

interface AnimationFrameOptions {
  maxFps?: number;
  enabled?: boolean;
}

export function useAnimationFrame(
  callback: (deltaTime: number, fps: number) => void,
  options: AnimationFrameOptions = {}
) {
  const { maxFps = 60, enabled = true } = options;
  
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);
  const callbackRef = useRef(callback);
  const animateRef = useRef<(time: number) => void>((_) => {});
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(0);
  const currentFpsRef = useRef(60);
  const enabledRef = useRef(enabled);
  const minFrameTime = 1000 / maxFps;

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const start = useCallback(() => {
    if (requestRef.current) return;
    previousTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animateRef.current);
  }, []);

  const stop = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    animateRef.current = (time: number) => {
      if (!enabledRef.current) {
        requestRef.current = requestAnimationFrame(animateRef.current);
        return;
      }

      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        
        if (deltaTime >= minFrameTime) {
          frameCountRef.current++;
          
          if (time - lastFpsUpdateRef.current >= 1000) {
            currentFpsRef.current = Math.round((frameCountRef.current * 1000) / (time - lastFpsUpdateRef.current));
            frameCountRef.current = 0;
            lastFpsUpdateRef.current = time;
          }
          
          callbackRef.current(deltaTime, currentFpsRef.current);
          previousTimeRef.current = time;
        }
      } else {
        previousTimeRef.current = time;
      }
      
      requestRef.current = requestAnimationFrame(animateRef.current);
    };

    requestRef.current = requestAnimationFrame(animateRef.current);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [minFrameTime]);

  return { start, stop };
}
