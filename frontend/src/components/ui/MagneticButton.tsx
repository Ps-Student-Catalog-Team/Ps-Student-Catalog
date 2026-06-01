import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './MagneticButton.module.css';

/**
 * MagneticButton — 磁性悬浮 + 旋转全息边框 + 扫光 + Ripple
 */

export type ButtonColorScheme =
  | 'emerald'   // 翠绿 — 导航/主功能
  | 'violet'    // 紫罗兰 — 工具类
  | 'cyan'      // 青色 — 内容/教程
  | 'amber'     // 琥珀 — 外链/特殊
  | 'rose';     // 玫瑰 — 关于/信息

interface ColorDef {
  borderColor1: string;
  borderColor2: string;
  bgFill: string;
  textColor: string;
  glowColor: string;
  glowColorDim: string;
  glowBg: string;
  rippleColor: string;
  cornerTag: string;
}

const COLOR_MAP: Record<ButtonColorScheme, ColorDef> = {
  emerald: {
    borderColor1: '#00ff9d',
    borderColor2: '#00cc7a',
    bgFill: 'linear-gradient(135deg, rgba(0,255,157,0.07) 0%, rgba(0,0,0,0.88) 100%)',
    textColor: '#00ff9d',
    glowColor: '#00ff9d',
    glowColorDim: 'rgba(0,255,157,0.25)',
    glowBg: 'radial-gradient(ellipse, rgba(0,255,157,0.3) 0%, transparent 70%)',
    rippleColor: 'rgba(0,255,157,0.35)',
    cornerTag: 'SYS:01',
  },
  violet: {
    borderColor1: '#c084fc',
    borderColor2: '#818cf8',
    bgFill: 'linear-gradient(135deg, rgba(192,132,252,0.07) 0%, rgba(0,0,0,0.88) 100%)',
    textColor: '#c084fc',
    glowColor: '#c084fc',
    glowColorDim: 'rgba(192,132,252,0.25)',
    glowBg: 'radial-gradient(ellipse, rgba(192,132,252,0.3) 0%, transparent 70%)',
    rippleColor: 'rgba(192,132,252,0.35)',
    cornerTag: 'MOD:03',
  },
  cyan: {
    borderColor1: '#22d3ee',
    borderColor2: '#06b6d4',
    bgFill: 'linear-gradient(135deg, rgba(34,211,238,0.07) 0%, rgba(0,0,0,0.88) 100%)',
    textColor: '#22d3ee',
    glowColor: '#22d3ee',
    glowColorDim: 'rgba(34,211,238,0.25)',
    glowBg: 'radial-gradient(ellipse, rgba(34,211,238,0.3) 0%, transparent 70%)',
    rippleColor: 'rgba(34,211,238,0.35)',
    cornerTag: 'NET:02',
  },
  amber: {
    borderColor1: '#fbbf24',
    borderColor2: '#f59e0b',
    bgFill: 'linear-gradient(135deg, rgba(251,191,36,0.07) 0%, rgba(0,0,0,0.88) 100%)',
    textColor: '#fbbf24',
    glowColor: '#fbbf24',
    glowColorDim: 'rgba(251,191,36,0.25)',
    glowBg: 'radial-gradient(ellipse, rgba(251,191,36,0.3) 0%, transparent 70%)',
    rippleColor: 'rgba(251,191,36,0.35)',
    cornerTag: 'EXT:04',
  },
  rose: {
    borderColor1: '#fb7185',
    borderColor2: '#e11d48',
    bgFill: 'linear-gradient(135deg, rgba(251,113,133,0.07) 0%, rgba(0,0,0,0.88) 100%)',
    textColor: '#fb7185',
    glowColor: '#fb7185',
    glowColorDim: 'rgba(251,113,133,0.25)',
    glowBg: 'radial-gradient(ellipse, rgba(251,113,133,0.3) 0%, transparent 70%)',
    rippleColor: 'rgba(251,113,133,0.35)',
    cornerTag: 'INF:05',
  },
};

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  colorScheme?: ButtonColorScheme;
  icon?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  /** 磁性吸附强度 0~1，默认 0.35 */
  magnetStrength?: number;
}

interface Ripple {
  x: number;
  y: number;
  id: number;
  size: number;
}

export function MagneticButton({
  children,
  onClick,
  colorScheme = 'emerald',
  icon,
  disabled = false,
  type = 'button',
  className = '',
  magnetStrength = 0.35,
}: MagneticButtonProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const animFrameRef = useRef<number>(0);

  const c = COLOR_MAP[colorScheme];

  // ── 磁性跟随 ─────────────────────────────────────────────
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!wrapperRef.current || !btnRef.current || disabled) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * magnetStrength;
      const dy = (e.clientY - cy) * magnetStrength;
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(() => {
        if (btnRef.current) {
          btnRef.current.style.setProperty('--tx', `${dx}px`);
          btnRef.current.style.setProperty('--ty', `${dy}px`);
        }
      });
    },
    [disabled, magnetStrength]
  );

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (btnRef.current) {
      btnRef.current.style.setProperty('--tx', '0px');
      btnRef.current.style.setProperty('--ty', '0px');
    }
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [handleMouseMove, handleMouseLeave]);

  // ── Ripple ────────────────────────────────────────────────
  const addRipple = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled || !btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 1.2;
      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev, { x, y, id, size }]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
    },
    [disabled]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      addRipple(e.clientX, e.clientY);
      onClick?.();
    },
    [disabled, onClick, addRipple]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLButtonElement>) => {
      if (disabled) return;
      const t = e.touches[0];
      addRipple(t.clientX, t.clientY);
    },
    [disabled, addRipple]
  );

  const handleTouchEnd = useCallback(() => {
    if (!disabled) onClick?.();
  }, [disabled, onClick]);

  // CSS 变量
  const cssVars = {
    '--border-color1': c.borderColor1,
    '--border-color2': c.borderColor2,
    '--bg-fill': c.bgFill,
    '--text-color': c.textColor,
    '--glow-color': c.glowColor,
    '--glow-color-dim': c.glowColorDim,
    '--glow-bg': c.glowBg,
  } as React.CSSProperties;

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <motion.button
        ref={btnRef}
        type={type}
        disabled={disabled}
        className={`${styles.btn} ${className}`}
        style={cssVars}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {}}
        whileTap={disabled ? {} : { scale: 0.93 }}
      >
        {/* 扫光层（inset 裁剪） */}
        <span className={styles.scan} />

        {/* 外部光晕 */}
        <span className={styles.glow} />

        {/* Ripple 水波纹（裁剪在按钮轮廓内） */}
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 12,
            overflow: 'hidden',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          {ripples.map((r) => (
            <span
              key={r.id}
              className={styles.ripple}
              style={{
                left: r.x - r.size / 2,
                top: r.y - r.size / 2,
                width: r.size,
                height: r.size,
                backgroundColor: c.rippleColor,
              }}
            />
          ))}
        </span>

        {/* 图标 */}
        {icon && <span className={styles.icon}>{icon}</span>}

        {/* 文字 */}
        <span className={styles.label}>{children}</span>

        {/* 角落数据标签 */}
        <span className={styles.cornerTag}>{c.cornerTag}</span>
      </motion.button>
    </div>
  );
}
