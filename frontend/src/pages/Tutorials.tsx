import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { PageTransition } from '../components/layout/PageTransition';
import { RippleButton } from '../components/ui/RippleButton';
import { Card3D } from '../components/ui/Card3D';

interface Tutorial {
  title: string;
  desc: string;
  file: string;
  category: string;
}

const tutorials: Tutorial[] = [
  { title: '删除 PowerShadow', desc: '正确删除 PowerShadow 的方法', file: 'powershadow', category: '工具类' },
  { title: '访问互联网', desc: '在学校访问互联网的教程', file: 'web', category: '网络类' },
  { title: '移动热点上网', desc: '使用移动热点上网的方法', file: 'web2', category: '网络类' },
  { title: '教师目录密码', desc: '教师目录密码登记', file: 'password', category: '网络类' },
  { title: 'WiFi 密码', desc: '教学楼 WiFi 密码登记', file: 'wed3', category: '网络类' },
  { title: 'Minecraft 服务器', desc: '连接 Minecraft 服务器', file: 'minecraft_server', category: '服务器类' },
  { title: 'Windows 时间服务器', desc: 'Windows 时间服务器配置', file: 'Windowstimesserver', category: '服务器类' },
  { title: '文档教程', desc: '文档相关教程', file: 'document', category: '工具类' },
  { title: '网络修复', desc: '网络故障排除', file: 'Networkrepair', category: '网络类' },
];

const categories = ['全部', '网络类', '服务器类', '工具类'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export function Tutorials() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const filteredTutorials = tutorials.filter((tutorial) => {
    const matchesCategory = selectedCategory === '全部' || tutorial.category === selectedCategory;
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        setIsKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, filteredTutorials.length - 1));
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setIsKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const tutorial = filteredTutorials[selectedIndex];
        if (tutorial) {
          navigate(`/tutorial/${tutorial.file}`);
        }
      } else if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        searchInputRef.current?.blur();
        setSelectedIndex(-1);
        setIsKeyboardNav(false);
      }
    },
    [filteredTutorials, selectedIndex, navigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(-1);
    setIsKeyboardNav(false);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    if (isKeyboardNav && selectedIndex >= 0 && cardRefs.current[selectedIndex]) {
      cardRefs.current[selectedIndex]?.focus();
    }
  }, [selectedIndex, isKeyboardNav]);

  return (
    <PageTransition>
      <div
        style={{
          minHeight: '100vh',
          padding: '40px 20px',
          background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95), rgba(26, 26, 46, 0.95))',
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
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: 'Segoe UI, PingFang SC, Hiragino Sans GB, Arial, sans-serif',
            fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
            color: '#00ff9d',
            textAlign: 'center',
            marginBottom: '20px',
            paddingTop: '60px',
            textShadow: '0 0 20px rgba(0, 255, 157, 0.3)',
          }}
        >
          教程目录
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            maxWidth: '800px',
            margin: '0 auto 30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '0 16px',
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <input
              ref={searchInputRef}
              type="text"
              placeholder="搜索教程... (按 / 聚焦)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 20px 14px 48px',
                fontSize: '1rem',
                border: '1px solid rgba(0, 255, 157, 0.3)',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#00ff9d';
                e.target.style.boxShadow = '0 0 20px rgba(0, 255, 157, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 255, 157, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <svg
              style={{
                position: 'absolute',
                left: '16px',
                width: '20px',
                height: '20px',
                stroke: '#00ff9d',
                opacity: 0.6,
              }}
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#00ff9d',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.6,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
              >
                <svg
                  style={{ width: '18px', height: '18px' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center',
            }}
          >
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  border:
                    selectedCategory === category
                      ? '1px solid #00ff9d'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  background:
                    selectedCategory === category
                      ? 'rgba(0, 255, 157, 0.15)'
                      : 'rgba(255, 255, 255, 0.03)',
                  color: selectedCategory === category ? '#00ff9d' : '#ccc',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {filteredTutorials.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#888',
            }}
          >
            <svg
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 20px',
                opacity: 0.4,
              }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00ff9d"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <p style={{ fontSize: '1.1rem' }}>未找到匹配的教程</p>
            <p style={{ fontSize: '0.9rem', marginTop: '8px', opacity: 0.6 }}>
              尝试选择其他分类或修改搜索关键词
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
              gap: '20px',
              padding: '0 16px',
            }}
          >
            {filteredTutorials.map((tutorial, index) => (
              <motion.div
                key={tutorial.title}
                variants={itemVariants}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                tabIndex={-1}
                style={{
                  outline: 'none',
                }}
              >
                <Link
                  to={`/tutorial/${tutorial.file}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Card3D
                    className="w-full h-full cursor-pointer"
                    glowColor={
                      isKeyboardNav && selectedIndex === index
                        ? 'rgba(0, 169, 255, 0.5)'
                        : 'rgba(0, 255, 157, 0.3)'
                    }
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          background:
                            tutorial.category === '网络类'
                              ? 'rgba(0, 255, 157, 0.15)'
                              : tutorial.category === '服务器类'
                              ? 'rgba(0, 169, 255, 0.15)'
                              : 'rgba(255, 200, 0, 0.15)',
                          color:
                            tutorial.category === '网络类'
                              ? '#00ff9d'
                              : tutorial.category === '服务器类'
                              ? '#00a9ff'
                              : '#ffc800',
                          border:
                            tutorial.category === '网络类'
                              ? '1px solid rgba(0, 255, 157, 0.3)'
                              : tutorial.category === '服务器类'
                              ? '1px solid rgba(0, 169, 255, 0.3)'
                              : '1px solid rgba(255, 200, 0, 0.3)',
                        }}
                      >
                        {tutorial.category}
                      </span>
                      {isKeyboardNav && selectedIndex === index && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(0, 169, 255, 0.3)',
                            color: '#00a9ff',
                          }}
                        >
                          已选择
                        </motion.span>
                      )}
                    </div>
                    <h3
                      style={{
                        color: '#00ff9d',
                        marginBottom: '12px',
                        fontSize: '1.2rem',
                        fontWeight: 600,
                      }}
                    >
                      {tutorial.title}
                    </h3>
                    <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {tutorial.desc}
                    </p>
                    <div
                      style={{
                        marginTop: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'rgba(0, 255, 157, 0.5)',
                        fontSize: '0.8rem',
                      }}
                    >
                      <svg
                        style={{ width: '14px', height: '14px' }}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                      点击查看教程
                    </div>
                  </Card3D>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            textAlign: 'center',
            marginTop: '40px',
            padding: '20px',
            color: 'rgba(255, 255, 255, 0.3)',
            fontSize: '0.85rem',
          }}
        >
          <p>使用 J/K 键导航，Enter 进入教程，/ 搜索，Esc 退出</p>
        </motion.div>
      </div>
    </PageTransition>
  );
}
