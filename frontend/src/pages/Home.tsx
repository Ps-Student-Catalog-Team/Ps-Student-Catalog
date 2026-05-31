import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/layout/PageTransition';
import { Typewriter } from '../components/animations/Typewriter';
import { RippleButton } from '../components/ui/RippleButton';

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

// 4 种标题动态样式
const titleStyle: Record<VPNSessionStatus, React.CSSProperties> = {
  // 流畅（绿）：流光 shimmer 扫过文字
  good: {
    fontFamily: 'Segoe UI, PingFang SC, Hiragino Sans GB, Arial, sans-serif',
    fontSize: 'clamp(1.8rem, 8vw, 3rem)',
    marginBottom: '20px',
    textAlign: 'center',
    background: `linear-gradient(90deg, #00ff9d 0%, #00ff9d 30%, #ffffff 50%, #00ff9d 70%, #00ff9d 100%)`,
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    animation: 'titleShimmer 2.5s linear infinite',
    textShadow: '0 0 20px rgba(0,255,157,0.6), 0 0 40px rgba(0,255,157,0.3)',
  },
  // 一般（黄）：脉冲呼吸
  warning: {
    fontFamily: 'Segoe UI, PingFang SC, Hiragino Sans GB, Arial, sans-serif',
    fontSize: 'clamp(1.8rem, 8vw, 3rem)',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#ffc107',
    animation: 'titleBreath 1.8s ease-in-out infinite',
    textShadow: '0 0 20px rgba(255,193,7,0.6)',
  },
  // 拥挤（红）：剧烈抖动 + 红色光晕
  full: {
    fontFamily: 'Segoe UI, PingFang SC, Hiragino Sans GB, Arial, sans-serif',
    fontSize: 'clamp(1.8rem, 8vw, 3rem)',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#dc3545',
    animation: 'titleShake 0.8s ease-in-out infinite',
    textShadow: '0 0 20px rgba(220,53,69,0.8), 0 0 40px rgba(220,53,69,0.4)',
  },
  // 检测失败（灰）：数字故障 glitch
  error: {
    fontFamily: 'Segoe UI, PingFang SC, Hiragino Sans GB, Arial, sans-serif',
    fontSize: 'clamp(1.8rem, 8vw, 3rem)',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#888888',
    animation: 'titleGlitch 3s infinite',
    textShadow: '0 0 10px rgba(136,136,136,0.3)',
    position: 'relative',
  },
};

const statusColor: Record<VPNSessionStatus, string> = {
  good: '#00ff9d',
  warning: '#ffc107',
  full: '#dc3545',
  error: '#888888',
};

const statusText: Record<VPNSessionStatus, string> = {
  good: '畅通',
  warning: '一般',
  full: '拥挤',
  error: '检测失败',
};

const indicators = [
  { text: '教程', path: '/tutorials' },
  { text: '工具', path: '/tools' },
  { text: '关于', path: '/about' },
  { text: '共享目录', path: 'http://10.88.202.59:5244' },
];

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
  0%   { transform: translate(0); }
  20%  { transform: translate(-2px, 1px); opacity: 0.8; }
  40%  { transform: translate(2px, -1px); opacity: 0.6; }
  60%  { transform: translate(-1px, 2px); opacity: 0.9; }
  80%  { transform: translate(1px, -2px); opacity: 0.7; }
  100% { transform: translate(0); opacity: 1; }
}
`;

export function Home() {
  const navigate = useNavigate();
  const [sessionCount, setSessionCount] = useState<number | null>(null);
  const [sessionStatus, setSessionStatus] = useState<VPNSessionStatus>('error');

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
      {/* 注入动画 keyframes */}
      <style>{glitchKeyframes}</style>

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
        {/* 「学生目录」标题 — 4 种动态样式 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ ...titleStyle[sessionStatus], display: 'inline-block' }}
        >
          <Typewriter text="学生目录" speed={100} delay={500} />
        </motion.div>

        {/* Glitch 伪元素（仅 error 状态生效） */}
        {sessionStatus === 'error' && (
          <>
            <style>{`
              .glitch-text::before,
              .glitch-text::after {
                content: "学生目录";
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                overflow: hidden;
              }
              .glitch-text::before {
                color: #ff0000;
                z-index: -1;
                animation: glitchBefore 3s infinite;
              }
              .glitch-text::after {
                color: #00ffff;
                z-index: -1;
                animation: glitchAfter 3s infinite;
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
            `}</style>
          </>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            color: '#ccc',
            marginBottom: '30px',
            textAlign: 'center',
            maxWidth: '600px',
            padding: '0 16px',
          }}
        >
          欢迎来到学生目录 3.0！
        </motion.p>

        {/* VPN 状态指示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#666',
            fontSize: '0.85rem',
            marginBottom: '20px',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: statusColor[sessionStatus],
              display: 'inline-block',
              boxShadow: `0 0 6px ${statusColor[sessionStatus]}`,
            }}
          />
          <span>
            VPN 状态：{statusText[sessionStatus]}
            {sessionCount !== null && `（${sessionCount} 人在线）`}
          </span>
        </motion.div>

        {/* 导航按钮 */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', padding: '0 16px' }}>
          {indicators.map((item, i) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
            >
              <RippleButton
                color={statusColor[sessionStatus]}
                onClick={() => {
                  if (item.path.startsWith('http')) {
                    window.open(item.path, '_blank');
                  } else {
                    navigate(item.path);
                  }
                }}
              >
                {item.text}
              </RippleButton>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
