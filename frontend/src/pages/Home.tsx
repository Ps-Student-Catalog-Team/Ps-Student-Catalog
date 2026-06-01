import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/layout/PageTransition';
import { Typewriter } from '../components/animations/Typewriter';
import { SlateButton } from '../components/ui/SlateButton';

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

// 注入动画 keyframes（只注入一次）
const glitchKeyframes = `
@keyframes titleShimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes titleBreath {
  0%, 100% { opacity: 1; filter: brightness(1); }
  50%      { opacity: 0.7; filter: brightness(1.3); }
}
@keyframes titleShake {
  0%, 100% { transform: translateX(0); }
  10%       { transform: translateX(-3px) rotate(-0.5deg); }
  20%       { transform: translateX(3px) rotate(0.5deg); }
  30%       { transform: translateX(-2px) rotate(-0.3deg); }
  40%       { transform: translateX(2px) rotate(0.3deg); }
  50%       { transform: translateX(-1px); }
  60%       { transform: translateX(1px); }
}
@keyframes titleGlitch {
  0%   { transform: translate(0); opacity: 1; }
  20%  { transform: translate(-2px, 1px); opacity: 0.8; }
  40%  { transform: translate(2px, -1px); opacity: 0.6; }
  60%  { transform: translate(-1px, 2px); opacity: 0.9; }
  80%  { transform: translate(1px, -2px); opacity: 0.7; }
  100% { transform: translate(0); opacity: 1; }
}
@keyframes glitchBefore {
  0%, 100% { clip-path: inset(0 0 85% 0); transform: translate(-2px, -1px); }
  10%      { clip-path: inset(15% 0 65% 0); transform: translate(2px, 1px); }
  20%      { clip-path: inset(35% 0 40% 0); transform: translate(-1px, 2px); }
  30%      { clip-path: inset(60% 0 10% 0); transform: translate(1px, -2px); }
  40%      { clip-path: inset(80% 0 0 0); transform: translate(-2px, 1px); }
  50%      { clip-path: inset(0 0 50% 0); transform: translate(2px, -1px); }
  60%      { clip-path: inset(25% 0 25% 0); transform: translate(-1px, 2px); }
  70%      { clip-path: inset(50% 0 0 0); transform: translate(1px, -1px); }
  80%      { clip-path: inset(10% 0 60% 0); transform: translate(-2px, 1px); }
  90%      { clip-path: inset(40% 0 20% 0); transform: translate(2px, -2px); }
}
@keyframes glitchAfter {
  0%, 100% { clip-path: inset(85% 0 0 0); transform: translate(2px, 1px); }
  10%      { clip-path: inset(0 0 15% 0); transform: translate(-2px, -1px); }
  20%      { clip-path: inset(60% 0 35% 0); transform: translate(1px, -2px); }
  30%      { clip-path: inset(10% 0 60% 0); transform: translate(-1px, 2px); }
  40%      { clip-path: inset(0 0 80% 0); transform: translate(2px, -1px); }
  50%      { clip-path: inset(50% 0 0 0); transform: translate(-2px, 1px); }
  60%      { clip-path: inset(25% 0 25% 0); transform: translate(1px, -2px); }
  70%      { clip-path: inset(0 0 50% 0); transform: translate(-1px, 1px); }
  80%      { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
  90%      { clip-path: inset(20% 0 40% 0); transform: translate(-2px, 2px); }
}
@keyframes welcomeShimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes welcomeGlow {
  0%, 100% { 
    text-shadow: 0 0 5px rgba(0,255,157,0.3), 0 0 10px rgba(0,255,157,0.2); 
  }
  50% { 
    text-shadow: 0 0 10px rgba(0,255,157,0.6), 0 0 20px rgba(0,255,157,0.4), 0 0 30px rgba(0,255,157,0.2); 
  }
}
@keyframes welcomeFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
`;

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

// 4 种标题样式（带 CSS transition，样式切换时平滑过渡）
const titleStyle: Record<VPNSessionStatus, React.CSSProperties> = {
  good: {
    fontFamily: 'Segoe UI, PingFang SC, Hiragino Sans GB, Arial, sans-serif',
    fontSize: 'clamp(1.8rem, 8vw, 3rem)',
    marginBottom: '20px',
    textAlign: 'center',
    background: `linear-gradient(90deg, ${statusColor.good} 0%, ${statusColor.good} 30%, #ffffff 50%, ${statusColor.good} 70%, ${statusColor.good} 100%)`,
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    animation: 'titleShimmer 2.5s linear infinite',
    textShadow: statusGlow.good,
    transition: 'text-shadow 0.6s ease',
    display: 'inline-block',
  },
  warning: {
    fontFamily: 'Segoe UI, PingFang SC, Hiragino Sans GB, Arial, sans-serif',
    fontSize: 'clamp(1.8rem, 8vw, 3rem)',
    marginBottom: '20px',
    textAlign: 'center',
    color: statusColor.warning,
    animation: 'titleBreath 1.8s ease-in-out infinite',
    textShadow: statusGlow.warning,
    transition: 'text-shadow 0.6s ease, color 0.6s ease, filter 0.6s ease',
    display: 'inline-block',
  },
  full: {
    fontFamily: 'Segoe UI, PingFang SC, Hiragino Sans GB, Arial, sans-serif',
    fontSize: 'clamp(1.8rem, 8vw, 3rem)',
    marginBottom: '20px',
    textAlign: 'center',
    color: statusColor.full,
    animation: 'titleShake 0.8s ease-in-out infinite',
    textShadow: statusGlow.full,
    transition: 'text-shadow 0.6s ease, color 0.6s ease, filter 0.6s ease',
    display: 'inline-block',
  },
  error: {
    fontFamily: 'Segoe UI, PingFang SC, Hiragino Sans GB, Arial, sans-serif',
    fontSize: 'clamp(1.8rem, 8vw, 3rem)',
    marginBottom: '20px',
    textAlign: 'center',
    color: statusColor.error,
    animation: 'titleGlitch 3s infinite',
    textShadow: statusGlow.error,
    position: 'relative' as const,
    transition: 'text-shadow 0.6s ease, color 0.6s ease',
    display: 'inline-block',
  },
};

const statusText: Record<VPNSessionStatus, string> = {
  good: '畅通',
  warning: '一般',
  full: '拥挤',
  error: '检测失败',
};

// 按钮配置：图标 + 路径 + 副标题 + 独立配色
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

export function Home() {
  const navigate = useNavigate();
  const [sessionCount, setSessionCount] = useState<number | null>(null);
  const [sessionStatus, setSessionStatus] = useState<VPNSessionStatus>('error');
  const [hoveredBtnIndex, setHoveredBtnIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

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
      try {
        const response = await fetchFromApi('/api/vpn-users?ip=10.88.202.59', { timeout: 5000 });
        const data = await response.json();
        if (!data.success) throw new Error(data.error || '获取会话数失败');
        const count: number = data.sessionCount;
        if (count === null || count === undefined) throw new Error('会话数数据无效');
        if (!cancelled) {
          setSessionCount(Math.max(0, count - 1));
          if (count < 4) setSessionStatus('good');
          else if (count >= 4 && count <= 7) setSessionStatus('warning');
          else setSessionStatus('full');
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
      {/* 注入动画 keyframes（全局一次） */}
      <style>{glitchKeyframes}</style>

      {/* Glitch 伪元素样式（仅 error 状态生效） */}
      {sessionStatus === 'error' && (
        <style>{`
          .glitch-title::before,
          .glitch-title::after {
            content: "学生目录";
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            pointer-events: none;
          }
          .glitch-title::before {
            color: #ff0000;
            animation: glitchBefore 3s infinite;
            z-index: -1;
          }
          .glitch-title::after {
            color: #00ffff;
            animation: glitchAfter 3s infinite;
            z-index: -1;
          }
        `}</style>
      )}

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(10,10,10,0.8) 0%, rgba(26,26,46,0.8) 100%)',
        }}
      >
        {/* 返回旧版按钮 */}
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          onClick={() => window.location.href = '/index.html'}
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
          style={titleStyle[sessionStatus]}
          className={sessionStatus === 'error' ? 'glitch-title' : ''}
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
                  onHover={setHoveredBtnIndex}
                  icon={item.icon}
                  subtitle={item.subtitle}
                  accentColor={item.accentColor}
                  onClick={() => {
                    if (item.path.startsWith('http')) {
                      window.open(item.path, '_blank');
                    } else {
                      navigate(item.path);
                    }
                  }}
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
                      stroke={isHovered ? '#22c55e' : 'rgba(255,255,255,0.06)'}
                      strokeWidth={isHovered ? 1.5 : 0.5}
                      strokeDasharray={isHovered ? 'none' : '4 8'}
                      style={{ transition: 'stroke 0.4s ease, stroke-width 0.4s ease' }}
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
                        onHover={setHoveredBtnIndex}
                        icon={item.icon}
                        subtitle={item.subtitle}
                        accentColor={item.accentColor}
                        onClick={() => {
                          if (item.path.startsWith('http')) {
                            window.open(item.path, '_blank');
                          } else {
                            navigate(item.path);
                          }
                        }}
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
