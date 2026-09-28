import React, { useEffect, useRef } from "react";

interface DotGridBackgroundProps {
  className?: string;
  density?: "low" | "medium" | "high";
  color?: string;
  animated?: boolean;
}

export const DotGridBackground: React.FC<DotGridBackgroundProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const move = (event: MouseEvent) => {
      mouse.current = { x: event.clientX, y: event.clientY };
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gap = 28;
    const glow = 120;
    let frame = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      const cols = Math.ceil(width / gap) + 1;
      const rows = Math.ceil(height / gap) + 1;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = col * gap;
          const y = row * gap;
          const dist = Math.hypot(x - mx, y - my);
          const proximity = Math.max(0, 1 - dist / glow);
          const alpha = 0.08 + proximity * 0.7;
          const red = Math.round(180 + proximity * 75);
          const green = Math.round(proximity * 40);
          const blue = Math.round(proximity * 30);
          ctx.beginPath();
          ctx.arc(x, y, 1 + proximity * 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${red},${green},${blue},${alpha})`;
          ctx.fill();
        }
      }
      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
};

export const GridLinesBackground = DotGridBackground;
export const GlowOrb: React.FC<{ className?: string }> = () => null;
