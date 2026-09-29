import { useState } from 'react';
import {
  usePerformance,
  usePerformanceTelemetry,
  type PerformanceSettings,
} from '../../context/PerformanceContext';
import type { AdaptiveLevel, QualityPreference } from '../../utils/performanceTier';

const TOGGLE_ORDER: Array<keyof PerformanceSettings> = [
  'backgroundParticles',
  'particleConnections',
  'particleGlow',
  'canvasParticles',
  'mouseFollower',
  'pageTransitions',
  'reducedMotion',
];

const LABELS: Record<keyof PerformanceSettings, string> = {
  backgroundParticles: '背景粒子网络',
  particleConnections: '粒子连线',
  particleGlow: '粒子发光光晕',
  mouseFollower: '鼠标跟随光标',
  canvasParticles: '鼠标粒子拖尾',
  pageTransitions: '页面切换动画',
  reducedMotion: '全局减少动画（省电模式）',
  qualityPreference: '性能档位',
};

const DESCRIPTIONS: Record<keyof PerformanceSettings, string> = {
  backgroundParticles: '全屏粒子网络动画（Worker 后台计算）',
  particleConnections: '粒子间的连线，关闭可显著降低开销',
  particleGlow: '粒子径向光晕，关闭后仅保留实心光点',
  mouseFollower: '鼠标位置跟随圆环与点击涟漪',
  canvasParticles: '鼠标移动时产生粒子拖尾',
  pageTransitions: '路由切换时的过渡动画',
  reducedMotion: '关闭所有非必要动画，最省电',
  qualityPreference: '自动档根据实时帧率动态调整',
};

const LEVEL_LABELS: Record<AdaptiveLevel, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const QUALITY_OPTIONS: Array<{ value: QualityPreference; label: string }> = [
  { value: 'auto', label: '自动' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

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
  const {
    settings,
    updateSetting,
    resetSettings,
    deviceTier,
    effectiveTier,
    tierConfig,
  } = usePerformance();
  const { currentFps } = usePerformanceTelemetry();
  const [open, setOpen] = useState(false);

  const autoMode = settings.qualityPreference === 'auto';
  const levelColor = getLevelColor(effectiveTier);
  const deviceLevelText = `设备评级：${LEVEL_LABELS[deviceTier]}性能`;

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        title="性能与动画设置"
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

      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 74,
            right: 20,
            zIndex: 10000,
            width: 310,
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
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
              性能与动画
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
              <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>当前档位</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: levelColor }}>
                {LEVEL_LABELS[effectiveTier]}
                {autoMode ? '·自动' : '·手动'}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>粒子倍率</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#ccc' }}>
                {(tierConfig.particleMultiplier * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
              {LABELS.qualityPreference}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {QUALITY_OPTIONS.map(opt => {
                const selected = settings.qualityPreference === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateSetting('qualityPreference', opt.value)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      fontSize: 12,
                      borderRadius: 6,
                      cursor: 'pointer',
                      border: selected
                        ? '1px solid rgba(0,255,157,0.6)'
                        : '1px solid rgba(255,255,255,0.12)',
                      background: selected ? 'rgba(0,255,157,0.15)' : 'transparent',
                      color: selected ? '#00ff9d' : '#999',
                      fontWeight: selected ? 600 : 400,
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 6 }}>
              {autoMode
                ? `${deviceLevelText}；帧率持续偏低时自动降档`
                : '手动档位下不会根据帧率自动调整'}
            </div>
          </div>

          {TOGGLE_ORDER.map(key => {
            const value = settings[key] as boolean;
            const disabled =
              !settings.backgroundParticles &&
              (key === 'particleConnections' || key === 'particleGlow');
            return (
              <label
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 0',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.4 : 1,
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
                  disabled={disabled}
                  onChange={e =>
                    updateSetting(key as keyof PerformanceSettings, e.target.checked)
                  }
                  style={{
                    accentColor: '#00ff9d',
                    width: 16,
                    height: 16,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    flexShrink: 0,
                  }}
                />
              </label>
            );
          })}

          <div style={{
            marginTop: 12,
            fontSize: 11,
            color: '#555',
            textAlign: 'center',
          }}>
            粒子物理在 Web Worker 中计算，设置自动保存
          </div>
        </div>
      )}
    </>
  );
}
