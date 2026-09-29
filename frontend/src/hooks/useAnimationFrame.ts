import { useEffect, useRef } from 'react';

interface AnimationFrameOptions {
  maxFps?: number;
  enabled?: boolean;
}

const MAX_DELTA = 50;

export function useAnimationFrame(
  callback: (deltaTime: number, fps: number) => void,
  options: AnimationFrameOptions = {}
) {
  const { maxFps = 60, enabled = true } = options;

  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const callbackRef = useRef(callback);
  const frameCountRef = useRef(0);
  const fpsWindowStartRef = useRef(0);
  const currentFpsRef = useRef(60);
  const minFrameTime = 1000 / maxFps;

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const frame = (time: number) => {
      if (cancelled) return;

      if (previousTimeRef.current === 0) {
        previousTimeRef.current = time;
        fpsWindowStartRef.current = time;
        frameCountRef.current = 0;
      }

      const deltaTime = time - previousTimeRef.current;

      if (deltaTime >= minFrameTime) {
        frameCountRef.current++;

        const windowElapsed = time - fpsWindowStartRef.current;
        if (windowElapsed >= 1000) {
          currentFpsRef.current = Math.round(
            (frameCountRef.current * 1000) / windowElapsed
          );
          frameCountRef.current = 0;
          fpsWindowStartRef.current = time;
        }

        callbackRef.current(Math.min(deltaTime, MAX_DELTA), currentFpsRef.current);
        previousTimeRef.current = time;
      }

      requestRef.current = requestAnimationFrame(frame);
    };

    previousTimeRef.current = 0;
    requestRef.current = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = 0;
      }
    };
  }, [enabled, minFrameTime]);
}
