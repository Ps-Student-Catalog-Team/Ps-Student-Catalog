import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { marked, Renderer } from 'marked';
import { PageTransition } from '../components/layout/PageTransition';
import { RippleButton } from '../components/ui/RippleButton';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TutorialCache {
  content: string;
  headings: Heading[];
  pageTitle: string;
}

const tutorialCache = new Map<string, TutorialCache>();

export default function TutorialDetail() {
  const { file } = useParams<{ file: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeHeading, setActiveHeading] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [animateOnLoad, setAnimateOnLoad] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const prevFileRef = useRef<string | null>(null);

  const sanitizeFileName = useCallback((fileName: string) => {
    const sanitized = fileName
      .replace(/\\/g, '/')
      .split('/').pop()?.split('?')[0]?.split('#')[0] || fileName;
    const clean = sanitized.replace(/[^A-Za-z0-9_.-]/g, '');
    return clean.toLowerCase().endsWith('.md') ? clean : `${clean}.md`;
  }, []);

  useEffect(() => {
    const fetchMarkdown = async () => {
      if (!file) {
        setError('未指定教程文件');
        setLoading(false);
        return;
      }

      const fileName = sanitizeFileName(file);
      
      if (tutorialCache.has(fileName)) {
        const cached = tutorialCache.get(fileName)!;
        setContent(cached.content);
        setHeadings(cached.headings);
        setPageTitle(cached.pageTitle);
        document.title = cached.pageTitle;
        setLoading(false);
        setAnimateOnLoad(false);
        setTimeout(() => {
          setIsContentVisible(true);
        }, 50);
        prevFileRef.current = file;
        return;
      }

      try {
        const response = await fetch(`/tutorial/${fileName}`);
        
        if (!response.ok) {
          throw new Error('文件不存在');
        }

        const markdownContent = await response.text();
        
        const headingRegex = /^(#{1,6})\s+(.+)$/gm;
        const extractedHeadings: Heading[] = [];
        let match;
        let index = 0;
        
        while ((match = headingRegex.exec(markdownContent)) !== null) {
          const level = match[1].length;
          const text = match[2].trim();
          const id = `heading-${index}`;
          
          extractedHeadings.push({ id, text, level });
          index++;
        }
        
        const renderer = new Renderer();
        let headingIndex = 0;
        
        renderer.heading = function({ text, depth }) {
          const headingText = typeof text === 'string' ? text : '';
          const id = `heading-${headingIndex}`;
          headingIndex++;
          return `<h${depth} id="${id}">${headingText}</h${depth}>`;
        };
        
        marked.use({
          gfm: true,
          breaks: true,
          renderer
        });
        
        const htmlContent = await marked(markdownContent) as string;
        
        const titleMatch = markdownContent.match(/^#\s*(.*)$/m);
        const pageTitleValue = titleMatch ? titleMatch[1] : '';
        
        tutorialCache.set(fileName, {
          content: htmlContent,
          headings: extractedHeadings,
          pageTitle: pageTitleValue
        });
        
        setContent(htmlContent);
        setHeadings(extractedHeadings);
        setPageTitle(pageTitleValue);
        document.title = pageTitleValue;
        setAnimateOnLoad(true);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
        prevFileRef.current = file;
      }
    };

    if (file !== prevFileRef.current) {
      setLoading(true);
      setIsContentVisible(false);
      fetchMarkdown();
    }
  }, [file, sanitizeFileName]);

  useEffect(() => {
    if (!content || !contentRef.current) return;

    const timer = setTimeout(() => {
      if (!contentRef.current) return;

      const headingElements = contentRef.current.querySelectorAll('h1, h2, h3');
      if (headingElements.length === 0) return;

      // 当没有其他可见标题时，默认选中第一个
      if (headings.length > 0 && !activeHeading) {
        setActiveHeading(headings[0].id);
      }
      
      const observer = new IntersectionObserver(
        (entries) => {
          const visibleEntries = entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => {
              // 优先选择更靠近视口顶部的标题
              return a.boundingClientRect.top - b.boundingClientRect.top;
            });

          if (visibleEntries.length > 0) {
            setActiveHeading(visibleEntries[0].target.id);
          }
        },
        { 
          rootMargin: '-100px 0px -70% 0px', 
          threshold: [0, 0.1, 0.2, 0.3] 
        }
      );

      headingElements.forEach((heading) => observer.observe(heading));

      const handleScroll = () => {
        if (!contentRef.current) return;
        
        const headingsInDoc = contentRef.current.querySelectorAll('h1, h2, h3');
        let currentHeading: Element | null = null;
        let minDistance = Infinity;
        
        headingsInDoc.forEach((heading) => {
          const rect = heading.getBoundingClientRect();
          const distance = Math.abs(rect.top - 120);
          
          if (distance < minDistance && rect.top < window.innerHeight / 2) {
            minDistance = distance;
            currentHeading = heading;
          }
        });
        
        if (currentHeading && 'id' in currentHeading) {
          setActiveHeading((currentHeading as HTMLElement).id);
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        observer.disconnect();
        window.removeEventListener('scroll', handleScroll);
      };
    }, 200);

    return () => clearTimeout(timer);
  }, [content, headings, activeHeading]);

  useEffect(() => {
    if (!contentRef.current) return;

    const codeBlocks = contentRef.current.querySelectorAll('pre');
    codeBlocks.forEach((pre) => {
      let wrapper = pre.closest('.code-block-wrapper');
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        pre.parentNode?.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
      }

      if (wrapper.querySelector('.copy-code-button')) return;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-code-button';
      button.textContent = '复制';

      button.addEventListener('click', async () => {
        const codeElement = wrapper.querySelector('code');
        if (!codeElement) return;

        const codeText = codeElement.textContent?.trim() || '';
        if (!codeText) {
          button.textContent = '复制失败';
          setTimeout(() => { button.textContent = '复制'; }, 2000);
          return;
        }

        try {
          await navigator.clipboard.writeText(codeText);
          button.textContent = '已复制!';
          button.classList.add('copied');
        } catch {
          button.textContent = '复制失败';
          button.classList.add('copy-failed');
        }

        setTimeout(() => {
          button.textContent = '复制';
          button.classList.remove('copied', 'copy-failed');
        }, 2000);
      });

      wrapper.appendChild(button);
    });
  }, [content]);

  useEffect(() => {
    if (!contentRef.current) return;

    const images = contentRef.current.querySelectorAll('img');
    images.forEach((img) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        setSelectedImage(img.src);
        document.body.style.overflow = 'hidden';
      });
    });
  }, [content]);

  const handleImageOverlayClick = () => {
    setSelectedImage(null);
    document.body.style.overflow = '';
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        handleImageOverlayClick();
      }
      if (e.key === 'ArrowUp' || e.key === 'k') {
        window.scrollBy({ top: -100, behavior: 'smooth' });
      }
      if (e.key === 'ArrowDown' || e.key === 'j') {
        window.scrollBy({ top: 100, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
      setShowBackToTop(scrollTop > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (content && !loading) {
      const timer = setTimeout(() => setIsContentVisible(true), 100);
      // 在入场动画完成后移除 animate 类，防止滚动时重新触发动画
      const animationEndTimer = setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.classList.remove('animate');
        }
      }, 700);
      return () => {
        clearTimeout(timer);
        clearTimeout(animationEndTimer);
      };
    }
  }, [content, loading]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      setActiveHeading(id);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="loading-container">
          <div className="loading">加载中...</div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="error-container">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="error"
          >
            <h2>错误</h2>
            <p>{error}</p>
            <RippleButton onClick={() => navigate('/tutorials')}>
              返回教程列表
            </RippleButton>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="tutorial-page">
        <div className="reading-progress-bar" style={{ width: `${scrollProgress}%` }} />

        <div className="fixed-buttons">
          <RippleButton onClick={() => navigate('/')} color="#00ff9d">
            返回首页
          </RippleButton>
          <RippleButton onClick={() => navigate('/tutorials')} color="#00ff9d">
            返回教程列表
          </RippleButton>
        </div>

        <div className="page-layout">
          <div className="content-wrapper">
            {pageTitle && (
              <motion.h1
                className="tutorial-title"
                initial={animateOnLoad ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {pageTitle}
              </motion.h1>
            )}
            <motion.div
              ref={contentRef}
              className={`markdown-container ${isContentVisible ? 'visible' : ''} ${animateOnLoad ? 'animate' : ''}`}
              initial={animateOnLoad ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: animateOnLoad ? 0.6 : 0 }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>

          {headings.length > 0 && (
            <aside className="toc-sidebar">
              <div className="toc-header">
                <div className="toc-title">目录</div>
                <div className="toc-progress">
                  进度 {scrollProgress.toFixed(0)}%
                </div>
              </div>
              <div className="toc-list">
                {headings.map((heading) => (
                  <div
                    key={heading.id}
                    onClick={() => scrollToHeading(heading.id)}
                    className={`toc-item toc-h${heading.level} ${activeHeading === heading.id ? 'active' : ''}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        scrollToHeading(heading.id);
                      }
                    }}
                  >
                    <div className="toc-indicator" />
                    <span className="toc-text">{heading.text}</span>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>

        {showBackToTop && (
          <motion.button
            className="back-to-top-button"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            ↑
          </motion.button>
        )}

        {selectedImage && (
          <motion.div
            className="img-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleImageOverlayClick}
          >
            <motion.img
              src={selectedImage}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ cursor: 'zoom-out' }}
            />
          </motion.div>
        )}
      </div>

      <style>{`
        .tutorial-page {
          min-height: 100vh;
          background: linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%);
          padding-bottom: 40px;
          position: relative;
        }

        .reading-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, #00ff9d, #00a9ff);
          z-index: 1001;
          transition: width 0.1s ease-out;
          box-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
        }

        .back-to-top-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00ff9d, #00a9ff);
          color: #082b57;
          border: none;
          cursor: pointer;
          font-size: 1.5rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0, 255, 157, 0.3);
          z-index: 999;
          transition: all 0.3s ease;
        }

        .back-to-top-button:hover {
          box-shadow: 0 6px 20px rgba(0, 255, 157, 0.5);
        }

        .fixed-buttons {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          display: flex;
          justify-content: center;
          padding: 12px 20px;
          background: rgba(42, 42, 42, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0, 255, 157, 0.2);
          box-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
          gap: 15px;
        }

        .fixed-buttons button {
          padding: 8px 18px !important;
          font-size: 0.85rem !important;
        }

        .page-layout {
          display: flex;
          max-width: 1400px;
          margin: 0 auto;
          padding: 80px 30px 30px;
          gap: 60px;
          width: 100%;
          justify-content: center;
        }

        .content-wrapper {
          flex: 0 1 auto;
          width: 100%;
          max-width: 850px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .toc-sidebar {
          width: 250px;
          flex-shrink: 0;
          position: sticky;
          top: 80px;
          height: fit-content;
          max-height: calc(100vh - 100px);
          overflow-y: auto;
          overflow-x: hidden;
          background: rgba(20, 20, 30, 0.8);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 0;
          border: 1px solid rgba(0, 255, 157, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .toc-sidebar::-webkit-scrollbar {
          width: 4px;
        }

        .toc-sidebar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 2px;
        }

        .toc-sidebar::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 157, 0.3);
          border-radius: 2px;
        }

        .toc-header {
          padding: 20px 24px 12px;
          border-bottom: 1px solid rgba(0, 255, 157, 0.1);
          position: sticky;
          top: 0;
          background: rgba(20, 20, 30, 0.95);
          backdrop-filter: blur(12px);
          z-index: 1;
        }

        .toc-title {
          font-size: 0.95em;
          font-weight: 700;
          color: #00ff9d;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .toc-title::before {
          content: '📑';
          font-size: 1em;
        }

        .toc-progress {
          font-size: 0.75em;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 500;
        }

        .toc-list {
          list-style: none;
          padding: 12px 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .toc-item {
          padding: 8px 24px;
          color: rgba(200, 200, 200, 0.7);
          text-decoration: none;
          transition: all 0.2s ease;
          font-size: 0.85em;
          line-height: 1.5;
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          position: relative;
        }

        .toc-item:hover {
          background: rgba(0, 255, 157, 0.06);
          color: #00ff9d;
        }

        .toc-item.active {
          background: rgba(0, 255, 157, 0.1);
          color: #00ff9d;
          font-weight: 600;
        }

        .toc-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #00ff9d, #00a9ff);
        }

        .toc-indicator {
          flex-shrink: 0;
          width: 6px;
          height: 6px;
          margin-top: 7px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transition: all 0.2s ease;
        }

        .toc-item.active .toc-indicator {
          background: #00ff9d;
          box-shadow: 0 0 8px rgba(0, 255, 157, 0.4);
          transform: scale(1.2);
        }

        .toc-text {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .toc-h1 {
          font-weight: 600;
        }

        .toc-h2 {
          padding-left: 40px;
        }

        .toc-h2 .toc-indicator {
          width: 4px;
          height: 4px;
          margin-top: 8px;
        }

        .toc-h3 {
          padding-left: 56px;
          font-size: 0.8em;
          color: rgba(180, 180, 180, 0.6);
        }

        .toc-h3 .toc-indicator {
          width: 3px;
          height: 3px;
          margin-top: 9px;
        }

        .tutorial-title {
          font-size: 2em;
          color: #00ff9d;
          margin-bottom: 0;
          padding: 24px 32px;
          background: rgba(20, 20, 30, 0.7);
          border-radius: 16px;
          border: 1px solid rgba(0, 255, 157, 0.15);
          box-shadow: 0 8px 32px rgba(0, 255, 157, 0.08);
        }

        .markdown-container {
          flex: 1;
          max-width: none;
          margin: 0;
          padding: 32px;
          overflow-x: hidden;
          word-wrap: break-word;
          background: rgba(20, 20, 30, 0.7);
          border-radius: 16px;
          border: 1px solid rgba(0, 255, 157, 0.1);
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .markdown-container.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .markdown-container h1,
        .markdown-container h2,
        .markdown-container h3 {
          scroll-margin-top: 100px;
          color: #00ff9d;
          margin-top: 1.8rem;
          margin-bottom: 1rem;
          font-weight: bold;
        }

        .markdown-container h2 {
          font-size: 1.5em;
        }

        .markdown-container h3 {
          font-size: 1.3em;
        }

        .markdown-container h4,
        .markdown-container h5,
        .markdown-container h6 {
          color: #00ff9d;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          font-weight: bold;
        }

        .markdown-container p,
        .markdown-container li {
          line-height: 1.8;
          font-size: 1em;
          color: #ccc;
          margin-bottom: 1.2rem;
        }

        .markdown-container.animate h1,
        .markdown-container.animate h2,
        .markdown-container.animate h3 {
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }

        .markdown-container.animate h2 {
          animation-delay: 0.2s;
        }

        .markdown-container.animate h3 {
          animation-delay: 0.3s;
        }

        .markdown-container.animate h4,
        .markdown-container.animate h5,
        .markdown-container.animate h6 {
          animation: fadeInUp 0.5s ease forwards;
          animation-delay: 0.4s;
          opacity: 0;
        }

        .markdown-container.animate p,
        .markdown-container.animate li {
          animation: fadeInUp 0.5s ease forwards;
          animation-delay: 0.5s;
          opacity: 0;
        }

        .markdown-container a {
          color: #00bd49;
          text-decoration: none;
          padding: 5px 0;
          position: relative;
          transition: all 0.3s ease;
        }

        .markdown-container a::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: 0;
          left: 50%;
          background: currentColor;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .markdown-container a:hover {
          color: #00ff9d;
          transform: translateY(-2px);
        }

        .markdown-container a:hover::after {
          width: 100%;
          left: 0;
        }

        .markdown-container img {
          max-width: 85%;
          height: auto;
          margin: 2rem auto;
          display: block;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 255, 157, 0.15);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .markdown-container img:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 30px rgba(0, 255, 157, 0.25);
        }

        .markdown-container blockquote {
          border-left: 4px solid #00ff9d;
          padding-left: 15px;
          margin: 1.5rem 0;
          color: #aaa;
          font-size: 1em;
          background: rgba(0, 255, 157, 0.05);
          padding: 16px 20px 16px 24px;
          border-radius: 0 10px 10px 0;
        }

        .markdown-container code {
          background: rgba(0, 255, 157, 0.12);
          padding: 3px 8px;
          border-radius: 6px;
          color: #00ff9d;
          font-family: 'Fira Code', 'Consolas', monospace;
          font-size: 0.9em;
        }

        .code-block-wrapper {
          position: relative;
          margin: 1.4em 0;
          padding: 3.2em 1.2em 1.2em 1.2em;
          background: linear-gradient(135deg, rgba(20, 26, 44, 0.95), rgba(40, 47, 76, 0.95));
          color: #e8f8ff;
          border: 1px solid rgba(120, 150, 210, 0.3);
          box-shadow: 0 8px 30px rgba(8, 14, 35, 0.35);
          border-radius: 14px;
          overflow: auto;
        }

        .code-block-wrapper::before {
          content: attr(data-language);
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 0.5em 1.2em;
          background: linear-gradient(135deg, rgba(30, 40, 60, 0.95), rgba(50, 60, 90, 0.95));
          color: #00ff9d;
          font-size: 0.8em;
          font-weight: 700;
          border-bottom: 1px solid rgba(120, 150, 210, 0.3);
          border-radius: 14px 14px 0 0;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .code-block-wrapper code {
          background: transparent;
          padding: 0;
          color: #f1f8ff;
          font-size: 0.88em;
          line-height: 1.7;
        }

        .copy-code-button {
          position: absolute;
          top: 0.65em;
          right: 0.65em;
          padding: 0.45em 1em;
          background: linear-gradient(120deg, #00a9ff, #00e6ac);
          color: #082b57;
          border: 1px solid #0b78bd;
          border-radius: 999px;
          cursor: pointer;
          font-size: 0.8em;
          font-weight: 600;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          z-index: 10;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.3em;
          user-select: none;
          box-shadow: 0 4px 14px rgba(2, 108, 166, 0.24);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .copy-code-button::before {
          content: '📋';
          display: inline-block;
          transform: translateY(1px);
        }

        .copy-code-button:hover {
          background: linear-gradient(120deg, #00c8ff, #5dffb9);
          border-color: #0f95e4;
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 6px 18px rgba(0, 130, 214, 0.32);
        }

        .copy-code-button:active {
          background: linear-gradient(120deg, #009be0, #00d18f);
          transform: translateY(0) scale(0.99);
        }

        .copy-code-button.copied {
          background: linear-gradient(120deg, #6ae47c, #09c874);
          border-color: #3ebf55;
          color: #0b4020;
        }

        .copy-code-button.copy-failed {
          background: linear-gradient(120deg, #ff7f7f, #ff4f4f);
          border-color: #d64040;
          color: #611a1a;
        }

        .markdown-container ul,
        .markdown-container ol {
          padding-left: 2rem;
        }

        .markdown-container ul {
          list-style-type: disc;
        }

        .markdown-container ol {
          list-style-type: decimal;
        }

        .markdown-container li {
          margin-bottom: 0.5rem;
        }

        .markdown-container li::marker {
          color: #00ff9d;
        }

        .markdown-container input[type="checkbox"] {
          margin-right: 0.5rem;
          width: 18px;
          height: 18px;
          accent-color: #00ff9d;
          cursor: pointer;
        }

        .markdown-container input[type="checkbox"]:checked + p {
          text-decoration: line-through;
          color: #888;
        }

        .img-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(42, 42, 42, 0.95);
          backdrop-filter: blur(12px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          cursor: zoom-out;
        }

        .img-overlay img {
          max-width: 92%;
          max-height: 92%;
          object-fit: contain;
          border-radius: 16px;
          box-shadow: 0 0 50px rgba(0, 255, 157, 0.25);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          background: rgba(30, 30, 40, 0.9);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 255, 157, 0.15);
        }

        th, td {
          padding: 14px 18px;
          border-bottom: 1px solid rgba(0, 255, 157, 0.12);
        }

        th {
          background: linear-gradient(135deg, rgba(0, 255, 157, 0.2), rgba(0, 169, 255, 0.1));
          font-weight: 700;
          color: #00ff9d;
          text-align: left;
          font-size: 1.05em;
          letter-spacing: 0.3px;
          border-bottom: 2px solid rgba(0, 255, 157, 0.3);
        }

        td {
          text-align: left;
          color: #e0e0e0;
          font-size: 0.95em;
        }

        tr:nth-child(even) {
          background: rgba(0, 255, 157, 0.06);
        }

        tr:nth-child(odd) {
          background: rgba(255, 255, 255, 0.02);
        }

        tr:hover {
          background: rgba(0, 255, 157, 0.15);
        }

        .loading-container,
        .error-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%);
        }

        .loading {
          font-size: 1.5rem;
          color: #00ff9d;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .loading::after {
          content: '';
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0, 255, 157, 0.3);
          border-radius: 50%;
          border-top-color: #00ff9d;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error {
          text-align: center;
          padding: 2rem;
          color: #ff6b6b;
        }

        .error h2 {
          color: #ff6b6b;
          margin-bottom: 1rem;
        }

        .error p {
          margin-bottom: 1.5rem;
        }

        @media (max-width: 1024px) {
          .page-layout {
            gap: 24px;
            padding: 80px 20px 20px;
          }

          .toc-sidebar {
            width: 220px;
          }

          .toc-item {
            padding: 8px 18px;
          }

          .toc-h2 {
            padding-left: 34px;
          }

          .toc-h3 {
            padding-left: 48px;
          }
        }

        @media (max-width: 768px) {
          .page-layout {
            flex-direction: column;
            padding: 70px 16px 16px;
            gap: 20px;
          }

          .content-wrapper {
            max-width: 100%;
          }

          .toc-sidebar {
            width: 100%;
            position: relative;
            top: 0;
            max-height: 220px;
            order: -1;
          }

          .toc-header {
            padding: 16px 18px 10px;
          }

          .toc-item {
            padding: 7px 18px;
            font-size: 0.82em;
          }

          .toc-h2 {
            padding-left: 32px;
          }

          .toc-h3 {
            padding-left: 44px;
          }

          .markdown-container {
            padding: 20px;
          }

          .tutorial-title {
            font-size: 1.5em;
            padding: 18px 22px;
          }

          .markdown-container img {
            max-width: 95%;
          }

          .fixed-buttons {
            padding: 10px 12px;
            gap: 10px;
            flex-wrap: wrap;
          }

          .fixed-buttons button {
            padding: 7px 14px !important;
            font-size: 0.78rem !important;
          }

          .reading-progress-bar {
            height: 2px;
          }

          .back-to-top-button {
            bottom: 20px;
            right: 20px;
            width: 44px;
            height: 44px;
            font-size: 1.25rem;
          }

          .markdown-container h2 {
            font-size: 1.35em;
          }

          .markdown-container h3 {
            font-size: 1.15em;
          }

          .markdown-container p,
          .markdown-container li {
            font-size: 0.95em;
          }

          .code-block-wrapper {
            padding: 3em 0.8em 0.8em 0.8em;
            font-size: 0.88em;
          }

          .copy-code-button {
            padding: 0.35em 0.8em;
            font-size: 0.75em;
          }

          table {
            font-size: 0.88em;
          }

          th, td {
            padding: 0.8rem;
          }
        }
      `}</style>
    </PageTransition>
  );
}
