import { useRef, useEffect, useCallback } from 'react';
import { useMousePosition } from '../../hooks/useMousePosition';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  decay: number;
}

interface CanvasParticleSystemProps {
  maxParticles?: number;
  enabled?: boolean;
}

export function CanvasParticleSystem({
  maxParticles = 100,
  enabled = true,
}: CanvasParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useMousePosition();
  const particlesRef = useRef<Particle[]>([]);
  const lastSpawnRef = useRef(0);

  const createParticle = useCallback((x: number, y: number): Particle => {
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.5 + 0.3,
      life: 1,
      decay: Math.random() * 0.02 + 0.01,
    };
  }, []);

  const updateParticles = useCallback(() => {
    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.opacity = p.life;

      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }, []);

  const drawParticles = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const particles = particlesRef.current;
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 157, ${p.opacity})`;
      ctx.fill();
    });
  }, []);

  useAnimationFrame(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = Date.now();
    if (now - lastSpawnRef.current > 50 && particlesRef.current.length < maxParticles) {
      particlesRef.current.push(createParticle(mouse.x, mouse.y));
      lastSpawnRef.current = now;
    }

    updateParticles();
    drawParticles(ctx);
  });

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}
