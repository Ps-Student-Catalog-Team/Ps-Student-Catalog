import { useState } from 'react';
import { usePerformance, type PerformanceSettings, type AdaptiveLevel } from '../../context/PerformanceContext';

const LABELS: Record<keyof PerformanceSettings, string> = {
  backgroundParticles: '背景粒子网络',
  mouseFollower: '鼠标跟随光标',
  canvasParticles: '鼠标粒子轨迹',
  pageTransitions: '页面切换动画',
  reducedMotion: '全局减少动画（省电模式）',
};

const DESCRIPTIONS: Record<keyof PerformanceSettings, string> = {
  backgroundParticles: '全屏粒子连线动画，较耗性能',
  mouseFollower: '鼠标位置跟随圆环',
  canvasParticles: '鼠标移动时产生粒子拖尾',
  pageTransitions: '路由切换时的过渡动画',
  reducedMotion: '关闭所有 Framer Motion 动画',
};

const LEVEL_LABELS: Record<AdaptiveLevel, string> = {
  high: '高性能',
  medium: '中等',
  low: '低性能',
};

const PERFORMANCE_TIPS: Record<AdaptiveLevel, string | null> = {
  high: null,
  medium: '性能一般，建议关闭部分动画效果',
  low: '性能较低，已自动降级粒子数量',
};

function getFpsColor(fps: number): string {
  if (fps >= 50) return '#00ff9d';
  if (fps >= 30) return '#ffc107';
  return '#ff4757';
}

function getLevelColor(level: AdaptiveLevel): string {
  switch (level) {
    case 'high': return '#00ff9d';
    case 'medium': return '#ffc107';
    case 'low': return '#ff4757';
  }
}

export function PerformancePanel() {
  const { settings, updateSetting, resetSettings, currentFps, adaptiveLevel, particleCountMultiplier } = usePerformance();
  const [open, setOpen] = useState(false);

  const entries = Object.entries(settings) as [string, boolean][];
  const tip = PERFORMANCE_TIPS[adaptiveLevel];

  return (
    <>
      {/* 浮动设置按钮 */}
      <button
        onClick={() => setOpen(o => !o)}
        title="性能设置"
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 10000,
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '1px solid rgba(0,255,157,0.3)',
          background: 'rgba(10,10,10,0.85)',
          color: '#00ff9d',
          fontSize: 20,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: open
            ? '0 0 16px rgba(0,255,157,0.4)'
            : '0 0 8px rgba(0,255,157,0.15)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        }}
      >
        ⚙
      </button>

      {/* 设置面板抽屉 */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 74,
            right: 20,
            zIndex: 10000,
            width: 300,
            background: 'rgba(15,15,15,0.95)',
            border: '1px solid rgba(0,255,157,0.2)',
            borderRadius: 12,
            padding: '16px 20px',
            color: '#e0e0e0',
            fontSize: 13,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            animation: 'slideUp 0.25s ease-out',
          }}
        >
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
            paddingBottom: 10,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#00ff9d' }}>
              性能设置
            </span>
            <button
              onClick={resetSettings}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                fontSize: 11,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              重置默认
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 14,
            paddingBottom: 12,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>FPS</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: getFpsColor(currentFps) }}>
                {Math.round(currentFps)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>性能等级</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: getLevelColor(adaptiveLevel) }}>
                {LEVEL_LABELS[adaptiveLevel]}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>粒子倍率</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#ccc' }}>
                {(particleCountMultiplier * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {tip && (
            <div style={{
              marginBottom: 12,
              padding: '8px 10px',
              background: adaptiveLevel === 'low' ? 'rgba(255,71,87,0.1)' : 'rgba(255,193,7,0.1)',
              border: `1px solid ${adaptiveLevel === 'low' ? 'rgba(255,71,87,0.3)' : 'rgba(255,193,7,0.3)'}`,
              borderRadius: 6,
              fontSize: 11,
              color: adaptiveLevel === 'low' ? '#ff6b7a' : '#ffd43b',
            }}>
              ⚠ {tip}
            </div>
          )}

          {entries.map(([key, value]) => (
            <label
              key={key as string}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 0',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div style={{ flex: 1, marginRight: 12 }}>
                <div style={{ fontSize: 13, color: '#ccc' }}>{LABELS[key]}</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                  {DESCRIPTIONS[key]}
                </div>
              </div>
              <input
                type="checkbox"
                checked={value}
                onChange={e => updateSetting(key as keyof PerformanceSettings, e.target.checked)}
                style={{
                  accentColor: '#00ff9d',
                  width: 16,
                  height: 16,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />
            </label>
          ))}

          <div style={{
            marginTop: 12,
            fontSize: 11,
            color: '#555',
            textAlign: 'center',
          }}>
            设置自动保存到本地
          </div>
        </div>
      )}
    </>
  );
}
