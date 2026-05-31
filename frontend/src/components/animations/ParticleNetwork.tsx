import { useRef, useEffect, useCallback, useState } from 'react';
import { useMousePosition } from '../../hooks/useMousePosition';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';

interface ParticleNetworkProps {
  particleCount?: number;
  connectionDistance?: number;
  particleColor?: string;
  enabled?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export function ParticleNetwork({
  particleCount = 150,
  connectionDistance = 200,
  particleColor = '#00ff9d',
  enabled = true,
}: ParticleNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useMousePosition();
  const particlesRef = useRef<Particle[]>([]);
  const initializedRef = useRef(false);
  const [effectiveParticleCount, setEffectiveParticleCount] = useState(particleCount);

  useEffect(() => {
    const updateParticleCount = () => {
      const count = window.innerWidth < 768 ? 60 : window.innerWidth < 1024 ? 100 : 150;
      setEffectiveParticleCount(count);
    };

    updateParticleCount();
    window.addEventListener('resize', updateParticleCount);
    return () => window.removeEventListener('resize', updateParticleCount);
  }, [particleCount]);

  const createParticle = useCallback((canvas: HTMLCanvasElement): Particle => {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
    };
  }, []);

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    particlesRef.current = [];
    for (let i = 0; i < effectiveParticleCount; i++) {
      particlesRef.current.push(createParticle(canvas));
    }
  }, [createParticle, effectiveParticleCount]);

  const updateParticles = useCallback(() => {
    const particles = particlesRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles = particlesRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p1, i) => {
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          const opacity = (1 - distance / connectionDistance) * 0.6;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 255, 157, ${opacity})`;
          ctx.lineWidth = 1.2;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.fillStyle = particleColor;
      ctx.arc(p1.x, p1.y, p1.radius + 1, 0, Math.PI * 2);
      ctx.fill();
      
      // 给粒子加发光效果
      const gradient = ctx.createRadialGradient(p1.x, p1.y, 0, p1.x, p1.y, p1.radius + 3);
      gradient.addColorStop(0, 'rgba(0, 255, 157, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 255, 157, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, p1.radius + 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 鼠标连线到最近的多个粒子
    const nearestParticles = [...particles]
      .map(p => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return { particle: p, distance };
      })
      .filter(item => item.distance < 250)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 8);

    nearestParticles.forEach(item => {
      const opacity = (1 - item.distance / 250) * 0.8;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(0, 255, 157, ${opacity})`;
      ctx.lineWidth = 2;
      ctx.moveTo(item.particle.x, item.particle.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
    });
  }, [mouse, connectionDistance, particleColor]);

  useEffect(() => {
    if (initializedRef.current && canvasRef.current) {
      initParticles();
    }
  }, [effectiveParticleCount, initParticles]);

  useAnimationFrame(() => {
    if (!enabled) return;
    if (!initializedRef.current && canvasRef.current) {
      initParticles();
      initializedRef.current = true;
    }
    updateParticles();
    draw();
  });

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        initParticles();
      }
    };

    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initParticles, effectiveParticleCount]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
