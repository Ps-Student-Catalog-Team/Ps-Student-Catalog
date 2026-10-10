import { useRef, memo, useEffect, useCallback } from 'react';
import { useMousePositionRef } from '../../hooks/useMousePosition';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { useHover } from '../../context/HoverContext';
import { usePerformance } from '../../context/PerformanceContext';

interface MouseFollowerProps {
  enabled?: boolean;
}

interface Ripple {
  x: number;
  y: number;
  createdAt: number;
  rings: HTMLDivElement[];
  center: HTMLDivElement | null;
}

interface Point {
  x: number;
  y: number;
}

export const MouseFollower = memo(function MouseFollower({ enabled: externalEnabled = true }: MouseFollowerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rippleContainerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useMousePositionRef();
  const { isHovering } = useHover();
  const { settings } = usePerformance();

  const currentPos = useRef<Point>({ x: 0, y: 0 });
  const velocity = useRef<Point>({ x: 0, y: 0 });
  const ripples = useRef<Ripple[]>([]);
  const isPressed = useRef(false);
  const pressTimeRef = useRef(0);

  const isEnabled = externalEnabled && settings.mouseFollower;

  const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

  const updateRipples = useCallback(() => {
    if (!rippleContainerRef.current) return;

    const now = performance.now();
    for (let index = ripples.current.length - 1; index >= 0; index--) {
      const ripple = ripples.current[index];
      if (now - ripple.createdAt >= 1000) {
        ripple.rings.forEach(ring => ring.remove());
        ripple.center?.remove();
        ripples.current.splice(index, 1);
      }
    }

    ripples.current.forEach(ripple => {
      const age = now - ripple.createdAt;
      const progress = Math.min(age / 1000, 1);
      
      const rings = 3;
      for (let i = 0; i < rings; i++) {
        const ringDelay = i * 0.15;
        const ringProgress = Math.max(0, Math.min(1, progress - ringDelay));
        const eased = easeOutExpo(ringProgress);
        const opacity = (1 - easeOutQuart(ringProgress)) * (1 - i * 0.25);
        
        const maxRadius = 15 + i * 20;
        const radius = eased * maxRadius;
        const borderOpacity = 0.5 * opacity;
        const left = ripple.x - radius;
        const top = ripple.y - radius;
        const size = radius * 2;
        const ring = ripple.rings[i];
        ring.style.left = `${left}px`;
        ring.style.top = `${top}px`;
        ring.style.width = `${size}px`;
        ring.style.height = `${size}px`;
        ring.style.borderColor = `rgba(0, 255, 157, ${borderOpacity})`;
        ring.style.boxShadow = `0 0 ${8 + i * 4}px rgba(0, 255, 157, ${0.2 * opacity}), inset 0 0 ${6 + i * 3}px rgba(0, 255, 157, ${0.1 * opacity})`;
      }
      
      if (progress < 0.2) {
        const innerProgress = progress / 0.2;
        const innerOpacity = (1 - innerProgress) * 0.8;
        const innerScale = 1 - innerProgress * 0.5;
        const centerSize = 8 * innerScale;
        if (ripple.center) {
          ripple.center.style.left = `${ripple.x - centerSize / 2}px`;
          ripple.center.style.top = `${ripple.y - centerSize / 2}px`;
          ripple.center.style.width = `${centerSize}px`;
          ripple.center.style.height = `${centerSize}px`;
          ripple.center.style.background = `radial-gradient(circle, rgba(0, 255, 157, ${innerOpacity}) 0%, rgba(0, 255, 157, 0) 70%)`;
        }
      } else if (ripple.center) {
        ripple.center.remove();
        ripple.center = null;
      }
    });
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const handleMouseDown = () => {
      isPressed.current = true;
      pressTimeRef.current = performance.now();
    };
    const handleMouseUp = () => {
      isPressed.current = false;
    };
    const handleClick = (e: MouseEvent) => {
      const ripple: Ripple = {
        x: e.clientX,
        y: e.clientY,
        createdAt: performance.now(),
        rings: [],
        center: null,
      };
      for (let i = 0; i < 3; i++) {
        const ring = document.createElement('div');
        ring.style.position = 'fixed';
        ring.style.borderRadius = '50%';
        ring.style.border = '1.5px solid rgba(0, 255, 157, 0)';
        ring.style.pointerEvents = 'none';
        ring.style.zIndex = '9997';
        rippleContainerRef.current?.appendChild(ring);
        ripple.rings.push(ring);
      }
      const center = document.createElement('div');
      center.style.position = 'fixed';
      center.style.borderRadius = '50%';
      center.style.pointerEvents = 'none';
      center.style.zIndex = '9998';
      rippleContainerRef.current?.appendChild(center);
      ripple.center = center;
      ripples.current.push(ripple);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('click', handleClick);
      ripples.current.forEach(ripple => {
        ripple.rings.forEach(ring => ring.remove());
        ripple.center?.remove();
      });
      ripples.current = [];
    };
  }, [isEnabled]);

  useAnimationFrame(() => {
    if (!isEnabled) return;

    updateRipples();

    if (!containerRef.current) return;

    const targetPos = mouseRef.current;
    
    const lerpFactor = isHovering ? 0.28 : 0.18;
    const dx = targetPos.x - currentPos.current.x;
    const dy = targetPos.y - currentPos.current.y;
    
    velocity.current.x = velocity.current.x * 0.75 + dx * 0.25;
    velocity.current.y = velocity.current.y * 0.75 + dy * 0.25;
    
    currentPos.current.x += dx * lerpFactor;
    currentPos.current.y += dy * lerpFactor;

    const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.y ** 2);
    const stretch = Math.min(speed / 15, 1);
    
    const baseSize = 32;
    const hoverScale = isHovering ? 1.4 : 1;
    
    let pressScale = 1;
    if (isPressed.current) {
      const pressDuration = performance.now() - pressTimeRef.current;
      if (pressDuration < 100) {
        pressScale = 1 - (pressDuration / 100) * 0.25;
      } else {
        pressScale = 0.75;
      }
    }
    
    const scale = baseSize * hoverScale * pressScale;

    const angle = Math.atan2(velocity.current.y, velocity.current.x);
    const stretchX = 1 + stretch * 0.35;
    const stretchY = 1 - stretch * 0.15;

    containerRef.current.style.transform = `
      translate(${currentPos.current.x - scale / 2}px, ${currentPos.current.y - scale / 2}px)
      rotate(${angle}rad)
      scaleX(${stretchX})
      scaleY(${stretchY})
      scale(${scale / baseSize})
    `;
  }, { enabled: isEnabled });

  if (!isEnabled) return null;

  return (
    <>
      <div ref={rippleContainerRef} />
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          pointerEvents: 'none',
          zIndex: 9998,
          willChange: 'transform',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `1.5px solid rgba(0, 255, 157, ${isHovering ? 0.75 : 0.45})`,
            boxShadow: isHovering 
              ? '0 0 14px rgba(0, 255, 157, 0.35), 0 0 28px rgba(0, 255, 157, 0.15)' 
              : '0 0 8px rgba(0, 255, 157, 0.2)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: isPressed.current ? 7 : 6,
            height: isPressed.current ? 7 : 6,
            borderRadius: '50%',
            background: 'rgba(0, 255, 157, 0.95)',
            boxShadow: `0 0 ${isHovering ? 10 : 5}px rgba(0, 255, 157, 0.5)`,
          }}
        />
      </div>
    </>
  );
});
