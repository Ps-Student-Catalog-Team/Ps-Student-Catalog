import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/layout/PageTransition';
import { RippleButton } from '../components/ui/RippleButton';

const API_BASE_URL = '';

const VPN_IPS = [
  '10.88.194.142',
  '10.88.202.11',
  '10.88.202.78',
  '10.88.213.212'
];

interface VPNStatus {
  online: boolean;
  ping: number;
  lastOnline: string;
  sessionCount?: number;
}

interface Announcement {
  newest?: {
    title: string;
    content: string[];
  };
  serverModifiedTime?: string;
}

interface VPNPassword {
  password: string;
  updatedAt: string;
}

export function Newest() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [password, setPassword] = useState('加载中...');
  const [passwordTime, setPasswordTime] = useState('加载中...');
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [vpnStatuses, setVpnStatuses] = useState<Record<string, VPNStatus>>({});
  const [, setLoading] = useState(true);

  interface FetchOptions extends RequestInit {
    timeout?: number;
  }

  const fetchFromApi = useCallback(async (endpoint: string, options: FetchOptions = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 5000);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }, []);

  const checkVPNStatus = useCallback(async (ip: string) => {
    try {
      const response = await fetchFromApi(`/api/vpn-status?ip=${encodeURIComponent(ip)}`);
      const data = await response.json();

      const status: VPNStatus = {
        online: data.online,
        ping: data.ping,
        lastOnline: data.lastOnline,
      };

      if (data.online) {
        try {
          const sessionResponse = await fetchFromApi(`/api/vpn-users?ip=${encodeURIComponent(ip)}`);
          const sessionData = await sessionResponse.json();
          status.sessionCount = sessionData.sessionCount;
        } catch (e) {
        }
      }

      setVpnStatuses(prev => ({ ...prev, [ip]: status }));
    } catch (error) {
      setVpnStatuses(prev => ({
        ...prev,
        [ip]: { online: false, ping: 0, lastOnline: '检测失败' }
      }));
    }
  }, [fetchFromApi]);

  const fetchVPNPassword = useCallback(async () => {
    try {
      const response = await fetchFromApi('/api/Vpn-Password');
      const data: VPNPassword = await response.json();

      if (data.password) {
        setPassword(data.password);
      }
      if (data.updatedAt) {
        const date = new Date(data.updatedAt);
        setPasswordTime(date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }));
      }
    } catch (error) {
      setPassword('@(^O^)@/');
      setPasswordTime('2025-10-22 12:00:00');
    }
  }, [fetchFromApi]);

  const fetchAnnouncement = useCallback(async () => {
    try {
      const response = await fetchFromApi('/api/announcement');
      const data: Announcement = await response.json();
      setAnnouncement(data);
    } catch (error) {
      setAnnouncement({ newest: { title: '重要公告', content: ['加载公告失败'] } });
    }
  }, [fetchFromApi]);

  const copyPassword = useCallback(async () => {
    if (password && password !== '加载中...') {
      try {
        await navigator.clipboard.writeText(password);
        alert('密码已复制到剪贴板！');
      } catch (e) {
        alert('复制失败，请手动复制');
      }
    }
  }, [password]);

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchVPNPassword(),
        fetchAnnouncement(),
        ...VPN_IPS.map(ip => checkVPNStatus(ip))
      ]);
      setLoading(false);
    };
    init();
  }, [fetchVPNPassword, fetchAnnouncement, checkVPNStatus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const particleCount = 150;
    const colors = ['#00ff9d', '#00cc7d', '#00aa6a', '#4ECDC4', '#45B7D1'];

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <PageTransition>
      <div
        style={{
          minHeight: '100vh',
          position: 'relative',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(26, 26, 46, 0.9) 100%)',
        }}
      >
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <canvas ref={canvasRef} style={{ background: 'transparent' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <RippleButton
            onClick={() => navigate('/')}
            className="fixed top-5 left-5 z-50"
          >
            返回首页
          </RippleButton>

          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '30px', paddingTop: '80px' }}>
            <motion.header
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ textAlign: 'center', margin: '30px 0', padding: '20px' }}
            >
              <h1
                style={{
                  fontSize: '2em',
                  color: '#00ff9d',
                  marginBottom: '15px',
                  fontWeight: 600,
                  textShadow: '0 0 20px rgba(0, 255, 157, 0.5)',
                }}
              >
                VPN 状态页
              </h1>
            </motion.header>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {[
                '校园VPN的密码以后会定时更新啦！',
                '以前一直不变确实不太好呢',
                '以后更新的VPN密码将会记录在此',
                '如果你发现无法连接VPN，记得回来看看哦。',
              ].map((text, i) => (
                <p
                  key={i}
                  style={{
                    lineHeight: 1.8,
                    marginBottom: '15px',
                    color: '#ccc',
                    fontSize: '1.1em',
                  }}
                >
                  {text}
                  {i === 3 && <em style={{ color: '#888' }}>访问此网站无需VPN</em>}
                </p>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{
                marginBottom: '20px',
                padding: '20px',
                backgroundColor: 'rgba(26, 26, 46, 0.8)',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(0, 255, 157, 0.2)',
              }}
            >
              {announcement?.newest ? (
                <>
                  <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.3em', color: '#00ff9d' }}>
                    {announcement.newest.title}
                  </h3>
                  <hr style={{ border: 'none', borderTop: '1px solid rgba(0, 255, 157, 0.2)', margin: '10px 0' }} />
                  {announcement.newest.content.map((item, i) => (
                    <p key={i} style={{ fontSize: '1em', color: '#ccc' }} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                  {announcement.serverModifiedTime && (
                    <p
                      style={{
                        fontSize: '0.7em',
                        color: '#888',
                        textAlign: 'center',
                        marginTop: '15px',
                        marginBottom: 0,
                      }}
                    >
                      <i>最后更新: {announcement.serverModifiedTime}</i>
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.3em', color: '#00ff9d' }}>重要公告</h3>
                  <p>加载中...</p>
                </>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{
                textAlign: 'center',
                padding: '25px',
                backgroundColor: 'rgba(26, 26, 46, 0.8)',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                margin: '20px 0',
                border: '1px solid rgba(0, 255, 157, 0.2)',
              }}
            >
              <p style={{ marginBottom: '15px', color: '#ccc' }}>
                最新密码发布时间：
                <span
                  style={{
                    fontWeight: 500,
                    color: '#00ff9d',
                    fontSize: '1.1em',
                  }}
                >
                  {passwordTime}
                </span>
              </p>
              <p style={{ marginBottom: '20px', color: '#ccc' }}>
                最新密码：
                <span
                  style={{
                    fontSize: '1.8em',
                    fontWeight: 600,
                    color: '#00ff9d',
                    display: 'inline-block',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: 'rgba(0, 255, 157, 0.1)',
                    boxShadow: '0 0 15px rgba(0, 255, 157, 0.3)',
                    textShadow: '0 0 10px rgba(0, 255, 157, 0.5)',
                  }}
                >
                  {password}
                </span>
              </p>
              <RippleButton onClick={copyPassword}>
                一键复制密码
              </RippleButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              style={{
                marginTop: '30px',
                padding: '20px',
                backgroundColor: 'rgba(26, 26, 46, 0.8)',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(0, 255, 157, 0.2)',
              }}
            >
              <h3
                style={{
                  color: '#00ff9d',
                  marginBottom: '15px',
                  fontSize: '1.3em',
                  paddingBottom: '10px',
                  borderBottom: '2px solid rgba(0, 255, 157, 0.2)',
                }}
              >
                VPN服务器状态
              </h3>
              {VPN_IPS.map((ip) => {
                const status = vpnStatuses[ip];
                return (
                  <div key={ip}>
                    <div
                      style={{
                        margin: '8px 0',
                        padding: '10px',
                        borderRadius: '8px',
                        fontWeight: 500,
                        ...(status?.online
                          ? { backgroundColor: 'rgba(0, 255, 157, 0.15)', color: '#00ff9d' }
                          : status
                          ? { backgroundColor: 'rgba(255, 107, 107, 0.15)', color: '#ff6b6b' }
                          : { backgroundColor: 'rgba(204, 204, 204, 0.1)', color: '#ccc' }),
                      }}
                    >
                      {status?.online ? (
                        <>✅ {ip} 在线 <span style={{ color: '#00ff9d' }}>(延迟: {status.ping}ms)</span></>
                      ) : status ? (
                        <>❌ {ip} 离线 <span style={{ color: '#ff6b6b' }}>(最后在线: {status.lastOnline})</span></>
                      ) : (
                        <>检测中...</>
                      )}
                    </div>
                    {status?.online && status.sessionCount !== undefined && (
                      <div
                        style={{
                          margin: '8px 0',
                          padding: '10px',
                          borderRadius: '8px',
                          fontWeight: 500,
                          backgroundColor: 'rgba(0, 255, 157, 0.15)',
                          color: '#00ff9d',
                        }}
                      >
                        会话数: {status.sessionCount}
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
