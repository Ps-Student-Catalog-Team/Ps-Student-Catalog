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
      const targetX = (mousePos.current.x - window.innerWidth / 2) / window.innerWidth;
      const targetY = (mousePos.current.y - window.innerHeight / 2) / window.innerHeight;

      pos.orb1.x += (targetX * 25 - pos.orb1.x) * 0.08;
      pos.orb1.y += (targetY * 20 - pos.orb1.y) * 0.08;
      pos.orb2.x += (targetX * -35 - pos.orb2.x) * 0.06;
      pos.orb2.y += (targetY * -25 - pos.orb2.y) * 0.06;
      pos.grid.x += (targetX * 4 - pos.grid.x) * 0.12;
      pos.grid.y += (targetY * 4 - pos.grid.y) * 0.12;

      el.style.setProperty('--orb1-x', `${pos.orb1.x}px`);
      el.style.setProperty('--orb1-y', `${pos.orb1.y}px`);
      el.style.setProperty('--orb2-x', `${pos.orb2.x}px`);
      el.style.setProperty('--orb2-y', `${pos.orb2.y}px`);
      el.style.setProperty('--grid-x', `${pos.grid.x}px`);
      el.style.setProperty('--grid-y', `${pos.grid.y}px`);

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [mousePos, isAnimated, isMobile]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${isAnimated ? styles.animate : ''} ${dimmed ? styles.dimmed : ''}`}
    >
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
