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

  const statusColor: Record<VPNSessionStatus, string> = {
    good: 'rgb(0, 189, 73)',
    warning: 'rgb(255, 193, 7)',
    full: 'rgb(220, 53, 69)',
    error: 'rgb(128, 128, 128)',
  };

  const statusText: Record<VPNSessionStatus, string> = {
    good: '流畅',
    warning: '一般',
    full: '拥挤',
    error: '检测失败',
  };

  return (
    <PageTransition>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.8) 0%, rgba(26, 26, 46, 0.8) 100%)',
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            fontFamily: 'Segoe UI, PingFang SC, Hiragino Sans GB, Arial, sans-serif',
            fontSize: 'clamp(1.8rem, 8vw, 3rem)',
            color: '#00ff9d',
            marginBottom: '20px',
            textShadow: '0 0 20px rgba(0, 255, 157, 0.5)',
            textAlign: 'center',
          }}
        >
          <Typewriter text="学生目录" speed={100} delay={500} />
        </motion.h1>

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

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', padding: '0 16px', marginBottom: '20px' }}>
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
              marginBottom: '8px',
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

          {[
            { text: '教程', path: '/tutorials' },
            { text: '工具', path: '/tools', vpnColored: true },
            { text: '关于', path: '/about' },
            { text: '共享目录', path: 'http://10.88.202.59:5244' },
          ].map((item, i) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
            >
              <RippleButton
                color={item.vpnColored ? statusColor[sessionStatus] : '#00ff9d'}
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
