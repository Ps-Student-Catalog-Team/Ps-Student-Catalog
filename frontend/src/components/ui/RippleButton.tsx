import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import styles from './RippleButton.module.css';

interface RippleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
  rippleColor?: string;
  duration?: number;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function RippleButton({
  children,
  onClick,
  color = '#00ff9d',
  rippleColor = 'rgba(255, 255, 255, 0.6)',
  duration = 600,
  className = '',
  disabled = false,
  type = 'button',
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const createRipple = useCallback(
    (button: HTMLButtonElement, clientX: number, clientY: number) => {
      const rect = button.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const id = Date.now();

      setRipples((prev) => [...prev, { x, y, id }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, duration);
    },
    [duration]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      createRipple(e.currentTarget, e.clientX, e.clientY);
      onClick?.();
    },
    [onClick, disabled, createRipple]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLButtonElement>) => {
      if (disabled) return;
      const touch = e.touches[0];
      createRipple(e.currentTarget, touch.clientX, touch.clientY);
    },
    [disabled, createRipple]
  );

  const handleTouchEnd = useCallback(
    () => {
      if (disabled) return;
      onClick?.();
    },
    [onClick, disabled]
  );

  return (
    <motion.button
      type={type}
      className={`${styles.rippleButton} ${className}`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => {}}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        backgroundColor: disabled ? '#666' : 'transparent',
        border: `2px solid ${color}`,
        color: color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        minHeight: '44px',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={styles.ripple}
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: rippleColor,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
      <span className={styles.content}>{children}</span>
    </motion.button>
  );
}
