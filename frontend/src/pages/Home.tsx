import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/layout/PageTransition';
import { Typewriter } from '../components/animations/Typewriter';
import { RippleButton } from '../components/ui/RippleButton';

export function Home() {
  const navigate = useNavigate();

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
          欢迎来到学生目录 2.0！
        </motion.p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', padding: '0 16px' }}>
          {[
            { text: '教程', path: '/tutorials' },
            { text: '工具', path: '/tools' },
            { text: 'VPN状态', path: '/newest' },
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
