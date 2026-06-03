import { useRef, useEffect } from 'react';
import { useVpnSpeed } from '../../context/VpnSpeedContext';

export function VpnSpeedChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { history } = useVpnSpeed();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (history.length < 2) return;

    const maxSpeed = Math.max(
      ...history.map(h => Math.max(h.upload, h.download)),
      1024
    );

    const stepX = width / (history.length - 1);

    ctx.beginPath();
    ctx.strokeStyle = '#00ff9d';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00ff9d';
    ctx.shadowBlur = 4;

    history.forEach((point, i) => {
      const x = i * stepX;
      const y = height - (point.upload / maxSpeed) * height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 4;

    history.forEach((point, i) => {
      const x = i * stepX;
      const y = height - (point.download / maxSpeed) * height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(0, 255, 157, 0.1)';
    ctx.beginPath();
    history.forEach((point, i) => {
      const x = i * stepX;
      const y = height - (point.upload / maxSpeed) * height;
      if (i === 0) {
        ctx.moveTo(x, height);
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo((history.length - 1) * stepX, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 212, 255, 0.1)';
    ctx.beginPath();
    history.forEach((point, i) => {
      const x = i * stepX;
      const y = height - (point.download / maxSpeed) * height;
      if (i === 0) {
        ctx.moveTo(x, height);
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo((history.length - 1) * stepX, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    const kbMax = Math.round(maxSpeed / 1024);
    if (kbMax > 0) {
      ctx.fillText(`${kbMax} KB/s`, width - 4, 14);
    }
  }, [history]);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '300px',
        padding: '8px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <canvas
        ref={canvasRef}
        width={300}
        height={80}
        style={{ width: '100%', height: 'auto' }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '16px',
          marginTop: '4px',
          fontSize: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '2px', background: '#00d4ff' }} />
          <span style={{ color: '#888' }}>下载</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '2px', background: '#00ff9d' }} />
          <span style={{ color: '#888' }}>上传</span>
        </div>
      </div>
    </div>
  );
}