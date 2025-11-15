"use client";

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';

export function ImageAvatar({ amplitude }: { amplitude: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { imageObjectUrl, emotion } = useAppStore();

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;

    let raf = 0;
    const img = new Image();
    if (imageObjectUrl) img.src = imageObjectUrl;

    function draw() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0,0,w,h);

      // Background panel
      ctx.fillStyle = 'rgba(10,10,16,0.9)';
      ctx.fillRect(0,0,w,h);

      if (img.complete && img.src) {
        const aspect = img.width / img.height;
        const targetW = w; const targetH = w / aspect;
        const y = (h - targetH) / 2;
        ctx.drawImage(img, 0, y, targetW, targetH);
      } else {
        ctx.fillStyle = '#222633';
        ctx.fillRect(w*0.2, h*0.2, w*0.6, h*0.6);
      }

      // Mouth overlay (simple talking)
      const mouthX = w * 0.5;
      const mouthY = h * 0.6;
      const openness = Math.max(6, amplitude * 50);
      ctx.fillStyle = '#8b1a1a';
      ctx.beginPath();
      ctx.ellipse(mouthX, mouthY, 40, openness, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyes/eyebrows emotion cues
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 4 * devicePixelRatio;
      let brow = 0;
      switch (emotion) {
        case 'happy': brow = -8; break;
        case 'sad': brow = 8; break;
        case 'angry': brow = 6; break;
        case 'surprised': brow = -12; break;
      }
      ctx.beginPath();
      ctx.moveTo(w*0.42, h*0.45 + brow);
      ctx.lineTo(w*0.48, h*0.43 + brow);
      ctx.moveTo(w*0.58, h*0.45 + brow);
      ctx.lineTo(w*0.52, h*0.43 + brow);
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [imageObjectUrl, emotion, amplitude]);

  return <canvas ref={canvasRef} className="w-full h-full rounded-xl bg-[var(--panel)]" />;
}
