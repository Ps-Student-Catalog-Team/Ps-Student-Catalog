import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/layout/PageTransition';
import { RippleButton } from '../components/ui/RippleButton';

function getNextGaokaoDate() {
  const now = new Date();
  const year = now.getFullYear();
  // 高考通常在 6 月 7 日
  const gaokao = new Date(year, 5, 7); // 月份从 0 开始，5 = 6 月
  if (gaokao < now) {
    gaokao.setFullYear(year + 1);
  }
  return gaokao;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [gaokaoDate] = useState<Date>(getNextGaokaoDate);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = gaokaoDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gaokaoDate]);

  const totalDays = Math.ceil((gaokaoDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const progress = Math.max(0, 100 - (totalDays / 365) * 100);

  return (
    <PageTransition>
      <div
        style={{
          minHeight: '100vh',
          padding: '40px 20px',
          background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 背景粒子效果 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 157, 0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <RippleButton
          onClick={() => window.history.back()}
          className="fixed top-5 left-5 z-50"
        >
          返回
        </RippleButton>

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', zIndex: 1 }}
        >
          <h1
            style={{
              fontFamily: 'Segoe UI, PingFang SC, Hiragino Sans GB, Arial, sans-serif',
              fontSize: 'clamp(2rem, 8vw, 4rem)',
              color: '#00ff9d',
              marginBottom: '10px',
              fontWeight: 800,
              textShadow: '0 0 30px rgba(0, 255, 157, 0.3)',
            }}
          >
            高考倒计时
          </h1>
          <p
            style={{
              color: '#888',
              fontSize: '1rem',
              marginBottom: '50px',
            }}
          >
            以当届高三生为准 · 目标日期：{gaokaoDate.getFullYear()}年6月7日
          </p>
        </motion.div>

        {/* 倒计时数字 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '50px',
            zIndex: 1,
          }}
        >
          {[
            { label: '天', value: timeLeft.days },
            { label: '时', value: timeLeft.hours },
            { label: '分', value: timeLeft.minutes },
            { label: '秒', value: timeLeft.seconds },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              style={{
                background: 'rgba(0, 255, 157, 0.05)',
                border: '1px solid rgba(0, 255, 157, 0.2)',
                borderRadius: '16px',
                padding: '30px 20px',
                minWidth: '120px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div
                style={{
                  fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                  fontWeight: 800,
                  color: '#00ff9d',
                  fontFamily: 'monospace',
                  textShadow: '0 0 20px rgba(0, 255, 157, 0.4)',
                }}
              >
                {String(item.value).padStart(2, '0')}
              </div>
              <div
                style={{
                  color: '#666',
                  fontSize: '0.9rem',
                  marginTop: '8px',
                  letterSpacing: '2px',
                }}
              >
                {item.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 进度条 */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: '100%' }}
          transition={{ duration: 1, delay: 0.8 }}
          style={{
            maxWidth: '500px',
            width: '100%',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1.5, delay: 1 }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #00ff9d, #00cc7a)',
                borderRadius: '2px',
              }}
            />
          </div>
          <p
            style={{
              color: '#555',
              fontSize: '0.8rem',
              textAlign: 'center',
              marginTop: '12px',
            }}
          >
            距离高考还有 {totalDays} 天
          </p>
        </motion.div>

        {/* 鼓励语 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{
            color: '#444',
            fontSize: '0.9rem',
            marginTop: '40px',
            fontStyle: 'italic',
            zIndex: 1,
          }}
        >
          「乾坤未定，你我皆是黑马。」
        </motion.p>
      </div>
    </PageTransition>
  );
}
