import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/layout/PageTransition';
import { RippleButton } from '../components/ui/RippleButton';
import { Card3D } from '../components/ui/Card3D';

export function Tools() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div
        style={{
          minHeight: '100vh',
          padding: '40px 20px',
          background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(26, 26, 46, 0.9) 100%)',
        }}
      >
        <RippleButton
          onClick={() => navigate('/')}
          className="fixed top-5 left-5 z-50"
        >
          返回首页
        </RippleButton>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: 'Segoe UI, PingFang SC, Hiragino Sans GB, Arial, sans-serif',
            fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
            color: '#00ff9d',
            textAlign: 'center',
            marginBottom: '30px',
            paddingTop: '60px',
          }}
        >
          工具选择
        </motion.h1>

        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
            gap: '16px',
            padding: '0 16px',
          }}
        >
          {[
              { title: 'VPN 状态页', desc: '查看 VPN 密码和服务器状态', link: '/newest', isReact: true },
              { title: '时钟', desc: '展示当前的时间', link: '/pages/clock.html' },
              { title: '特殊的时钟', desc: '展示当前时间，引言变得有些奇怪', link: '/pages/clock2.html' },
              { title: '留言簿', desc: '一个简单的留言簿', link: '/pages/comment.html' },
              { title: '学生目录日志', desc: '查看每月月度报告', link: 'https://psstunet.github.io/' },
              { title: '用户中心', desc: '查看您发送的留言', link: '/pages/user-center.html' },
              { title: 'Countdown', desc: '高考倒计时', link: '/countdown', isReact: true },
            ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card3D
                    className="w-full h-full cursor-pointer"
                    onClick={() => {
                      if (item.link.startsWith('http')) {
                        window.open(item.link, '_blank');
                      } else if ((item as any).isReact) {
                        navigate(item.link);
                      } else {
                        window.location.href = item.link;
                      }
                    }}
                  >
                <h3
                  style={{
                    color: '#00ff9d',
                    marginBottom: '12px',
                    fontSize: '1.2rem',
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ color: '#ccc', fontSize: '0.9rem' }}>{item.desc}</p>
              </Card3D>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
