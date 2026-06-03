import { useVpnSpeed, formatSpeed } from '../../context/VpnSpeedContext';

export function VpnSpeedMonitor() {
  const { speed, isLoading } = useVpnSpeed();

  const upload = formatSpeed(speed.uploadSpeed);
  const download = formatSpeed(speed.downloadSpeed);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '8px 16px',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* 上传速率 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', color: '#888' }}>↑</span>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#00ff9d' }}>
            {isLoading ? '--' : upload.value}
          </div>
          <div style={{ fontSize: '10px', color: '#666' }}>{upload.unit}</div>
        </div>
      </div>

      <div style={{ width: '1px', height: '32px', background: 'rgba(255, 255, 255, 0.1)' }} />

      {/* 下载速率 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', color: '#888' }}>↓</span>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#00d4ff' }}>
            {isLoading ? '--' : download.value}
          </div>
          <div style={{ fontSize: '10px', color: '#666' }}>{download.unit}</div>
        </div>
      </div>
    </div>
  );
}