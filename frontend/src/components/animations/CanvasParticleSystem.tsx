import { useRef, useEffect, memo } from 'react';
import { useMousePositionRef } from '../../hooks/useMousePosition';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { usePerformance } from '../../context/PerformanceContext';

interface CanvasParticleSystemProps {
  enabled?: boolean;
}

interface TrailState {
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  size: Float32Array;
  life: Float32Array;
  decay: Float32Array;
  renderedX: Float32Array;
  renderedY: Float32Array;
  wasDrawn: Uint8Array;
  freeList: Int32Array;
  freeCount: number;
  capacity: number;
  lastSpawn: number;
}

function createTrailState(capacity: number): TrailState {
  const freeList = new Int32Array(capacity);
  for (let i = 0; i < capacity; i++) freeList[i] = i;
  return {
    x: new Float32Array(capacity),
    y: new Float32Array(capacity),
    vx: new Float32Array(capacity),
    vy: new Float32Array(capacity),
    size: new Float32Array(capacity),
    life: new Float32Array(capacity),
    decay: new Float32Array(capacity),
    renderedX: new Float32Array(capacity),
    renderedY: new Float32Array(capacity),
    wasDrawn: new Uint8Array(capacity),
    freeList,
    freeCount: capacity,
    capacity,
    lastSpawn: 0,
  };
}

function CanvasParticleSystemComponent({ enabled = true }: CanvasParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const needsFullClearRef = useRef(false);
  const mouseRef = useMousePositionRef();
  const { tierConfig } = usePerformance();

  const maxParticles = tierConfig.trailMaxParticles;
  const spawnInterval = 50 / tierConfig.trailSpawnScale;

  const stateRef = useRef<TrailState | null>(null);
  if (stateRef.current === null || stateRef.current.capacity !== maxParticles) {
    stateRef.current = createTrailState(maxParticles);
    needsFullClearRef.current = true;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const applySize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, tierConfig.dprCap);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      contextRef.current = canvas.getContext('2d');
      contextRef.current?.setTransform(dpr, 0, 0, dpr, 0, 0);
      stateRef.current?.wasDrawn.fill(0);
      needsFullClearRef.current = true;
    };
    applySize();
    window.addEventListener('resize', applySize);
    return () => window.removeEventListener('resize', applySize);
  }, [tierConfig.dprCap]);

  useAnimationFrame(
    dt => {
      if (!enabled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = contextRef.current;
      if (!ctx) return;

      const s = stateRef.current;
      const now = performance.now();
      const step = dt / 1000;

      if (needsFullClearRef.current) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        needsFullClearRef.current = false;
      }

      for (let i = 0; i < s.capacity; i++) {
        if (!s.wasDrawn[i]) continue;
        const size = s.size[i] + 1;
        ctx.clearRect(
          s.renderedX[i] - size,
          s.renderedY[i] - size,
          size * 2,
          size * 2
        );
        s.wasDrawn[i] = 0;
      }

      if (now - s.lastSpawn >= spawnInterval && s.freeCount > 0) {
        const idx = s.freeList[s.freeCount - 1];
        s.freeCount--;
        s.x[idx] = mouseRef.current.x;
        s.y[idx] = mouseRef.current.y;
        s.vx[idx] = (Math.random() - 0.5) * 120;
        s.vy[idx] = (Math.random() - 0.5) * 120;
        s.size[idx] = Math.random() * 3 + 1.5;
        s.life[idx] = 1;
        s.decay[idx] = 0.8 + Math.random() * 0.9;
        s.lastSpawn = now;
      }

      ctx.fillStyle = 'rgb(0,255,157)';

      for (let i = 0; i < s.capacity; i++) {
        if (s.life[i] <= 0) continue;

        s.x[i] += s.vx[i] * step;
        s.y[i] += s.vy[i] * step;
        s.life[i] -= s.decay[i] * step;

        if (s.life[i] <= 0) {
          s.life[i] = 0;
          s.freeList[s.freeCount++] = i;
          continue;
        }

        ctx.globalAlpha = s.life[i];
        ctx.beginPath();
        ctx.arc(s.x[i], s.y[i], s.size[i], 0, Math.PI * 2);
        ctx.fill();
        s.renderedX[i] = s.x[i];
        s.renderedY[i] = s.y[i];
        s.wasDrawn[i] = 1;
      }
      ctx.globalAlpha = 1;
    },
    { enabled }
  );

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}

export const CanvasParticleSystem = memo(CanvasParticleSystemComponent);
