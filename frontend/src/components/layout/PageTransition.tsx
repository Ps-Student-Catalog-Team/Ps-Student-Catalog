import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
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
      style={{
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedRoutesProps {
  children: ReactNode;
}

export function AnimatedRoutes({ children }: AnimatedRoutesProps) {
  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  );
}
