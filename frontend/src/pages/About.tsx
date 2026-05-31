import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/layout/PageTransition';
import { RippleButton } from '../components/ui/RippleButton';

interface TeamMember {
  name: string;
  role: string;
  description?: string;
  tags?: string[];
  fullDescription?: string[];
  github?: string;
  email?: string;
  blog?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Yuebi',
    role: '主要开发者',
    description: '项目创始人和核心开发者，喜欢听歌、敲代码 awa',
    tags: ['C++', 'Web开发', '区块链', 'AI'],
    fullDescription: [
      '你好呀，我是悦笔',
      '2026届毕业生，学生目录项目创建者之一。我热衷于探索计算机领域的知识，尤其擅长 C++ 和 Web 开发，对 区块链、人工智能 与 计算机网络 也有深入的实践与兴趣。这个网站正是由我独立开发的。',
      '是一个旅行者、开拓者、探索者、绳匠',
      '开发过各类软件项目，欢迎访问我的 GitHub 主页来看看呀。如需交流，欢迎加我 QQ（邮件回复可能稍慢，但我会及时查看哦）',
    ],
    github: 'https://github.com/yuebittt',
    email: 'yuebity@outlook.com',
    blog: 'https://yuebittt.github.io',
  },
  {
    name: 'Strohmeier',
    role: '开发者',
    description: '团队中的开发者，为项目的发展做出了贡献',
    fullDescription: [
      'Strohmeier 是团队中的开发者，虽然信息较少，但他为项目的发展做出了贡献。',
    ],
  },
  {
    name: 'Leo',
    role: '开发者',
    description: '负责服务器维护工作，现已转学，一个爱飞无人机的男孩',
    fullDescription: [
      'Leo 负责服务器维护工作，是团队中的技术支持专家。他对服务器配置和网络安全有深入的了解，确保网站的稳定运行。虽然他已经转学，但他的贡献仍然对项目产生着积极的影响。',
      '除了技术工作，Leo 还喜欢无人机飞行，是一个热爱科技和户外活动的男孩。',
    ],
    github: 'https://github.com/liyang090811',
    email: 'wxliloveyou@outlook.com',
  },
  {
    name: '辰艾',
    role: '开发者',
    description: '现任负责维护服务器的学牲，平时喜欢玩第五人格',
    tags: ['服务器维护'],
    fullDescription: [
      '辰艾是现任负责维护服务器的开发者，虽然他自称是"学牲"，但他对技术工作充满热情。他负责网站的日常维护和更新，确保网站能够正常运行。',
      '平日喜欢玩玩屁股肉、第五人格（）。',
    ],
    github: 'https://github.com/zmmmawzfl',
    email: 'hekaiyu2009@outlook.com',
  },
];

export function About() {
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
    document.body.style.overflow = '';
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedMember) {
        handleCloseModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMember]);

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
          关于
        </motion.h1>

        <div
          style={{
            maxWidth: '1200px',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginBottom: 'auto',
            marginTop: '0',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              marginBottom: '40px',
            }}
          >
            <h2
              style={{
                color: '#00ff9d',
                fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
                marginBottom: '10px',
                textAlign: 'center',
              }}
            >
              团队成员
            </h2>
            <p
              style={{
                color: '#888',
                fontSize: '0.95rem',
                marginBottom: '30px',
                textAlign: 'center',
              }}
            >
              点击成员卡片查看更多信息
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '24px',
                maxWidth: '1100px',
                margin: '0 auto',
              }}
            >
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(0, 255, 157, 0.3)',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  whileHover={{
                    borderColor: 'rgba(0, 255, 157, 0.6)',
                    boxShadow: '0 8px 30px rgba(0, 255, 157, 0.15)',
                  }}
                  onClick={() => handleMemberClick(member)}
                >
                  <div
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00ff9d 0%, #00a9ff 100%)',
                      margin: '0 auto 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem',
                      fontWeight: 'bold',
                      color: '#1a1a2e',
                      boxShadow: '0 4px 20px rgba(0, 255, 157, 0.3)',
                    }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <h3
                    style={{
                      color: '#fff',
                      fontSize: '1.2rem',
                      marginBottom: '8px',
                      fontWeight: '600',
                    }}
                  >
                    {member.name}
                  </h3>
                  <p
                    style={{
                      color: '#00ff9d',
                      fontSize: '0.85rem',
                      marginBottom: member.description ? '12px' : '0',
                      fontWeight: '500',
                    }}
                  >
                    {member.role}
                  </p>
                  {member.description && (
                    <p
                      style={{
                        color: '#888',
                        fontSize: '0.8rem',
                        lineHeight: '1.5',
                        marginBottom: member.tags ? '12px' : '0',
                      }}
                    >
                      {member.description}
                    </p>
                  )}
                  {member.tags && member.tags.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        justifyContent: 'center',
                        marginTop: '12px',
                      }}
                    >
                      {member.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            background: 'rgba(0, 255, 157, 0.1)',
                            color: '#00ff9d',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            fontWeight: '500',
                            border: '1px solid rgba(0, 255, 157, 0.3)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(0, 255, 157, 0.3)',
              borderRadius: '12px',
              padding: 'clamp(16px, 5vw, 40px)',
            }}
          >
            <div
              style={{
                borderLeft: '4px solid #00ff9d',
                paddingLeft: '20px',
                marginBottom: '30px',
              }}
            >
              <h2 style={{ color: '#00ff9d', marginBottom: '10px' }}>
                学生目录计划 第二版
              </h2>
              <p style={{ color: '#888', fontSize: '0.9rem', fontStyle: 'italic' }}>
                yuebi 于 2025.07.26
              </p>
            </div>

            <p style={{ color: '#ccc', lineHeight: '1.8', marginBottom: '30px' }}>
              在过去的两个学期中，学生目录团队已经完成了网站的搭建、服务器的部署、网站的优化等工作。新成员 Leo
              加入了我们的团队，并于即将到来的下一学期负责服务器的维护。
            </p>

            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#00ff9d', marginBottom: '20px', fontSize: '1.3rem' }}>
                总结
              </h3>
              <p style={{ color: '#ccc', marginBottom: '20px' }}>
                目前学生目录的功能众多，总结如下
              </p>

              <div style={{ marginBottom: '25px' }}>
                <h4
                  style={{
                    color: '#fff',
                    marginBottom: '15px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                  }}
                >
                  校内服务
                </h4>
                <p
                  style={{
                    color: '#888',
                    fontSize: '0.85rem',
                    fontStyle: 'italic',
                    marginBottom: '10px',
                  }}
                >
                  校内服务指的是在学校内网中的服务资源，无需连接互联网也可使用
                </p>
                <ul style={{ color: '#ccc', lineHeight: '2', paddingLeft: '20px' }}>
                  <li>校园网络 VPN 接入服务</li>
                  <li>VPN 状态查询</li>
                  <li>共享目录</li>
                  <li>技术教程</li>
                  <li>时钟（这个也算嘛ww）</li>
                  <li>留言簿</li>
                  <li>我的世界服务器</li>
                  <li>qbtrotten</li>
                </ul>
              </div>

              <div>
                <h4
                  style={{
                    color: '#fff',
                    marginBottom: '15px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                  }}
                >
                  校外服务
                </h4>
                <p
                  style={{
                    color: '#888',
                    fontSize: '0.85rem',
                    fontStyle: 'italic',
                    marginBottom: '10px',
                  }}
                >
                  校外服务指的是在公网上的资源，连接互联网后即可使用
                  <br />
                  带星号的服务表示需使用 Radmin 远程连至服务器后才可用的服务
                </p>
                <ul style={{ color: '#ccc', lineHeight: '2', paddingLeft: '20px' }}>
                  <li>学生目录日志（包含每月发布的月度报告）</li>
                  <li>VPN 日志分析</li>
                  <li>我的世界服务器*</li>
                  <li>共享目录*</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 style={{ color: '#00ff9d', marginBottom: '20px', fontSize: '1.3rem' }}>
                未来规划
              </h3>
              <p style={{ color: '#ccc', lineHeight: '1.8', marginBottom: '15px' }}>
                项目成立之初的设想大多已经实现，甚至在某些方面超出了预期，并且获得了广泛的支持和应用，但由于学生目录主要存在于校园内部，因此其稳定性与隐蔽性将是今后工作的重中之重。
              </p>
              <p style={{ color: '#ccc', lineHeight: '1.8', marginBottom: '15px' }}>
                在学校中使用资源时，如果违规操作，可能会面临各种风险，因此需要做好充分的准备。校园 VPN
                是学生目录最重要的服务之一，同时也面临最大的风险。因此，团队的主要任务将是围绕 VPN
                服务，确保服务器正常运行，及时发现并解决问题。
              </p>
              <p style={{ color: '#ccc', lineHeight: '1.8', marginBottom: '15px' }}>
                鉴于之前更换教师目录密码时遇到的问题，我们需要尽可能多地获取教师目录的密码，以备不时之需。awa
              </p>
              <p style={{ color: '#ccc', lineHeight: '1.8', marginBottom: '15px' }}>
                服务器的数据库需要重建。尽管留言簿目前功能正常，但无法进行有效的管理，因此重建数据库的工作应尽快提上日程。由于使用了
                API，原本的会话数获取功能被废弃，导致便捷的状态指示灯功能失效。因此，我们需要开发一个通过 API
                调用实现状态指示灯功能的解决方案。此外，网站的动画效果还有待改进，特别是对手机端的优化仍需进一步完善。
              </p>
              <p style={{ color: '#ccc', lineHeight: '1.8' }}>
                继续完善网站功能与细节，维护网站稳定性，就是之后学生目录的主要任务。
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              zIndex: 1000,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px',
              backdropFilter: 'blur(10px)',
            }}
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                background: 'rgba(26, 26, 46, 0.98)',
                border: '3px solid #00ff9d',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '85vh',
                overflowY: 'auto',
                padding: 'clamp(24px, 5vw, 40px)',
                position: 'relative',
                boxShadow: '0 20px 40px rgba(0, 255, 157, 0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCloseModal}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: '#00ff9d',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 255, 157, 0.1)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                &times;
              </button>

              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00ff9d 0%, #00a9ff 100%)',
                    marginRight: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#1a1a2e',
                    boxShadow: '0 4px 20px rgba(0, 255, 157, 0.3)',
                    flexShrink: 0,
                  }}
                >
                  {selectedMember.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h2
                    style={{
                      color: '#00ff9d',
                      fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                      marginBottom: '8px',
                      fontWeight: 'bold',
                    }}
                  >
                    {selectedMember.name}
                  </h2>
                  <p
                    style={{
                      color: '#aaa',
                      fontSize: '1.2rem',
                      fontStyle: 'italic',
                    }}
                  >
                    {selectedMember.role}
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                {selectedMember.fullDescription?.map((paragraph, index) => (
                  <p
                    key={index}
                    style={{
                      color: '#ddd',
                      fontSize: '1.05rem',
                      lineHeight: '1.7',
                      marginBottom: '16px',
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {(selectedMember.github || selectedMember.email || selectedMember.blog) && (
                <div
                  style={{
                    marginTop: '30px',
                    paddingTop: '20px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <h3
                    style={{
                      color: '#00ff9d',
                      marginBottom: '15px',
                      fontSize: '1.2rem',
                    }}
                  >
                    联系方式
                  </h3>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {selectedMember.github && (
                      <a
                        href={selectedMember.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#00ff9d',
                          transition: 'all 0.3s ease',
                          display: 'inline-block',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.2)';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.color = '#00ff9d';
                        }}
                        title="GitHub"
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                    )}
                    {selectedMember.email && (
                      <a
                        href={`mailto:${selectedMember.email}`}
                        style={{
                          color: '#00ff9d',
                          transition: 'all 0.3s ease',
                          display: 'inline-block',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.2)';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.color = '#00ff9d';
                        }}
                        title="邮件"
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </a>
                    )}
                    {selectedMember.blog && (
                      <a
                        href={selectedMember.blog}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#00ff9d',
                          transition: 'all 0.3s ease',
                          display: 'inline-block',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.2)';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.color = '#00ff9d';
                        }}
                        title="博客"
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 5.155 11.329 11.243h4.817c-.455-8.518-7.922-15.638-16.146-16.054z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 640px) {
          .member-card {
            padding: 20px !important;
          }
        }
      `}</style>
    </PageTransition>
  );
}
