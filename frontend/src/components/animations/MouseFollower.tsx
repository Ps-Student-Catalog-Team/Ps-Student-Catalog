import { useRef, memo, useState, useEffect } from 'react';
import { useMousePosition } from '../../hooks/useMousePosition';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { useHover } from '../../context/HoverContext';

interface MouseFollowerProps {
  enabled?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
}

interface OrbitParticle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  phase: number;
}

export const MouseFollower = memo(function MouseFollower({ enabled = true }: MouseFollowerProps) {
  const followerRef = useRef<HTMLDivElement>(null);
  const innerDotRef = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition();
  const positionRef = useRef({ x: 0, y: 0 });
  const innerPositionRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const orbitParticlesRef = useRef<OrbitParticle[]>([]);
  const [pulseScale, setPulseScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [breathScale, setBreathScale] = useState(1);
  const pulseTimerRef = useRef(0);
  const { isHovering } = useHover();

  useEffect(() => {
    orbitParticlesRef.current = [
      { angle: 0, radius: 14, speed: 0.025, size: 2.5, phase: 0 },
      { angle: Math.PI / 2, radius: 16, speed: -0.02, size: 2, phase: Math.PI / 3 },
      { angle: Math.PI, radius: 13, speed: 0.03, size: 2.2, phase: Math.PI * 2 / 3 },
      { angle: Math.PI * 3 / 2, radius: 15, speed: -0.028, size: 2.3, phase: Math.PI },
    ];
  }, []);

  useAnimationFrame(() => {
    if (!enabled || !followerRef.current) return;

    const lerpFactor = isHovering ? 0.85 : 0.6;
    const innerLerpFactor = isHovering ? 0.95 : 0.85;

    positionRef.current.x += (mouse.x - positionRef.current.x) * lerpFactor;
    positionRef.current.y += (mouse.y - positionRef.current.y) * lerpFactor;

    innerPositionRef.current.x += (mouse.x - innerPositionRef.current.x) * innerLerpFactor;
    innerPositionRef.current.y += (mouse.y - innerPositionRef.current.y) * innerLerpFactor;

    if (followerRef.current) {
      const scale = isHovering ? 1.4 : 1;
      followerRef.current.style.transform = `translate(${positionRef.current.x - 22}px, ${positionRef.current.y - 22}px) scale(${scale * breathScale}) rotate(${rotation}deg)`;
    }

    if (innerDotRef.current) {
      innerDotRef.current.style.transform = `translate(${innerPositionRef.current.x - 4}px, ${innerPositionRef.current.y - 4}px)`;
    }

    pulseTimerRef.current += 0.016;
    const pulse = 1 + Math.sin(pulseTimerRef.current * 3) * 0.05;
    setPulseScale(isHovering ? pulse * 1.2 : pulse);
    setBreathScale(1 + Math.sin(pulseTimerRef.current * 1.5) * 0.03);
    setRotation((prev) => (prev + (isHovering ? 1.2 : 0.4)) % 360);

    orbitParticlesRef.current.forEach((p) => {
      p.angle += p.speed * (isHovering ? 1.5 : 1);
      p.phase += 0.05;
    });

    particlesRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life -= 0.02;
    });

    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
  });

  const handleMouseMove = () => {
    if (!isHovering) return;

    for (let i = 0; i < 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particlesRef.current.push({
        x: mouse.x,
        y: mouse.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        life: 1,
        maxLife: 1,
      });
    }
  };

  useEffect(() => {
    if (enabled) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enabled, isHovering, mouse.x, mouse.y]);

  if (!enabled) return null;

  const glowColor = isHovering ? 'rgba(0, 255, 157, 0.4)' : 'rgba(0, 255, 157, 0.2)';

  return (
    <>
      <div
        ref={followerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 44,
          height: 44,
          pointerEvents: 'none',
          zIndex: 9998,
          opacity: isHovering ? 0.9 : 0.6,
          willChange: 'transform',
          transition: 'opacity 0.3s ease',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 44,
            height: 44,
            border: isHovering ? '2px solid rgba(0, 255, 157, 0.7)' : '1.5px solid rgba(0, 255, 157, 0.5)',
            borderRadius: '50%',
            boxShadow: `0 0 ${isHovering ? 12 : 6}px ${glowColor}`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 11,
            left: 11,
            width: 22,
            height: 22,
            border: '1px solid rgba(0, 255, 157, 0.35)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 5,
            left: 5,
            width: 34,
            height: 34,
            border: '1px dashed rgba(0, 255, 157, 0.25)',
            borderRadius: '50%',
          }}
        />
        {orbitParticlesRef.current.map((p, i) => {
          const breath = Math.sin(pulseTimerRef.current * 2 + p.phase) * 0.3;
          const currentRadius = p.radius + breath;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 22 + Math.cos(p.angle) * currentRadius - p.size / 2,
                top: 22 + Math.sin(p.angle) * currentRadius - p.size / 2,
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                background: isHovering ? 'rgba(0, 255, 157, 0.9)' : 'rgba(0, 255, 157, 0.6)',
                boxShadow: `0 0 ${p.size * 3}px rgba(0, 255, 157, 0.4)`,
              }}
            />
          );
        })}
      </div>
      <div
        ref={innerDotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #00ff9d 0%, #00cc7a 100%)',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: isHovering ? 1 : 0.8,
          willChange: 'transform',
          boxShadow: `0 0 8px rgba(0, 255, 157, 0.6), 0 0 16px rgba(0, 255, 157, 0.3)`,
          transform: `scale(${pulseScale})`,
        }}
      />
      {particlesRef.current.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: `rgba(0, 255, 157, ${p.life})`,
            pointerEvents: 'none',
            zIndex: 9997,
            transform: `translate(${p.x - p.size / 2}px, ${p.y - p.size / 2}px)`,
            boxShadow: `0 0 ${p.size * 2}px rgba(0, 255, 157, ${p.life * 0.5})`,
          }}
        />
      ))}
    </>
  );
});
