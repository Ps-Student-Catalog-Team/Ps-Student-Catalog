import { usePerformance } from '../../context/PerformanceContext';
import styles from './BackgroundOrbs.module.css';

interface BackgroundOrbsProps {
  dimmed?: boolean;
}

export function BackgroundOrbs({ dimmed = false }: BackgroundOrbsProps) {
  const { settings } = usePerformance();
  const isAnimated = !settings.reducedMotion;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className={`${styles.container} ${isAnimated ? styles.animate : ''} ${dimmed ? styles.dimmed : ''}`}>
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
