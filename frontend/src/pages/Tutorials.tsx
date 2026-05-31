import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { PageTransition } from '../components/layout/PageTransition';
import { RippleButton } from '../components/ui/RippleButton';
import { Card3D } from '../components/ui/Card3D';

export function Tutorials() {
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
          教程目录
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
            { title: '删除 PowerShadow', desc: '正确删除 PowerShadow 的方法', file: 'powershadow' },
            { title: '访问互联网', desc: '在学校访问互联网的教程', file: 'web' },
            { title: '移动热点上网', desc: '使用移动热点上网的方法', file: 'web2' },
            { title: '教师目录密码', desc: '教师目录密码登记', file: 'password' },
            { title: 'WiFi 密码', desc: '教学楼 WiFi 密码登记', file: 'wed3' },
            { title: 'Minecraft 服务器', desc: '连接 Minecraft 服务器', file: 'minecraft_server' },
            { title: 'Windows 时间服务器', desc: 'Windows 时间服务器配置', file: 'Windowstimesserver' },
            { title: '文档教程', desc: '文档相关教程', file: 'document' },
            { title: '网络修复', desc: '网络故障排除', file: 'Networkrepair' },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/tutorial/${item.file}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Card3D className="w-full h-full cursor-pointer">
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
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
