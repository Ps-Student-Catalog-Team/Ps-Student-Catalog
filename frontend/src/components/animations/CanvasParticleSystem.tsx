import { useRef, useEffect, useCallback, memo } from 'react';
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
  active: boolean;
}

class ParticlePool {
  private pool: Particle[];
  private activeCount: number;

  constructor(size: number) {
    this.pool = [];
    this.activeCount = 0;
    for (let i = 0; i < size; i++) {
      this.pool.push(this.createInactiveParticle());
    }
  }

  private createInactiveParticle(): Particle {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 0,
      opacity: 0,
      life: 0,
      decay: 0,
      active: false,
    };
  }

  acquire(x: number, y: number): Particle | null {
    for (let i = 0; i < this.pool.length; i++) {
      if (!this.pool[i].active) {
        const p = this.pool[i];
        p.x = x;
        p.y = y;
        p.vx = (Math.random() - 0.5) * 2;
        p.vy = (Math.random() - 0.5) * 2;
        p.size = Math.random() * 4 + 2;
        p.opacity = Math.random() * 0.5 + 0.3;
        p.life = 1;
        p.decay = Math.random() * 0.02 + 0.01;
        p.active = true;
        this.activeCount++;
        return p;
      }
    }
    return null;
  }

  release(particle: Particle): void {
    particle.active = false;
    this.activeCount--;
  }

  getActiveParticles(): Particle[] {
    return this.pool.filter(p => p.active);
  }

  getActiveCount(): number {
    return this.activeCount;
  }
}

interface CanvasParticleSystemProps {
  maxParticles?: number;
  enabled?: boolean;
}

function CanvasParticleSystemComponent({
  maxParticles = 100,
  enabled = true,
}: CanvasParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useMousePosition();
  const particlePoolRef = useRef<ParticlePool | null>(null);
  const lastSpawnRef = useRef(0);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const initOffscreenCanvas = useCallback((width: number, height: number) => {
    offscreenCanvasRef.current = document.createElement('canvas');
    offscreenCanvasRef.current.width = width;
    offscreenCanvasRef.current.height = height;
    offscreenCtxRef.current = offscreenCanvasRef.current.getContext('2d');
  }, []);

  useEffect(() => {
    particlePoolRef.current = new ParticlePool(maxParticles);
    if (canvasRef.current) {
      initOffscreenCanvas(canvasRef.current.width, canvasRef.current.height);
    }
  }, [maxParticles, initOffscreenCanvas]);

  const updateParticles = useCallback(() => {
    const pool = particlePoolRef.current;
    if (!pool) return;

    const particles = pool.getActiveParticles();
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.opacity = p.life;

      if (p.life <= 0) {
        pool.release(p);
      }
    }
  }, []);

  const drawParticles = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const pool = particlePoolRef.current;
    if (!pool) return;

    const particles = pool.getActiveParticles();
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 157, ${p.opacity})`;
      ctx.fill();
    }
  }, []);

  useAnimationFrame(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pool = particlePoolRef.current;
    if (!pool) return;

    const now = Date.now();
    if (now - lastSpawnRef.current > 50 && pool.getActiveCount() < maxParticles) {
      pool.acquire(mouse.x, mouse.y);
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
        initOffscreenCanvas(window.innerWidth, window.innerHeight);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initOffscreenCanvas]);

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

export const CanvasParticleSystem = memo(CanvasParticleSystemComponent);