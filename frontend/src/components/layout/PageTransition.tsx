import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { usePerformance } from '../../context/PerformanceContext';

interface PageTransitionWrapperProps {
  children: ReactNode;
}

/**
 * 页面切换动画容器。
 * 当 pageTransitions=false 时直接渲染 children，不包裹 AnimatePresence，
 * 避免 Framer Motion 开销。
 */
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
}

/**
 * 单页动画包装器。
 * 当 pageTransitions=false 或 reducedMotion=true 时渲染纯 div，
 * 完全跳过 Framer Motion。
 */
export function AnimatedPage({ children }: AnimatedPageProps) {
  const { settings } = usePerformance();

  if (!settings.pageTransitions || settings.reducedMotion) {
    return <div style={{ willChange: 'auto' }}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 30, scale: 0.95 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
        opacity: { duration: 0.3 },
      }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}

/* 兼容旧代码导出名 */
export { PageTransitionWrapper as AnimatedRoutes };
export { AnimatedPage as PageTransition };
