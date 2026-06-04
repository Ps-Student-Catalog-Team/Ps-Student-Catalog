import { useRef, useEffect, useCallback } from 'react';

export interface MousePosition {
  x: number;
  y: number;
}

export function useMousePosition(): MousePosition {
  const positionRef = useRef<MousePosition>({ x: 0, y: 0 });
  const position = useRef<MousePosition>({ x: 0, y: 0 });

  const updatePosition = useCallback((ev: MouseEvent) => {
    positionRef.current.x = ev.clientX;
    positionRef.current.y = ev.clientY;
    position.current.x = ev.clientX;
    position.current.y = ev.clientY;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', updatePosition);
    return () => {
      window.removeEventListener('mousemove', updatePosition);
    };
  }, [updatePosition]);

  return positionRef.current;
}

export function useMousePositionRef(): { current: MousePosition } {
  const positionRef = useRef<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (ev: MouseEvent) => {
      positionRef.current.x = ev.clientX;
      positionRef.current.y = ev.clientY;
    };

    window.addEventListener('mousemove', updatePosition);
    return () => {
      window.removeEventListener('mousemove', updatePosition);
    };
  }, []);

  return positionRef;
}
