import React, { useEffect, useRef, useState } from 'react';
import { Box, RotateCw, ZoomIn, ZoomOut, Eye, AlertTriangle, Layers } from 'lucide-react';

interface Machine3DProps {
  machineCode?: string;
  isAnomalyActive?: boolean;
  selectedComponent?: string;
  onSelectComponent?: (comp: string) => void;
}

export const Machine3DViewer: React.FC<Machine3DProps> = ({
  machineCode = 'TX-1250-A',
  isAnomalyActive = true,
  selectedComponent = 'Left Shaft Bearing',
  onSelectComponent
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotationX, setRotationX] = useState<number>(0.3);
  const [rotationY, setRotationY] = useState<number>(0.6);
  const [zoom, setZoom] = useState<number>(1.0);
  const [activeTab, setActiveTab] = useState<'3D' | 'DXF' | 'SENSORS'>('3D');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let angle = rotationY;

    const renderFrame = () => {
      angle += 0.005; // Gentle auto-rotation
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2 + 10;

      // 3D Grid Floor
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let i = -150; i <= 150; i += 30) {
        ctx.beginPath();
        ctx.moveTo(centerX - 180 * zoom, centerY + i * 0.4 * zoom);
        ctx.lineTo(centerX + 180 * zoom, centerY + i * 0.4 * zoom);
        ctx.stroke();
      }

      // Draw Base Machine Frame (Industrial Grey Metal)
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      
      const frameWidth = 240 * zoom;
      const frameHeight = 110 * zoom;
      ctx.fillRect(centerX - frameWidth / 2, centerY - frameHeight / 2, frameWidth, frameHeight);
      ctx.strokeRect(centerX - frameWidth / 2, centerY - frameHeight / 2, frameWidth, frameHeight);

      // Main AC Servo Motor (Left Side)
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.fillRect(centerX - frameWidth / 2 + 15 * zoom, centerY - 45 * zoom, 55 * zoom, 65 * zoom);
      ctx.strokeRect(centerX - frameWidth / 2 + 15 * zoom, centerY - 45 * zoom, 55 * zoom, 65 * zoom);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px Inter';
      ctx.fillText('MOTOR', centerX - frameWidth / 2 + 22 * zoom, centerY - 10 * zoom);

      // Main Drive Shaft (Horizontal Cylinder)
      ctx.fillStyle = '#475569';
      ctx.fillRect(centerX - frameWidth / 2 + 70 * zoom, centerY - 15 * zoom, 120 * zoom, 20 * zoom);

      // Left Shaft Bearing Assembly (FAULTY / HIGHLIGHTED COMPONENT)
      const bearingX = centerX - frameWidth / 2 + 85 * zoom;
      const bearingY = centerY - 25 * zoom;
      const bearingW = 38 * zoom;
      const bearingH = 40 * zoom;

      if (isAnomalyActive) {
        // Red Pulsing Glow Effect
        const pulse = (Math.sin(Date.now() * 0.005) + 1) / 2;
        ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + pulse * 0.45})`;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 15;
      } else {
        ctx.fillStyle = '#0d9488';
        ctx.strokeStyle = '#14b8a6';
      }

      ctx.fillRect(bearingX, bearingY, bearingW, bearingH);
      ctx.strokeRect(bearingX, bearingY, bearingW, bearingH);
      ctx.shadowBlur = 0; // Reset shadow

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px Inter';
      ctx.fillText('BEARING L', bearingX + 3, bearingY + 24);

      // Gearbox Housing (Right Side)
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.fillRect(centerX + 35 * zoom, centerY - 35 * zoom, 50 * zoom, 55 * zoom);
      ctx.strokeRect(centerX + 35 * zoom, centerY - 35 * zoom, 50 * zoom, 55 * zoom);

      // Warp Tension Rollers (Front Assembly)
      ctx.fillStyle = '#334155';
      ctx.fillRect(centerX - frameWidth / 2 + 20 * zoom, centerY + 25 * zoom, 160 * zoom, 16 * zoom);

      // Callout Pin for Faulty Component
      if (isAnomalyActive) {
        ctx.beginPath();
        ctx.moveTo(bearingX + bearingW / 2, bearingY);
        ctx.lineTo(bearingX + bearingW / 2 - 20, bearingY - 35);
        ctx.lineTo(bearingX + bearingW / 2 - 80, bearingY - 35);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.fillRect(bearingX + bearingW / 2 - 140, bearingY - 50, 120, 22);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Inter';
        ctx.fillText('⚠️ FAULT: SKF 6208', bearingX + bearingW / 2 - 135, bearingY - 35);
      }

      animFrameId = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => cancelAnimationFrame(animFrameId);
  }, [rotationY, zoom, isAnomalyActive]);

  return (
    <div className="relative w-full h-full bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
      {/* Top Bar Controls */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('3D')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              activeTab === '3D' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            3D View
          </button>
          <button
            onClick={() => setActiveTab('DXF')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              activeTab === 'DXF' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            DXF Schema
          </button>
          <button
            onClick={() => setActiveTab('SENSORS')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              activeTab === 'SENSORS' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Sensors Map
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 1.8))}
            className="p-1 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-100"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.6))}
            className="p-1 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-100"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={() => setRotationY((r) => r + 0.5)}
            className="p-1 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-100"
            title="Rotate View"
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      {/* Canvas Canvas Render */}
      <div className="relative flex-1 w-full h-full min-h-[260px] flex items-center justify-center bg-[#f8fafc]">
        <canvas ref={canvasRef} width={480} height={260} className="w-full h-full object-contain cursor-grab" />

        {/* Overlay Component Quick Selector Bar */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur border border-slate-200 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-xs shadow-md">
          <button
            onClick={() => onSelectComponent?.('Drive Motor')}
            className="px-2 py-1 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
          >
            Motor
          </button>
          <button
            onClick={() => onSelectComponent?.('Left Shaft Bearing')}
            className="px-2 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200 font-bold"
          >
            Bearing (Left) ⚠️
          </button>
          <button
            onClick={() => onSelectComponent?.('Gearbox')}
            className="px-2 py-1 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
          >
            Gearbox
          </button>
          <button
            onClick={() => onSelectComponent?.('Warp Rollers')}
            className="px-2 py-1 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
          >
            Rollers
          </button>
        </div>
      </div>
    </div>
  );
};
