import { useCallback } from 'react';
import { motion } from 'framer-motion';
import styles from './SlateButton.module.css';

/**
 * SlateButton — 克制卡牌按钮
 *
 * 设计理念：
 * - 排列创新：错位网格 + 联动交互
 * - 视觉克制：暗底细边，仅左侧一条彩色装饰线
 * - 交互创新：悬停一张卡，全组卡片联动响应
 */

export interface SlateButtonProps {
  children: React.ReactNode;
  subtitle: string;
  icon: string;
  accentColor: string;
  /** 在本组中的序号 */
  index: number;
  /** 当前悬停的卡片序号（来自父组件） */
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
  onClick: () => void;
  disabled?: boolean;
}

export function SlateButton({
  children,
  subtitle,
  icon,
  accentColor,
  index,
  hoveredIndex,
  onHover,
  onClick,
  disabled = false,
}: SlateButtonProps) {
  const isActive = hoveredIndex === index;
  const isDimmed = hoveredIndex !== null && hoveredIndex !== index;

  const handleMouseEnter = useCallback(() => {
    if (!disabled) onHover(index);
  }, [index, disabled, onHover]);

  const handleMouseLeave = useCallback(() => {
    onHover(null);
  }, [onHover]);

  const handleClick = useCallback(() => {
    if (!disabled) onClick();
  }, [disabled, onClick]);

  const classNames = [
    styles.card,
    isActive ? styles.active : '',
    isDimmed ? styles.dimmed : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.button
      className={classNames}
      style={{ '--accent': accentColor, '--index': index } as React.CSSProperties}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.96 }}
    >
      {/* 左侧装饰线由 ::before 实现 */}

      {/* 图标 */}
      <span className={styles.icon}>{icon}</span>

      {/* 文字 */}
      <span className={styles.textBlock}>
        <span className={styles.title}>{children}</span>
        <span className={styles.subtitle}>{subtitle}</span>
      </span>

      {/* 悬停指示箭头 */}
      <span className={styles.arrow}>→</span>
    </motion.button>
  );
}
