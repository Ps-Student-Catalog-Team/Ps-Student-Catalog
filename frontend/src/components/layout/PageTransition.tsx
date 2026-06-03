import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { usePerformance } from '../../context/PerformanceContext';

export type ExitAnimationType = 
  | 'slideRight' 
  | 'slideLeft' 
  | 'slideUp' 
  | 'slideDown' 
  | 'scaleOut' 
  | 'scaleOutCenter' 
  | 'rotateOut' 
  | 'flipX' 
  | 'flipY' 
  | 'fadeThrough' 
  | 'shrink';

interface PageTransitionWrapperProps {
  children: ReactNode;
}

export function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
  const { settings } = usePerformance();

  if (!settings.pageTransitions || settings.reducedMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  );
}

interface AnimatedPageProps {
  children: ReactNode;
  exitAnimation?: ExitAnimationType;
}

const exitVariants: Record<ExitAnimationType, { opacity: number; x?: number; y?: number; scale?: number; rotate?: number; rotateX?: number; rotateY?: number }> = {
  slideRight: { opacity: 0, x: 100 },
  slideLeft: { opacity: 0, x: -100 },
  slideUp: { opacity: 0, y: -100 },
  slideDown: { opacity: 0, y: 100 },
  scaleOut: { opacity: 0, scale: 0.8 },
  scaleOutCenter: { opacity: 0, scale: 0 },
  rotateOut: { opacity: 0, rotate: 90, scale: 0.8 },
  flipX: { opacity: 0, rotateX: 90 },
  flipY: { opacity: 0, rotateY: 90 },
  fadeThrough: { opacity: 0, scale: 1.1 },
  shrink: { opacity: 0, scale: 0.6, x: -30 },
};

const exitDurations: Record<ExitAnimationType, number> = {
  slideRight: 0.4,
  slideLeft: 0.4,
  slideUp: 0.45,
  slideDown: 0.45,
  scaleOut: 0.35,
  scaleOutCenter: 0.5,
  rotateOut: 0.45,
  flipX: 0.5,
  flipY: 0.5,
  fadeThrough: 0.4,
  shrink: 0.38,
};

export function AnimatedPage({ children, exitAnimation = 'slideRight' }: AnimatedPageProps) {
  const { settings } = usePerformance();

  if (!settings.pageTransitions || settings.reducedMotion) {
    return <div style={{ willChange: 'auto' }}>{children}</div>;
  }

  const duration = exitDurations[exitAnimation];

  return (
    <motion.div
      initial={{ opacity: 0, x: -30, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={exitVariants[exitAnimation]}
      transition={{
        duration,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        opacity: { duration: duration * 0.8 },
      }}
      style={{ willChange: 'transform, opacity', perspective: '1000px' }}
    >
      {children}
    </motion.div>
  );
}

interface PageTransitionGroupProps {
  children: ReactNode;
  exitAnimation?: ExitAnimationType;
}

export function PageTransitionGroup({ children, exitAnimation = 'slideRight' }: PageTransitionGroupProps) {
  const { settings } = usePerformance();

  if (!settings.pageTransitions || settings.reducedMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <AnimatedPage key={Math.random().toString()} exitAnimation={exitAnimation}>
        {children}
      </AnimatedPage>
    </AnimatePresence>
  );
}

export { PageTransitionWrapper as AnimatedRoutes };
export { AnimatedPage as PageTransition };