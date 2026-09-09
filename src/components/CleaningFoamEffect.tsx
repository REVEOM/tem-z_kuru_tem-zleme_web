import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Volume2, VolumeX } from 'lucide-react';
import { 
  playBubblePop, 
  playFoamSwoosh, 
  playFoamFizz, 
  playSparkleSound, 
  isSoundMuted, 
  toggleSoundMuted 
} from '../utils/audioEffects';

interface BubbleData {
  id: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
  popping: boolean;
}

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface CleaningFoamEffectProps {
  onOpenOrder?: () => void;
}

// Pre-render bubble sprites once for zero-lag hardware-accelerated drawImage
function createBubbleSprite(size: number, tintColor: string, specularAlpha: number): HTMLCanvasElement {
  const sprite = document.createElement('canvas');
  sprite.width = size;
  sprite.height = size;
  const ctx = sprite.getContext('2d');
  if (!ctx) return sprite;

  const center = size / 2;
  const r = size / 2 - 2;

  // 3D Spherical Radial Gradient (baked once into pixels)
  const grad = ctx.createRadialGradient(
    center - r * 0.32,
    center - r * 0.32,
    r * 0.08,
    center,
    center,
    r
  );
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.35, 'rgba(240, 249, 255, 0.98)');
  grad.addColorStop(0.7, tintColor);
  grad.addColorStop(1, 'rgba(186, 230, 253, 0.65)');

  ctx.beginPath();
  ctx.arc(center, center, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // White specular rim highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.lineWidth = Math.max(1.5, size * 0.035);
  ctx.stroke();

  // Top glossy crescent
  ctx.beginPath();
  ctx.ellipse(
    center - r * 0.3,
    center - r * 0.35,
    r * 0.32,
    r * 0.16,
    -Math.PI / 4,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = `rgba(255, 255, 255, ${specularAlpha})`;
  ctx.fill();

  return sprite;
}

let cachedSprites: HTMLCanvasElement[] | null = null;
function getBubbleSprites(): HTMLCanvasElement[] {
  if (!cachedSprites && typeof document !== 'undefined') {
    cachedSprites = [
      createBubbleSprite(128, 'rgba(219, 234, 254, 0.88)', 0.92), // Ice Blue
      createBubbleSprite(128, 'rgba(224, 242, 254, 0.90)', 0.94), // Cyan White
      createBubbleSprite(128, 'rgba(240, 249, 255, 0.96)', 0.98), // Creamy Lather
    ];
  }
  return cachedSprites || [];
}

export const CleaningFoamEffect: React.FC<CleaningFoamEffectProps> = ({ onOpenOrder }) => {
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [sparkles, setSparkles] = useState<SparkleParticle[]>([]);
  const [isFoaming, setIsFoaming] = useState(false);
  const [soundMuted, setSoundMuted] = useState(isSoundMuted());
  const [cleanMessage, setCleanMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize floating soap bubbles in Hero
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const count = isMobile ? 12 : 20; // Lightweight count for butter-smooth mobile performance

    const initialBubbles: BubbleData[] = Array.from({ length: count }, (_, idx) => ({
      id: idx,
      size: Math.floor(Math.random() * (isMobile ? 22 : 32)) + 18,
      left: Math.random() * 92 + 3,
      duration: Math.random() * 4 + 6,
      delay: Math.random() * 5,
      popping: false
    }));
    setBubbles(initialBubbles);
  }, []);

  // Pop individual floating bubble on touch or click
  const handlePop = (id: number, e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    playBubblePop(1 + (Math.random() * 0.4 - 0.2));

    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const clickX = rect.left + rect.width / 2;
    const clickY = rect.top + rect.height / 2;

    const newSparkles: SparkleParticle[] = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: clickX + (Math.random() * 26 - 13),
      y: clickY + (Math.random() * 26 - 13),
      size: Math.random() * 7 + 5,
      color: ['#60a5fa', '#93c5fd', '#c084fc', '#38bdf8', '#ffffff'][i % 5]
    }));

    setSparkles((prev) => [...prev, ...newSparkles]);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((p) => !newSparkles.some((ns) => ns.id === p.id)));
    }, 700);

    setBubbles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, popping: true } : b))
    );

    setTimeout(() => {
      setBubbles((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                popping: false,
                left: Math.random() * 92 + 3,
                size: Math.floor(Math.random() * 26) + 18,
                delay: 0
              }
            : b
        )
      );
    }, 300);
  };

  // High-Performance Hardware-Accelerated Canvas Foam Physics Engine
  const startFoamCanvasSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.scale(dpr, dpr);

    const sprites = getBubbleSprites();

    // Fast, punchy audio triggers
    playFoamFizz();
    playFoamSwoosh();

    const isMobile = width < 640;
    const bubbleCount = isMobile ? 44 : 70;

    interface FoamBubble {
      x: number;
      y: number;
      targetRadius: number;
      currentRadius: number;
      speed: number;
      wobbleSpeed: number;
      wobbleOffset: number;
      spriteIndex: number;
      alpha: number;
    }

    const foamBubbles: FoamBubble[] = [];

    for (let i = 0; i < bubbleCount; i++) {
      const edgeRoll = Math.random();
      let x = width / 2;
      let y = height / 2;

      if (edgeRoll < 0.28) {
        x = Math.random() * width;
        y = height + Math.random() * 60;
      } else if (edgeRoll < 0.52) {
        x = Math.random() * width;
        y = -Math.random() * 60;
      } else if (edgeRoll < 0.74) {
        x = -Math.random() * 60;
        y = Math.random() * height;
      } else if (edgeRoll < 0.9) {
        x = width + Math.random() * 60;
        y = Math.random() * height;
      } else {
        x = width / 2 + (Math.random() * 160 - 80);
        y = height / 2 + (Math.random() * 160 - 80);
      }

      foamBubbles.push({
        x,
        y,
        targetRadius: isMobile ? Math.random() * 45 + 40 : Math.random() * 60 + 50,
        currentRadius: 4,
        speed: Math.random() * 2.2 + 2.4,
        wobbleSpeed: Math.random() * 0.08 + 0.04,
        wobbleOffset: Math.random() * Math.PI * 2,
        spriteIndex: i % (sprites.length || 1),
        alpha: Math.random() * 0.2 + 0.8
      });
    }

    // Micro fizz bubbles (lightweight)
    const fizzCount = isMobile ? 24 : 40;
    const fizzList = Array.from({ length: fizzCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 4 + 2,
      vy: -(Math.random() * 2.5 + 1.2)
    }));

    const startTime = performance.now();
    let orderScrolled = false;
    let squeegeeY = -1;

    const render = (now: number) => {
      const elapsed = now - startTime;

      ctx.clearRect(0, 0, width, height);

      // --- PHASE 1: RAPID FOAM EXPLOSION (0 to 380ms) ---
      const floodProgress = Math.min(1, elapsed / 300);
      const bgAlpha = Math.min(0.96, floodProgress * 0.98);

      ctx.fillStyle = `rgba(255, 255, 255, ${bgAlpha})`;
      ctx.fillRect(0, 0, width, height);

      // Organic Wave Tides (optimized with wider step)
      const timeSec = now * 0.006;
      ctx.fillStyle = 'rgba(238, 248, 255, 0.95)';

      // Bottom Wave
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 50) {
        const wave = Math.sin(x * 0.015 + timeSec) * 16;
        const waveY = height - (floodProgress * (height * 0.55)) + wave;
        ctx.lineTo(x, waveY);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Top Wave
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let x = 0; x <= width; x += 50) {
        const wave = Math.sin(x * 0.02 - timeSec) * 16;
        const waveY = (floodProgress * (height * 0.55)) + wave;
        ctx.lineTo(x, waveY);
      }
      ctx.lineTo(width, 0);
      ctx.closePath();
      ctx.fill();

      // GPU Accelerated Bubble Draw via Pre-rendered Sprites
      const targetCenterFactor = elapsed < 380 ? 0.16 : 0.04;
      for (let i = 0; i < foamBubbles.length; i++) {
        const b = foamBubbles[i];
        if (elapsed < 380) {
          const targetX = width / 2 + Math.sin(b.wobbleOffset) * width * 0.38;
          const targetY = height / 2 + Math.cos(b.wobbleOffset) * height * 0.38;
          b.x += (targetX - b.x) * targetCenterFactor * b.speed;
          b.y += (targetY - b.y) * targetCenterFactor * b.speed;
          b.currentRadius += (b.targetRadius - b.currentRadius) * 0.22;
        }

        b.wobbleOffset += b.wobbleSpeed;
        const r = b.currentRadius;
        const sprite = sprites[b.spriteIndex];
        if (sprite) {
          ctx.globalAlpha = b.alpha;
          ctx.drawImage(sprite, b.x - r, b.y - r, r * 2, r * 2);
        }
      }
      ctx.globalAlpha = 1.0;

      // Micro Fizz (batched draw)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      for (let i = 0; i < fizzList.length; i++) {
        const f = fizzList[i];
        f.y += f.vy;
        if (f.y < 0) f.y = height;
        ctx.rect(f.x, f.y, f.r, f.r);
      }
      ctx.fill();

      // --- PHASE 2: ULTRA-FAST SQUEEGEE WIPE (Starts at 380ms) ---
      if (elapsed >= 380) {
        if (squeegeeY === -1) {
          squeegeeY = 0;
          playSparkleSound();
          setCleanMessage('✨ Tertemiz! Sipariş ekranına geçiliyor...');

          // INSTANT SCROLL TO ORDER
          if (!orderScrolled) {
            orderScrolled = true;
            if (onOpenOrder) {
              onOpenOrder();
            }
            const orderEl = document.getElementById('siparis') || document.getElementById('kurye-cagir');
            if (orderEl) {
              orderEl.classList.remove('order-glow-active');
              void orderEl.offsetWidth;
              orderEl.classList.add('order-glow-active');
            }
          }
        }

        // Fast clean wipe speed across the screen
        const wipeSpeed = height / (isMobile ? 14 : 17);
        squeegeeY += wipeSpeed;

        // Clear everything above squeegee (reveals crystal clean website)
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillRect(0, 0, width, Math.max(0, squeegeeY));

        // Rubber squeegee blade with light glare
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(0, squeegeeY - 8, width, 6);

        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(0, squeegeeY - 3, width, 3);
        ctx.restore();
      }

      // Finish when squeegee clears bottom of viewport
      if (squeegeeY < height + 40) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        setIsFoaming(false);
        setTimeout(() => {
          setCleanMessage(null);
        }, 2200);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);
  }, [onOpenOrder]);

  // Trigger Action
  const triggerFoamClean = useCallback(() => {
    if (isFoaming) return;
    setIsFoaming(true);
    setCleanMessage('Köpükler her yeri sarıyor...');

    // Small delay to ensure canvas is mounted
    setTimeout(() => {
      startFoamCanvasSimulation();
    }, 20);
  }, [isFoaming, startFoamCanvasSimulation]);

  // Global trigger event listener
  useEffect(() => {
    const handleCustomTrigger = () => triggerFoamClean();
    window.addEventListener('trigger-foam-clean', handleCustomTrigger);
    return () => window.removeEventListener('trigger-foam-clean', handleCustomTrigger);
  }, [triggerFoamClean]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = toggleSoundMuted();
    setSoundMuted(updated);
  };

  return (
    <>
      {/* Background Floating Bubbles in Hero Section (Touch + Click Pop) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 select-none">
        {bubbles.map((b) => (
          <div
            key={b.id}
            onClick={(e) => handlePop(b.id, e)}
            onTouchStart={(e) => handlePop(b.id, e)}
            className={`soap-bubble pointer-events-auto ${b.popping ? 'bubble-popping' : ''}`}
            style={{
              width: `${b.size}px`,
              height: `${b.size}px`,
              left: `${b.left}%`,
              bottom: '-80px',
              animation: b.popping
                ? undefined
                : `floatBubbleUp ${b.duration}s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
              animationDelay: `${b.delay}s`
            }}
            title="Baloncuğu patlat!"
          />
        ))}

        {/* Dynamic Sparkle Burst Particles */}
        {sparkles.map((sp) => (
          <div
            key={sp.id}
            className="fixed pointer-events-none z-50 sparkle-particle"
            style={{
              left: `${sp.x}px`,
              top: `${sp.y}px`,
              width: `${sp.size}px`,
              height: `${sp.size}px`,
              color: sp.color
            }}
          >
            <Sparkles className="w-full h-full drop-shadow-sm" />
          </div>
        ))}
      </div>

      {/* Decorative Foam Suds Along Bottom of Hero Section */}
      <div className="absolute bottom-0 left-0 right-0 h-6 overflow-hidden pointer-events-none z-10 flex items-end justify-around opacity-75">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="w-12 h-8 rounded-full bg-white/70 dark:bg-zinc-800/60 backdrop-blur-xs border border-white/90 dark:border-zinc-700/50 -mb-2 shadow-sm transition-transform duration-700"
            style={{
              transform: `scale(${0.7 + (i % 4) * 0.25}) translateY(${(i % 3) * 2}px)`,
              opacity: 0.6 + (i % 3) * 0.15
            }}
          />
        ))}
      </div>

      {/* Header Pill: Mute / Unmute Sound Toggle (Responsive on Mobile) */}
      <div className="absolute top-3 right-3 sm:top-5 sm:right-6 z-30 flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleToggleSound}
          className="p-1.5 rounded-full bg-white/90 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60 shadow-xs backdrop-blur-sm transition-colors cursor-pointer"
          title={soundMuted ? 'Baloncuk sesini aç' : 'Baloncuk sesini sessize al'}
          aria-label="Ses Ayarı"
        >
          {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#1475bc] dark:text-[#38a3f5]" />}
        </button>
      </div>

      {/* FULL-SCREEN REALISTIC FOAM CANVAS SIMULATION */}
      {isFoaming && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
          />

          {/* Floating Live Status Pill */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-white/95 dark:bg-zinc-900/95 border-2 border-blue-400 px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-xl animate-in zoom-in-95">
            <span className="text-xl animate-bounce">🫧</span>
            <span className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {cleanMessage}
            </span>
          </div>
        </div>
      )}

      {/* Temporary Toast after cleaning */}
      {!isFoaming && cleanMessage && (
        <div className="fixed bottom-6 right-6 z-40 bg-white/95 dark:bg-zinc-900/95 border border-emerald-300 dark:border-emerald-800 px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 animate-in slide-in-from-bottom-4 duration-300">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{cleanMessage}</span>
        </div>
      )}
    </>
  );
};
