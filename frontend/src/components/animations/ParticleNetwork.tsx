import { useRef, useEffect, memo } from 'react';
import { usePerformance } from '../../context/PerformanceContext';
import {
  getParticleCount,
  getIdleCallback,
  cancelIdleCallback,
} from '../../utils/performanceTier';
import type { ParticleWorkerFrame, ParticleWorkerIn } from '../../workers/particleWorker';

interface ParticleNetworkProps {
  enabled?: boolean;
  dimmed?: boolean;
}

interface RenderConfig {
  connectionDistance: number;
  mouseLinks: number;
  simInterval: number;
  dprCap: number;
  glow: boolean;
  showConnections: boolean;
  dimTarget: number;
}

const RESIZE_DEBOUNCE = 200;
const LINE_BUCKETS = 4;

function makeRadii(count: number): Float32Array {
  const radii = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const t = Math.abs(Math.sin(i * 12.9898) * 43758.5453);
    radii[i] = 1 + (t - Math.floor(t)) * 2;
  }
  return radii;
}

function createGlowSprite(dpr: number): HTMLCanvasElement | null {
  const size = 28;
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = Math.round(size * dpr);
  const sctx = sprite.getContext('2d');
  if (!sctx) return null;
  sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const grad = sctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(0,255,157,0.28)');
  grad.addColorStop(0.55, 'rgba(0,255,157,0.12)');
  grad.addColorStop(1, 'rgba(0,255,157,0)');
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, size, size);
  return sprite;
}

function ParticleNetworkComponent({
  enabled = true,
  dimmed = false,
}: ParticleNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { effectiveTier, tierConfig, settings } = usePerformance();

  const workerRef = useRef<Worker | null>(null);
  const frameRef = useRef<ParticleWorkerFrame | null>(null);
  const rafRef = useRef(0);
  const idleIdRef = useRef<number | null>(null);
  const resizeTimerRef = useRef(0);
  const sizeRef = useRef({ w: window.innerWidth, h: window.innerHeight });
  const dprRef = useRef(1);
  const countRef = useRef(0);
  const radiiRef = useRef<Float32Array>(new Float32Array(0));
  const spriteRef = useRef<HTMLCanvasElement | null>(null);
  const lastTickRef = useRef(0);
  const lastFrameTsRef = useRef(0);
  const dimFactorRef = useRef(1);
  const pointerRef = useRef({ x: 0, y: 0, active: false, dirty: false });
  const cfgRef = useRef<RenderConfig>({
    connectionDistance: tierConfig.connectionDistance,
    mouseLinks: tierConfig.mouseLinks,
    simInterval: tierConfig.simInterval,
    dprCap: tierConfig.dprCap,
    glow: settings.particleGlow && tierConfig.glow,
    showConnections: settings.particleConnections,
    dimTarget: dimmed ? 0.35 : 1,
  });
  const lastWorkerCfgRef = useRef({ distance: -1, mouseLinks: -1 });

  useEffect(() => {
    cfgRef.current = {
      connectionDistance: tierConfig.connectionDistance,
      mouseLinks: tierConfig.mouseLinks,
      simInterval: tierConfig.simInterval,
      dprCap: tierConfig.dprCap,
      glow: settings.particleGlow && tierConfig.glow,
      showConnections: settings.particleConnections,
      dimTarget: dimmed ? 0.35 : 1,
    };

    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = Math.min(window.devicePixelRatio || 1, tierConfig.dprCap);
      if (dpr !== dprRef.current) {
        dprRef.current = dpr;
        canvas.width = Math.round(sizeRef.current.w * dpr);
        canvas.height = Math.round(sizeRef.current.h * dpr);
        canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
        spriteRef.current = createGlowSprite(dpr);
      }
    }

    const worker = workerRef.current;
    if (worker) {
      const { w, h } = sizeRef.current;
      const newCount = getParticleCount(effectiveTier, w);
      if (newCount !== countRef.current) {
        countRef.current = newCount;
        radiiRef.current = makeRadii(newCount);
        const msg: ParticleWorkerIn = { type: 'resize', width: w, height: h, count: newCount };
        worker.postMessage(msg);
      }
      if (
        lastWorkerCfgRef.current.distance !== tierConfig.connectionDistance ||
        lastWorkerCfgRef.current.mouseLinks !== tierConfig.mouseLinks
      ) {
        lastWorkerCfgRef.current = {
          distance: tierConfig.connectionDistance,
          mouseLinks: tierConfig.mouseLinks,
        };
        worker.postMessage({
          type: 'config',
          connectionDistance: tierConfig.connectionDistance,
          mouseLinks: tierConfig.mouseLinks,
        } satisfies ParticleWorkerIn);
      }
    }
  }, [effectiveTier, tierConfig, settings.particleGlow, settings.particleConnections, dimmed]);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const supportsWorker = typeof Worker !== 'undefined';
    const finePointer = window.matchMedia?.('(pointer: fine)').matches ?? true;

    const applySize = () => {
      const { w, h } = sizeRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, cfgRef.current.dprCap);
      dprRef.current = dpr;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spriteRef.current = createGlowSprite(dpr);
    };

    const initWorker = () => {
      if (!supportsWorker) return;
      const { w, h } = sizeRef.current;
      const cfg = cfgRef.current;
      const count = getParticleCount(effectiveTier, w);

      try {
        const worker = new Worker(
          new URL('../../workers/particleWorker.ts', import.meta.url),
          { type: 'module' }
        );
        worker.onmessage = (e: MessageEvent<ParticleWorkerFrame>) => {
          if (e.data.type === 'frame') frameRef.current = e.data;
        };
        workerRef.current = worker;
        countRef.current = count;
        radiiRef.current = makeRadii(count);
        lastWorkerCfgRef.current = {
          distance: cfg.connectionDistance,
          mouseLinks: cfg.mouseLinks,
        };
        worker.postMessage({
          type: 'init',
          count,
          width: w,
          height: h,
          connectionDistance: cfg.connectionDistance,
          mouseLinks: cfg.mouseLinks,
        } satisfies ParticleWorkerIn);
      } catch {
        workerRef.current = null;
      }
    };

    const render = () => {
      const frame = frameRef.current;
      if (!frame) return;

      const cfg = cfgRef.current;
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      dimFactorRef.current += (cfg.dimTarget - dimFactorRef.current) * 0.08;
      const dim = dimFactorRef.current;
      const pos = frame.pos;
      const count = frame.count;
      const radii = radiiRef.current;

      if (cfg.showConnections && frame.pairAlpha.length > 0) {
        const pairs = frame.pairs;
        const alphas = frame.pairAlpha;
        ctx.lineWidth = 0.8;
        for (let b = LINE_BUCKETS - 1; b >= 0; b--) {
          ctx.beginPath();
          let hasLine = false;
          for (let k = 0; k < alphas.length; k++) {
            if (alphas[k] >> 6 !== b) continue;
            const ia = pairs[k * 2] * 2;
            const ib = pairs[k * 2 + 1] * 2;
            ctx.moveTo(pos[ia], pos[ia + 1]);
            ctx.lineTo(pos[ib], pos[ib + 1]);
            hasLine = true;
          }
          if (hasLine) {
            const a = (((b * 64 + 32) / 255) * 0.25 * dim).toFixed(3);
            ctx.strokeStyle = `rgba(0,255,157,${a})`;
            ctx.stroke();
          }
        }
      }

      if (cfg.glow) {
        const sprite = spriteRef.current;
        if (sprite) {
          for (let i = 0; i < count; i++) {
            const size = radii[i] * 8;
            ctx.drawImage(sprite, pos[i * 2] - size / 2, pos[i * 2 + 1] - size / 2, size, size);
          }
        }
      }

      ctx.beginPath();
      ctx.fillStyle = `rgba(0,255,157,${(0.4 * dim).toFixed(3)})`;
      for (let i = 0; i < count; i++) {
        const r = radii[i];
        ctx.moveTo(pos[i * 2] + r, pos[i * 2 + 1]);
        ctx.arc(pos[i * 2], pos[i * 2 + 1], r, 0, Math.PI * 2);
      }
      ctx.fill();

      if (cfg.mouseLinks > 0 && frame.mouseAlpha.length > 0) {
        const mouse = pointerRef.current;
        ctx.lineWidth = 0.8;
        for (let k = 0; k < frame.mouseAlpha.length; k++) {
          const i = frame.mouse[k] * 2;
          const a = ((frame.mouseAlpha[k] / 255) * 0.3 * dim).toFixed(3);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,255,157,${a})`;
          ctx.moveTo(pos[i], pos[i + 1]);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    };

    const loop = (time: number) => {
      rafRef.current = requestAnimationFrame(loop);

      const worker = workerRef.current;
      if (worker) {
        if (lastFrameTsRef.current === 0) {
          lastFrameTsRef.current = time;
          lastTickRef.current = 0;
        }
        const dt = time - lastFrameTsRef.current;
        lastFrameTsRef.current = time;

        if (time - lastTickRef.current >= cfgRef.current.simInterval) {
          const pointer = pointerRef.current;
          if (pointer.dirty) {
            worker.postMessage({
              type: 'pointer',
              x: pointer.x,
              y: pointer.y,
              active: pointer.active,
            } satisfies ParticleWorkerIn);
            pointer.dirty = false;
          }
          worker.postMessage({ type: 'tick', dt } satisfies ParticleWorkerIn);
          lastTickRef.current = time;
        }
      }

      render();
    };

    const handlePointerMove = (e: MouseEvent) => {
      const p = pointerRef.current;
      p.x = e.clientX;
      p.y = e.clientY;
      p.active = true;
      p.dirty = true;
    };

    const handlePointerLeave = () => {
      const p = pointerRef.current;
      p.active = false;
      p.dirty = true;
    };

    const handleResize = () => {
      window.clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = window.setTimeout(() => {
        sizeRef.current = { w: window.innerWidth, h: window.innerHeight };
        applySize();

        const worker = workerRef.current;
        const cfg = cfgRef.current;
        if (worker) {
          const { w, h } = sizeRef.current;
          const newCount = getParticleCount(effectiveTier, w);
          if (newCount !== countRef.current) {
            countRef.current = newCount;
            radiiRef.current = makeRadii(newCount);
          }
          worker.postMessage({ type: 'resize', width: w, height: h, count: newCount });
          if (
            lastWorkerCfgRef.current.distance !== cfg.connectionDistance ||
            lastWorkerCfgRef.current.mouseLinks !== cfg.mouseLinks
          ) {
            lastWorkerCfgRef.current = {
              distance: cfg.connectionDistance,
              mouseLinks: cfg.mouseLinks,
            };
            worker.postMessage({
              type: 'config',
              connectionDistance: cfg.connectionDistance,
              mouseLinks: cfg.mouseLinks,
            });
          }
        }
      }, RESIZE_DEBOUNCE);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      } else if (!rafRef.current) {
        lastFrameTsRef.current = 0;
        lastTickRef.current = 0;
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    applySize();
    idleIdRef.current = getIdleCallback()(initWorker, 800);
    rafRef.current = requestAnimationFrame(loop);

    if (finePointer) {
      window.addEventListener('mousemove', handlePointerMove, { passive: true });
      document.addEventListener('mouseleave', handlePointerLeave);
    }
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (idleIdRef.current !== null) {
        cancelIdleCallback(idleIdRef.current);
        idleIdRef.current = null;
      }
      window.clearTimeout(resizeTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      if (finePointer) {
        window.removeEventListener('mousemove', handlePointerMove);
        document.removeEventListener('mouseleave', handlePointerLeave);
      }
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      workerRef.current?.terminate();
      workerRef.current = null;
      frameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

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
        zIndex: 1,
      }}
    />
  );
}

export const ParticleNetwork = memo(ParticleNetworkComponent);
