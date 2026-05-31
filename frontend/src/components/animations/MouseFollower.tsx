import { useRef } from 'react';
import { useMousePosition } from '../../hooks/useMousePosition';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';

interface MouseFollowerProps {
  enabled?: boolean;
}

export function MouseFollower({ enabled = true }: MouseFollowerProps) {
  const followerRef = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition();
  const positionRef = useRef({ x: 0, y: 0 });

  useAnimationFrame(() => {
    if (!enabled || !followerRef.current) return;

    positionRef.current.x += (mouse.x - positionRef.current.x) * 0.6;
    positionRef.current.y += (mouse.y - positionRef.current.y) * 0.6;

    followerRef.current.style.transform = `translate(${positionRef.current.x - 10}px, ${positionRef.current.y - 10}px)`;
  });

  if (!enabled) return null;

  return (
    <div
      ref={followerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 20,
        height: 20,
        border: '2px solid #00ff9d',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 9998,
        opacity: 0.7,
        willChange: 'transform',
      }}
    />
  );
}
