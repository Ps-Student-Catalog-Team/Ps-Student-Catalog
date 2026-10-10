import { useEffect, useRef } from 'react';
import { usePerformance } from '../../context/PerformanceContext';
import { useMousePositionRef } from '../../hooks/useMousePosition';
import styles from './BackgroundOrbs.module.css';

interface BackgroundOrbsProps {
  dimmed?: boolean;
}

export function BackgroundOrbs({ dimmed = false }: BackgroundOrbsProps) {
  const { settings } = usePerformance();
  const mousePos = useMousePositionRef();
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimated = !settings.reducedMotion;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    if (!isAnimated || isMobile) return;
    const el = containerRef.current;
    if (!el) return;

    let raf = 0;
    const pos = { orb1: { x: 0, y: 0 }, orb2: { x: 0, y: 0 }, grid: { x: 0, y: 0 } };

    const animate = () => {
      raf = 0;
      const targetX = (mousePos.current.x - window.innerWidth / 2) / window.innerWidth;
      const targetY = (mousePos.current.y - window.innerHeight / 2) / window.innerHeight;

      const targets = {
        orb1: { x: targetX * 25, y: targetY * 20 },
        orb2: { x: targetX * -35, y: targetY * -25 },
        grid: { x: targetX * 4, y: targetY * 4 },
      };

      pos.orb1.x += (targets.orb1.x - pos.orb1.x) * 0.08;
      pos.orb1.y += (targets.orb1.y - pos.orb1.y) * 0.08;
      pos.orb2.x += (targets.orb2.x - pos.orb2.x) * 0.06;
      pos.orb2.y += (targets.orb2.y - pos.orb2.y) * 0.06;
      pos.grid.x += (targets.grid.x - pos.grid.x) * 0.12;
      pos.grid.y += (targets.grid.y - pos.grid.y) * 0.12;

      el.style.setProperty('--orb1-x', `${pos.orb1.x}px`);
      el.style.setProperty('--orb1-y', `${pos.orb1.y}px`);
      el.style.setProperty('--orb2-x', `${pos.orb2.x}px`);
      el.style.setProperty('--orb2-y', `${pos.orb2.y}px`);
      el.style.setProperty('--grid-x', `${pos.grid.x}px`);
      el.style.setProperty('--grid-y', `${pos.grid.y}px`);

      const unsettled = (
        Object.keys(targets) as Array<keyof typeof targets>
      ).some(key =>
        Math.abs(targets[key].x - pos[key].x) > 0.05 ||
        Math.abs(targets[key].y - pos[key].y) > 0.05
      );
      if (unsettled && !document.hidden) {
        raf = requestAnimationFrame(animate);
      }
    };

    const scheduleAnimation = () => {
      if (!raf && !document.hidden) {
        raf = requestAnimationFrame(animate);
      }
    };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      } else {
        scheduleAnimation();
      }
    };

    window.addEventListener('mousemove', scheduleAnimation, { passive: true });
    window.addEventListener('resize', scheduleAnimation, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    scheduleAnimation();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', scheduleAnimation);
      window.removeEventListener('resize', scheduleAnimation);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mousePos, isAnimated, isMobile]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${isAnimated ? styles.animate : ''} ${dimmed ? styles.dimmed : ''}`}
    >
      <div className={styles.gridOverlay} aria-hidden="true" />
      {!isMobile && (
        <div className={styles.noiseOverlay}>
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <filter id="bg-noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.75"
                numOctaves="3"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#bg-noise)" />
          </svg>
        </div>
      )}
    </div>
  );
}
