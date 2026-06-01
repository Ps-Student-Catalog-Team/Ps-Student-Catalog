import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/layout/PageTransition';
import { Typewriter } from '../components/animations/Typewriter';
import { SlateButton } from '../components/ui/SlateButton';
import { BackgroundOrbs } from '../components/background/BackgroundOrbs';
import animations from './HomeAnimations.module.css';
import { getCache, setCache } from '../utils/cache';

const API_BASE_URL = 'http://10.88.202.59:3132';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

async function fetchFromApi(endpoint: string, options: FetchOptions = {}) {
  const { timeout = 5000, ...fetchOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

type VPNSessionStatus = 'good' | 'warning' | 'full' | 'error';

const VPN_CACHE_KEY = 'vpn-status';
const VPN_CACHE_TTL = 30000;

interface VPNCacheData {
  sessionCount: number;
  sessionStatus: VPNSessionStatus;
}

const statusColor: Record<VPNSessionStatus, string> = {
  good: '#00ff9d',
  warning: '#ffc107',
  full: '#dc3545',
  error: '#888888',
};

const statusGlow: Record<VPNSessionStatus, string> = {
  good: '0 0 20px rgba(0,255,157,0.6), 0 0 40px rgba(0,255,157,0.3)',
  warning: '0 0 20px rgba(255,193,7,0.6)',
  full: '0 0 20px rgba(220,53,69,0.8), 0 0 40px rgba(220,53,69,0.4)',
  error: '0 0 10px rgba(136,136,136,0.3)',
};

const statusText: Record<VPNSessionStatus, string> = {
  good: '畅通',
  warning: '一般',
  full: '拥挤',
  error: '检测失败',
};

const navButtons: Array<{
  text: string;
  path: string;
  icon: string;
  subtitle: string;
  accentColor: string;
}> = [
  { text: '教程', path: '/tutorials', icon: '', subtitle: '快速入门与文档', accentColor: '#22c55e' },
  { text: '工具', path: '/tools', icon: '', subtitle: '效率工具箱', accentColor: '#22c55e' },
  { text: '关于', path: '/about', icon: '', subtitle: '项目与团队', accentColor: '#22c55e' },
  { text: '共享目录', path: 'http://10.88.202.59:5244', icon: '', subtitle: '文件共享入口', accentColor: '#22c55e' },
];

const titleStyleBase: Record<VPNSessionStatus, React.CSSProperties> = {
  good: {
    background: `linear-gradient(90deg, ${statusColor.good} 0%, ${statusColor.good} 30%, #ffffff 50%, ${statusColor.good} 70%, ${statusColor.good} 100%)`,
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    animation: 'titleShimmer 2.5s linear infinite',
    textShadow: statusGlow.good,
  },
  warning: {
    color: statusColor.warning,
    animation: 'titleBreath 1.8s ease-in-out infinite',
    textShadow: statusGlow.warning,
  },
  full: {
    color: statusColor.full,
    animation: 'titleShake 0.8s ease-in-out infinite',
    textShadow: statusGlow.full,
  },
  error: {
    color: statusColor.error,
    animation: 'titleGlitch 3s infinite',
    textShadow: statusGlow.error,
    position: 'relative' as const,
  },
};

export function Home() {
  const navigate = useNavigate();
  const [sessionCount, setSessionCount] = useState<number | null>(null);
  const [sessionStatus, setSessionStatus] = useState<VPNSessionStatus>('error');
  const [hoveredBtnIndex, setHoveredBtnIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const titleStyle = useMemo(() => ({
    fontFamily: 'Segoe UI, PingFang SC, Hiragino Sans GB, Arial, sans-serif',
    fontSize: 'clamp(1.8rem, 8vw, 3rem)',
    marginBottom: '20px',
    textAlign: 'center' as const,
    display: 'inline-block',
    transition: 'text-shadow 0.6s ease, color 0.6s ease',
    ...titleStyleBase[sessionStatus],
  }), [sessionStatus]);

  const handleHover = useCallback((index: number | null) => {
    setHoveredBtnIndex(index);
  }, []);

  const handleButtonClick = useCallback((path: string) => {
    if (path.startsWith('http')) {
      window.open(path, '_blank');
    } else {
      navigate(path);
    }
  }, [navigate]);

  const handleReturnClick = useCallback(() => {
    window.location.href = '/index.html';
  }, []);

  // 移动端检测
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function checkVPNSessionCount() {
      const cached = getCache<VPNCacheData>(VPN_CACHE_KEY);
      if (cached) {
        if (!cancelled) {
          setSessionCount(cached.sessionCount);
          setSessionStatus(cached.sessionStatus);
        }
        return;
      }

      try {
        const response = await fetchFromApi('/api/vpn-users?ip=10.88.202.59', { timeout: 5000 });
        const data = await response.json();
        if (!data.success) throw new Error(data.error || '获取会话数失败');
        const count: number = data.sessionCount;
        if (count === null || count === undefined) throw new Error('会话数数据无效');
        if (!cancelled) {
          const displayCount = Math.max(0, count - 1);
          let status: VPNSessionStatus = 'good';
          if (count >= 8) status = 'full';
          else if (count >= 4) status = 'warning';
          
          setSessionCount(displayCount);
          setSessionStatus(status);
          
          setCache<VPNCacheData>(VPN_CACHE_KEY, {
            sessionCount: displayCount,
            sessionStatus: status,
          }, VPN_CACHE_TTL);
        }
      } catch (err) {
        console.error('检测 VPN 会话数失败:', err);
        if (!cancelled) {
          setSessionStatus('error');
          setSessionCount(null);
        }
      }
    }

    checkVPNSessionCount();
    const timer = setInterval(checkVPNSessionCount, 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return (
    <PageTransition>
      <BackgroundOrbs />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        {/* 返回旧版按钮 */}
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          onClick={handleReturnClick}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '8px 16px',
            background: 'rgba(0, 255, 157, 0.1)',
            border: '1px solid rgba(0, 255, 157, 0.3)',
            borderRadius: '8px',
            color: '#00ff9d',
            fontSize: '0.85rem',
            cursor: 'pointer',
            zIndex: 1000,
            transition: 'all 0.3s ease',
          }}
          whileHover={{ 
            background: 'rgba(0, 255, 157, 0.2)',
            scale: 1.05
          }}
        >
          ← 返回旧版
        </motion.button>
        {/* 「学生目录」标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: hoveredBtnIndex !== null ? 0.35 : 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={titleStyle}
          className={sessionStatus === 'error' ? animations.glitchTitle : ''}
        >
          <Typewriter text="学生目录" speed={100} delay={500} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: hoveredBtnIndex !== null ? 0.35 : 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          style={{
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            marginBottom: '30px',
            textAlign: 'center',
            maxWidth: '600px',
            padding: '0 16px',
            background: 'linear-gradient(90deg, #00ff9d 0%, #00cc7a 25%, #ffffff 50%, #00cc7a 75%, #00ff9d 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            animation: 'welcomeShimmer 3s linear infinite, welcomeGlow 2s ease-in-out infinite, welcomeFloat 3s ease-in-out infinite',
            display: 'inline-block',
          }}
        >
          <Typewriter text="欢迎来到学生目录 3.0！" speed={80} delay={1200} />
        </motion.p>

        {/* ── VPN 状态圆心 + 扇形展开导航（移动端改为普通排列） ── */}
        {isMobile ? (
          /* 手机版：正常竖排 */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              marginTop: '8px',
              opacity: hoveredBtnIndex !== null ? 0.5 : 1,
              transition: 'opacity 0.4s ease',
            }}
          >
            {navButtons.map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.15 + i * 0.1 }}
              >
                <SlateButton
                  index={i}
                  hoveredIndex={hoveredBtnIndex}
                  onHover={handleHover}
                  icon={item.icon}
                  subtitle={item.subtitle}
                  accentColor={item.accentColor}
                  onClick={() => handleButtonClick(item.path)}
                >
                  {item.text}
                </SlateButton>
              </motion.div>
            ))}
          </div>
        ) : (
          /* 桌面版：扇形排列 */
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '500px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* 扇柄 / 圆心：VPN 状态 */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: hoveredBtnIndex !== null ? 0.4 : 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#888',
                fontSize: '0.8rem',
                letterSpacing: '0.04em',
                padding: '8px 20px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                zIndex: 2,
              }}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: statusColor[sessionStatus],
                  boxShadow: `0 0 10px ${statusColor[sessionStatus]}, 0 0 20px ${statusColor[sessionStatus]}40`,
                  transition: 'background 0.6s ease, box-shadow 0.6s ease',
                }}
              />
              <span>
                VPN {statusText[sessionStatus]}
                {sessionCount !== null && ` · ${sessionCount} 在线`}
              </span>
            </motion.div>

            {/* 扇形卡片区 — 半径加大 + 角度拉开，避免重叠 */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '310px',
              }}
            >
              {/* 扇骨连线 SVG */}
              <svg
                viewBox="0 0 500 310"
                preserveAspectRatio="none"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 0,
                  opacity: hoveredBtnIndex !== null ? 0.35 : 1,
                  transition: 'opacity 0.4s ease',
                }}
              >
                {navButtons.map((_, i) => {
                  const fanAngles = [-64, -24, 24, 64];
                  const rad = (fanAngles[i] * Math.PI) / 180;
                  const cx = 250;
                  const cy = 0;
                  const r = 240;
                  const x2 = cx + Math.sin(rad) * r;
                  const y2 = cy + Math.cos(rad) * r;
                  const isHovered = hoveredBtnIndex === i;
                  return (
                    <line
                      key={i}
                      x1={cx}
                      y1={cy}
                      x2={x2}
                      y2={y2}
                      stroke={isHovered ? '#22c55e' : 'rgba(255,255,255,0.12)'}
                      strokeWidth={isHovered ? 2 : 0.8}
                      strokeDasharray={isHovered ? 'none' : '6 10'}
                      filter={isHovered ? 'drop-shadow(0 0 6px rgba(34,197,94,0.5))' : 'none'}
                      style={{
                        transition: 'stroke 0.4s ease, stroke-width 0.4s ease, filter 0.4s ease',
                      }}
                    />
                  );
                })}
              </svg>

              {navButtons.map((item, i) => {
                const fanAngles = [-64, -24, 24, 64];
                const rad = (fanAngles[i] * Math.PI) / 180;
                const radius = 240;
                const xOffset = Math.sin(rad) * radius;
                const yOffset = Math.cos(rad) * radius;

                return (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.65,
                      delay: 1.15 + i * 0.1,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    style={{
                      position: 'absolute',
                      left: `calc(50% + ${xOffset}px)`,
                      top: `${yOffset}px`,
                      zIndex: 1,
                    }}
                  >
                    <div style={{ transform: 'translate(-50%, 0)' }}>
                      <SlateButton
                        index={i}
                        hoveredIndex={hoveredBtnIndex}
                        onHover={handleHover}
                        icon={item.icon}
                        subtitle={item.subtitle}
                        accentColor={item.accentColor}
                        onClick={() => handleButtonClick(item.path)}
                      >
                        {item.text}
                      </SlateButton>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
