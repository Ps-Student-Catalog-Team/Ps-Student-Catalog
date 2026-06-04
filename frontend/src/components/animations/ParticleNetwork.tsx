import { useRef, useEffect, useCallback, useState, memo } from 'react';
import { useMousePositionRef } from '../../hooks/useMousePosition';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { usePerformance } from '../../context/PerformanceContext';

interface ParticleNetworkProps {
  particleCount?: number;
  connectionDistance?: number;
  enabled?: boolean;
  dimmed?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  gridX: number;
  gridY: number;
}

class SpatialGrid {
  private cellSize: number;
  private _cols: number;
  private _rows: number;
  private grid: Map<string, Particle[]>;

  constructor(width: number, height: number, cellSize: number) {
    this.cellSize = cellSize;
    this._cols = Math.ceil(width / cellSize);
    this._rows = Math.ceil(height / cellSize);
    this.grid = new Map();
  }

  private getKey(col: number, row: number): string {
    return `${col},${row}`;
  }

  clear(): void {
    this.grid.clear();
  }

  resize(width: number, height: number): void {
    this._cols = Math.ceil(width / this.cellSize);
    this._rows = Math.ceil(height / this.cellSize);
    this.grid.clear();
  }

  get cols() { return this._cols; }
  get rows() { return this._rows; }

  insert(particle: Particle): void {
    const col = Math.floor(particle.x / this.cellSize);
    const row = Math.floor(particle.y / this.cellSize);
    particle.gridX = col;
    particle.gridY = row;
    const key = this.getKey(col, row);
    const cell = this.grid.get(key);
    if (cell) {
      cell.push(particle);
    } else {
      this.grid.set(key, [particle]);
    }
  }

  getNeighbors(particle: Particle, maxDistance: number): Particle[] {
    const neighbors: Particle[] = [];
    const maxCellDistance = Math.ceil(maxDistance / this.cellSize);

    for (let dx = -maxCellDistance; dx <= maxCellDistance; dx++) {
      for (let dy = -maxCellDistance; dy <= maxCellDistance; dy++) {
        const col = particle.gridX + dx;
        const row = particle.gridY + dy;
        const key = this.getKey(col, row);
        const cell = this.grid.get(key);
        if (cell) {
          neighbors.push(...cell);
        }
      }
    }
    return neighbors;
  }
}

function ParticleNetworkComponent({
  particleCount = 150,
  connectionDistance = 200,
  enabled = true,
  dimmed = false,
}: ParticleNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useMousePositionRef();
  const particlesRef = useRef<Particle[]>([]);
  const initializedRef = useRef(false);
  const [effectiveParticleCount, setEffectiveParticleCount] = useState(particleCount);
  const spatialGridRef = useRef<SpatialGrid | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const { particleCountMultiplier } = usePerformance();
  const dimFactorRef = useRef(dimmed ? 0.35 : 1);
  const targetDimFactorRef = useRef(dimmed ? 0.35 : 1);

  useEffect(() => {
    const updateParticleCount = () => {
      const baseCount = window.innerWidth < 768 ? 60 : window.innerWidth < 1024 ? 100 : 150;
      setEffectiveParticleCount(Math.round(baseCount * particleCountMultiplier));
    };

    updateParticleCount();
    window.addEventListener('resize', updateParticleCount);
    return () => window.removeEventListener('resize', updateParticleCount);
  }, [particleCount, particleCountMultiplier]);

  const createParticle = useCallback((canvas: HTMLCanvasElement): Particle => {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      gridX: 0,
      gridY: 0,
    };
  }, []);

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    particlesRef.current = [];
    for (let i = 0; i < effectiveParticleCount; i++) {
      particlesRef.current.push(createParticle(canvas));
    }

    spatialGridRef.current = new SpatialGrid(canvas.width, canvas.height, connectionDistance);

    offscreenCanvasRef.current = document.createElement('canvas');
    offscreenCanvasRef.current.width = canvas.width;
    offscreenCanvasRef.current.height = canvas.height;
  }, [createParticle, effectiveParticleCount, connectionDistance]);

  const updateParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    targetDimFactorRef.current = dimmed ? 0.35 : 1;
    const lerpFactor = 0.08;
    dimFactorRef.current += (targetDimFactorRef.current - dimFactorRef.current) * lerpFactor;

    particlesRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      p.x = Math.max(0, Math.min(canvas.width, p.x));
      p.y = Math.max(0, Math.min(canvas.height, p.y));
    });
  }, [dimmed]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles = particlesRef.current;
    const grid = spatialGridRef.current;
    if (!grid) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    grid.clear();
    particles.forEach(p => grid.insert(p));

    const checkedPairs = new Set<string>();
    const dimFactor = dimFactorRef.current;

    particles.forEach((p1, i) => {
      const neighbors = grid.getNeighbors(p1, connectionDistance);

      for (const p2 of neighbors) {
        const j = particles.indexOf(p2);
        if (j <= i) continue;

        const pairKey = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (checkedPairs.has(pairKey)) continue;
        checkedPairs.add(pairKey);

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distanceSq = dx * dx + dy * dy;
        const maxDistSq = connectionDistance * connectionDistance;

        if (distanceSq < maxDistSq) {
          const distance = Math.sqrt(distanceSq);
          const opacity = (1 - distance / connectionDistance) * 0.25 * dimFactor;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 255, 157, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.fillStyle = `rgba(0, 255, 157, ${0.4 * dimFactor})`;
      ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
      ctx.fill();

      const gradient = ctx.createRadialGradient(p1.x, p1.y, 0, p1.x, p1.y, p1.radius + 2);
      gradient.addColorStop(0, `rgba(0, 255, 157, ${0.25 * dimFactor})`);
      gradient.addColorStop(1, 'rgba(0, 255, 157, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, p1.radius + 2, 0, Math.PI * 2);
      ctx.fill();
    });

    const mouse = mouseRef.current;
    const nearestParticles: { particle: Particle; distance: number }[] = [];
    for (const p of particles) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const distanceSq = dx * dx + dy * dy;
      if (distanceSq < 40000) {
        nearestParticles.push({ particle: p, distance: Math.sqrt(distanceSq) });
      }
    }

    nearestParticles.sort((a, b) => a.distance - b.distance);
    const topNearest = nearestParticles.slice(0, 5);

    topNearest.forEach(item => {
      const opacity = (1 - item.distance / 200) * 0.3 * dimFactor;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(0, 255, 157, ${opacity})`;
      ctx.lineWidth = 0.8;
      ctx.moveTo(item.particle.x, item.particle.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
    });
  }, [connectionDistance]);

  useEffect(() => {
    if (initializedRef.current && canvasRef.current) {
      initParticles();
    }
  }, [effectiveParticleCount, initParticles]);

  useAnimationFrame(() => {
    if (!enabled) return;
    if (!initializedRef.current && canvasRef.current) {
      initParticles();
      initializedRef.current = true;
    }
    updateParticles();
    draw();
  });

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        initParticles();
      }
    };

    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initParticles, effectiveParticleCount]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}

export const ParticleNetwork = memo(ParticleNetworkComponent);