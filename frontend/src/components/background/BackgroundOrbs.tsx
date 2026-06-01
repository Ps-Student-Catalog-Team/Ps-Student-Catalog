import { usePerformance } from '../../context/PerformanceContext';
import styles from './BackgroundOrbs.module.css';

/**
 * 纯 CSS 光球背景组件。
 * - 两层漂浮光球（暖绿 + 冷蓝）+ 点阵纹理 + SVG 噪点
 * - 零 JS 动画循环，全 GPU 合成（transform: translateZ + will-change）
 * - 尊重 PerformanceContext.reducedMotion：关闭时静态显示
 * - 移动端自动降级（无动画、无噪点）
 */
export function BackgroundOrbs() {
  const { settings } = usePerformance();
  const isAnimated = !settings.reducedMotion;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className={`${styles.container} ${isAnimated ? styles.animate : ''}`}>
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
