import { usePerformance } from '../../context/PerformanceContext';
import { useMousePosition } from '../../hooks/useMousePosition';
import { useState, useEffect, useRef } from 'react';
import styles from './BackgroundOrbs.module.css';

interface BackgroundOrbsProps {
  dimmed?: boolean;
}

export function BackgroundOrbs({ dimmed = false }: BackgroundOrbsProps) {
  const { settings } = usePerformance();
  const mousePos = useMousePosition();
  const isAnimated = !settings.reducedMotion;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  const [orb1Pos, setOrb1Pos] = useState({ x: 0, y: 0 });
  const [orb2Pos, setOrb2Pos] = useState({ x: 0, y: 0 });
  const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();
  const lastMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isAnimated || isMobile) return;

    const animate = () => {
      const targetX = (mousePos.x - window.innerWidth / 2) / window.innerWidth;
      const targetY = (mousePos.y - window.innerHeight / 2) / window.innerHeight;

      setOrb1Pos(prev => ({
        x: prev.x + (targetX * 25 - prev.x) * 0.08,
        y: prev.y + (targetY * 20 - prev.y) * 0.08
      }));

      setOrb2Pos(prev => ({
        x: prev.x + (targetX * -35 - prev.x) * 0.06,
        y: prev.y + (targetY * -25 - prev.y) * 0.06
      }));

      setGridOffset(prev => ({
        x: prev.x + (targetX * 4 - prev.x) * 0.12,
        y: prev.y + (targetY * 4 - prev.y) * 0.12
      }));

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mousePos, isAnimated, isMobile]);

  return (
    <div 
      className={`${styles.container} ${isAnimated ? styles.animate : ''} ${dimmed ? styles.dimmed : ''}`}
      style={{
        '--orb1-x': `${orb1Pos.x}px`,
        '--orb1-y': `${orb1Pos.y}px`,
        '--orb2-x': `${orb2Pos.x}px`,
        '--orb2-y': `${orb2Pos.y}px`,
        '--grid-x': `${gridOffset.x}px`,
        '--grid-y': `${gridOffset.y}px`
      } as React.CSSProperties}
    >
      {/* SVG 噪点纹理（GPGPU-free，一次性渲染） */}
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
