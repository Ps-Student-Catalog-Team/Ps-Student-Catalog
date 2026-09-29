export type AdaptiveLevel = 'high' | 'medium' | 'low';
export type QualityPreference = 'auto' | AdaptiveLevel;

export interface TierConfig {
  particleMultiplier: number;
  connectionDistance: number;
  glow: boolean;
  dprCap: number;
  simInterval: number;
  mouseLinks: number;
  trailMaxParticles: number;
  trailSpawnScale: number;
}

export const TIER_CONFIG: Record<AdaptiveLevel, TierConfig> = {
  high: {
    particleMultiplier: 1,
    connectionDistance: 150,
    glow: true,
    dprCap: 2,
    simInterval: 0,
    mouseLinks: 5,
    trailMaxParticles: 70,
    trailSpawnScale: 1,
  },
  medium: {
    particleMultiplier: 0.65,
    connectionDistance: 120,
    glow: true,
    dprCap: 1.5,
    simInterval: 17,
    mouseLinks: 3,
    trailMaxParticles: 45,
    trailSpawnScale: 0.7,
  },
  low: {
    particleMultiplier: 0.4,
    connectionDistance: 90,
    glow: false,
    dprCap: 1,
    simInterval: 33,
    mouseLinks: 0,
    trailMaxParticles: 24,
    trailSpawnScale: 0.4,
  },
};

export function baseParticleCount(width: number): number {
  if (width < 768) return 48;
  if (width < 1024) return 80;
  return 120;
}

export function getParticleCount(level: AdaptiveLevel, width: number = window.innerWidth): number {
  return Math.max(20, Math.round(baseParticleCount(width) * TIER_CONFIG[level].particleMultiplier));
}

function isMobileDevice(): boolean {
  const ua = navigator.userAgent;
  if (/Android|iPhone|iPad|iPod|Windows Phone/i.test(ua)) return true;
  return Math.min(window.screen.width, window.screen.height) < 768;
}

export function detectDeviceTier(): AdaptiveLevel {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const mobile = isMobileDevice();
  const saveData =
    'connection' in nav &&
    (nav as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

  let score = 0;
  score += cores >= 8 ? 2 : cores >= 4 ? 1 : 0;
  score += memory >= 8 ? 2 : memory >= 4 ? 1 : 0;
  score += mobile ? 0 : 1;
  if (saveData) score -= 1;

  if (score <= 1) return 'low';
  if (score <= 3) return 'medium';
  return 'high';
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function getIdleCallback(): (
  cb: () => void,
  timeout?: number
) => number {
  if (typeof window.requestIdleCallback === 'function') {
    return (cb, timeout = 500) =>
      window.requestIdleCallback(cb, { timeout });
  }
  return (cb) => window.setTimeout(cb, 200);
}

export function cancelIdleCallback(id: number): void {
  if (typeof window.cancelIdleCallback === 'function') {
    window.cancelIdleCallback(id);
  } else {
    window.clearTimeout(id);
  }
}
