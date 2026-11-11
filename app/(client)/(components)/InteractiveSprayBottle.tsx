'use client';

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Volume2, VolumeX, RotateCcw, Droplets } from "lucide-react";

interface MistParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  decay: number;
  color: string;
}

export default function InteractiveSprayBottle() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flaconSvgRef = useRef<SVGSVGElement>(null);
  const particlesRef = useRef<MistParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Spray and interaction states
  const [isPressing, setIsPressing] = useState(false);
  const [liquidLevel, setLiquidLevel] = useState(76); // percentage (76% full)

  // 3D Tilt physics with Lerp smoothing
  const targetTiltX = useRef(0);
  const targetTiltY = useRef(0);
  const currentTiltX = useRef(0);
  const currentTiltY = useRef(0);

  // Liquid slosh momentum physics
  const sloshVel = useRef(0);
  const sloshAngle = useRef(0);
  const wavePhaseRef = useRef(0);
  const prevPointerX = useRef(0);

  // Reactive state for rendering fluid surface
  const [fluidTilt, setFluidTilt] = useState(0);
  const [wavePhase, setWavePhase] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0.3 });

  // Internal bubbles inside liquid (strictly bounded by clip-path)
  const [bubbles, setBubbles] = useState<
    Array<{ id: number; x: number; y: number; r: number; speed: number; opacity: number }>
  >(() =>
    Array.from({ length: 9 }, (_, i) => ({
      id: i,
      x: 85 + ((i * 12) % 75),
      y: 180 + (i * 11),
      r: 1.2 + (i % 3) * 0.7,
      speed: 0.35 + (i % 3) * 0.2,
      opacity: 0.45 + (i % 3) * 0.2,
    }))
  );

  // Synthesize realistic aerosol perfume spray whisper using Web Audio API
  const playSpraySound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const duration = 0.36;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.3));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 2700;
      bandpass.Q.value = 1.1;

      const highpass = ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 1900;

      const gain = ctx.createGain();
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(bandpass);
      bandpass.connect(highpass);
      highpass.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch {
      // Audio policy handled silently
    }
  }, [soundEnabled]);

  // Spray burst function
  const triggerSpray = useCallback(() => {
    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 220);

    setLiquidLevel((prev) => Math.max(14, prev - 1.2)); // Decrement gently

    // Add strong liquid ripple impulse on spray
    sloshVel.current += (Math.random() - 0.5) * 8;

    playSpraySound();

    // Spurt rising bubbles from the dip tube base
    setBubbles((prev) => [
      ...prev.slice(-7),
      {
        id: Date.now() + Math.random(),
        x: 122 + (Math.random() - 0.5) * 6,
        y: 265,
        r: 1.6 + Math.random() * 1.2,
        speed: 0.65 + Math.random() * 0.35,
        opacity: 0.7,
      },
      {
        id: Date.now() + Math.random() + 1,
        x: 128 + (Math.random() - 0.5) * 6,
        y: 255,
        r: 1.2 + Math.random() * 1.0,
        speed: 0.75 + Math.random() * 0.35,
        opacity: 0.65,
      },
    ]);

    // Spawn 220 aerosol mist droplets on canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const nozzleX = 188;
    const nozzleY = 96;
    const newParticles: MistParticle[] = [];
    const particleCount = 220;

    for (let i = 0; i < particleCount; i++) {
      const baseAngle = -Math.PI * 0.30;
      const spread = (Math.random() - 0.5) * 0.65;
      const angle = baseAngle + spread;
      const speed = 4.2 + Math.random() * 8.8;

      const colors = [
        "rgba(255, 255, 255,",
        "rgba(248, 238, 210,",
        "rgba(216, 195, 140,",
        "rgba(255, 250, 242,",
      ];
      const colorPrefix = colors[Math.floor(Math.random() * colors.length)];

      newParticles.push({
        x: nozzleX + (Math.random() - 0.5) * 4,
        y: nozzleY + (Math.random() - 0.5) * 4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 0.8 + Math.random() * 2.5,
        alpha: 0.75 + Math.random() * 0.25,
        decay: 0.012 + Math.random() * 0.016,
        color: colorPrefix,
      });
    }

    particlesRef.current.push(...newParticles);
  }, [playSpraySound]);

  // Refill flacon
  const handleRefill = () => {
    setLiquidLevel(76);
  };

  // 3D Tilt & Fluid Physics Animation Loop
  useEffect(() => {
    let animId: number;

    const update3DPhysics = () => {
      // 1. Lerp smoothing for bottle 3D rotation
      currentTiltX.current += (targetTiltX.current - currentTiltX.current) * 0.08;
      currentTiltY.current += (targetTiltY.current - currentTiltY.current) * 0.08;

      // 2. Liquid Slosh with spring dynamics (inertia slosh opposes tilt)
      const targetSlosh = -currentTiltX.current * 14;
      sloshVel.current += (targetSlosh - sloshAngle.current) * 0.09;
      sloshVel.current *= 0.90; // Natural fluid viscosity damping
      sloshAngle.current += sloshVel.current;

      // Clamp fluid tilt so surface stays within inner chamber boundaries
      const clampedTilt = Math.max(-14, Math.min(14, sloshAngle.current));
      setFluidTilt(clampedTilt);

      // 3. Fluid wave ripple phase
      wavePhaseRef.current += 0.05;
      setWavePhase(wavePhaseRef.current);

      // 4. Apply 3D perspective transform to SVG flacon
      if (flaconSvgRef.current) {
        const rotX = (-currentTiltY.current * 10).toFixed(2);
        const rotY = (currentTiltX.current * 12).toFixed(2);
        const shadowX = (-currentTiltX.current * 18).toFixed(1);
        const shadowY = (currentTiltY.current * 14 + 20).toFixed(1);

        flaconSvgRef.current.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
        flaconSvgRef.current.style.filter = `drop-shadow(${shadowX}px ${shadowY}px 24px rgba(14, 40, 29, 0.26))`;
      }

      // 5. Bubble rise physics (strictly inside liquid)
      setBubbles((prev) =>
        prev.map((b) => {
          let newY = b.y - b.speed * 0.4;
          const minLiquidY = 275 - (liquidLevel / 100) * 165;
          if (newY < minLiquidY + 4) {
            newY = 270;
          }
          // Dynamic bubble sway with fluid tilt
          const swayX = b.x + Math.sin(b.y * 0.06 + wavePhaseRef.current) * 0.35 + clampedTilt * 0.06;
          const clampedX = Math.max(78, Math.min(172, swayX));
          return { ...b, x: clampedX, y: newY };
        })
      );

      animId = requestAnimationFrame(update3DPhysics);
    };

    animId = requestAnimationFrame(update3DPhysics);
    return () => cancelAnimationFrame(animId);
  }, [liquidLevel]);

  // Pointer tracking for organic 3D response
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const normX = Math.max(-1, Math.min(1, (px - 0.5) * 2));
    const normY = Math.max(-1, Math.min(1, (py - 0.5) * 2));

    targetTiltX.current = normX;
    targetTiltY.current = normY;

    // Push momentum into liquid slosh proportional to pointer delta
    const deltaX = e.clientX - prevPointerX.current;
    prevPointerX.current = e.clientX;
    const clampedDelta = Math.max(-25, Math.min(25, deltaX));
    sloshVel.current += clampedDelta * 0.12;

    setGlarePos({
      x: px * 100,
      y: py * 100,
      opacity: 0.45,
    });
  };

  const handlePointerLeave = () => {
    targetTiltX.current = 0;
    targetTiltY.current = 0;
    setGlarePos((prev) => ({ ...prev, opacity: 0.25 }));
  };

  // Canvas particle animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const displayWidth = 420;
    const displayHeight = 440;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    ctx.scale(dpr, dpr);

    const render = () => {
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.vy -= 0.04;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.alpha})`;
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Calculate dynamic liquid meniscus path
  // Inner glass cavity runs from Y=88 to Y=282.
  const liquidTopY = 276 - (liquidLevel / 100) * 160;
  const leftSurfaceY = liquidTopY - fluidTilt;
  const rightSurfaceY = liquidTopY + fluidTilt;
  const midSurfaceY = liquidTopY + Math.sin(wavePhase) * 2.8 + Math.cos(wavePhase * 1.7) * 1.4;

  // Fluid wave path with smooth quadratic curvature
  const liquidPath = `
    M 64 ${leftSurfaceY}
    Q 125 ${midSurfaceY} 186 ${rightSurfaceY}
    L 186 290
    L 64 290
    Z
  `;

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full max-w-[420px] mx-auto flex flex-col items-center select-none"
    >
      {/* AMBIENT LUXURY BACKDROP GLOW */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-8 z-0 rounded-full opacity-60 filter blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(216, 195, 140, 0.25) 0%, rgba(27, 68, 49, 0.12) 50%, transparent 75%)",
        }}
      />

      {/* DISCREET TOP CONTROLS (MUTE & REFILL ONLY) */}
      <div className="w-full flex items-center justify-end px-4 py-1.5 z-20 gap-2">
        {liquidLevel < 35 && (
          <button
            type="button"
            onClick={handleRefill}
            className="p-1.5 rounded-full bg-white/80 hover:bg-white text-neutral-600 hover:text-[#1b4431] border border-[#e7decb] shadow-xs transition-colors cursor-pointer"
            title="Refill Flacon"
            aria-label="Refill Flacon"
          >
            <RotateCcw className="size-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setSoundEnabled((prev) => !prev)}
          className="p-1.5 rounded-full bg-white/80 hover:bg-white text-neutral-600 hover:text-[#1b4431] border border-[#e7decb] shadow-xs transition-colors cursor-pointer"
          title={soundEnabled ? "Mute Spray Sound" : "Enable Spray Sound"}
          aria-label={soundEnabled ? "Mute Spray Sound" : "Enable Spray Sound"}
        >
          {soundEnabled ? (
            <Volume2 className="size-3.5 text-[#1b4431]" />
          ) : (
            <VolumeX className="size-3.5 text-neutral-400" />
          )}
        </button>
      </div>

      {/* STAGE CONTAINER HOLDING SVG FLACON & CANVAS MIST */}
      <div className="relative w-full aspect-[420/440] flex items-center justify-center z-10">
        {/* CANVAS FOR REALISTIC AEROSOL MIST PARTICLES */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-30 w-full h-full"
          style={{ width: "420px", height: "440px" }}
        />

        {/* SVG LUXURY BESPOKE FLACON WITH 3D PERSPECTIVE */}
        <svg
          ref={flaconSvgRef}
          viewBox="0 0 250 340"
          className="w-full h-full max-w-[340px] will-change-transform transition-transform duration-75 ease-out"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          <defs>
            {/* STRICT CLIP PATH: Confines 100% of liquid and bubbles inside the inner glass cavity */}
            <clipPath id="innerChamberClip">
              <rect x="69" y="88" width="112" height="194" rx="8" />
            </clipPath>

            {/* Liquid Amber/Golden Viscous Oil Gradient */}
            <linearGradient id="liquidGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e5b158" stopOpacity="0.88" />
              <stop offset="50%" stopColor="#d19232" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#b2711d" stopOpacity="0.95" />
            </linearGradient>

            {/* Gold Metal Brushed Gradient for Atomizer Cap */}
            <linearGradient id="goldCapGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8c733e" />
              <stop offset="25%" stopColor="#e2cd93" />
              <stop offset="50%" stopColor="#fff2c9" />
              <stop offset="75%" stopColor="#cfb26d" />
              <stop offset="100%" stopColor="#7a6231" />
            </linearGradient>

            {/* Gold Collar Ring */}
            <linearGradient id="goldCollarGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6e5726" />
              <stop offset="30%" stopColor="#d8be7b" />
              <stop offset="60%" stopColor="#fdf0c2" />
              <stop offset="100%" stopColor="#5d491f" />
            </linearGradient>

            {/* Glass Surface Specular Reflection */}
            <linearGradient id="glassReflection" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="30%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Glass Flacon Base Shimmer */}
            <linearGradient id="glassBaseGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Safa Emerald Label Gradient */}
            <linearGradient id="labelGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#183e2d" />
              <stop offset="100%" stopColor="#0c2319" />
            </linearGradient>
          </defs>

          {/* DROP SHADOW UNDER BOTTLE */}
          <ellipse
            cx="125"
            cy="312"
            rx="64"
            ry="12"
            fill="rgba(14, 40, 29, 0.28)"
            filter="blur(4px)"
          />

          {/* ================= ATOMIZER ASSEMBLY ================= */}
          {/* Spring-loaded Atomizer Pump Cap (Depresses on click) */}
          <g
            onClick={triggerSpray}
            className="cursor-pointer transition-transform duration-100 ease-out"
            style={{
              transform: isPressing ? "translateY(7px)" : "translateY(0px)",
              transformOrigin: "125px 50px",
            }}
            role="button"
            aria-label="Click to spray perfume flacon"
          >
            {/* Atomizer Nozzle Body */}
            <rect
              x="110"
              y="28"
              width="30"
              height="34"
              rx="4"
              fill="url(#goldCapGrad)"
              stroke="#594418"
              strokeWidth="0.8"
            />
            {/* Top Crown Bevel */}
            <rect
              x="108"
              y="24"
              width="34"
              height="6"
              rx="2.5"
              fill="url(#goldCapGrad)"
              stroke="#594418"
              strokeWidth="0.8"
            />
            {/* Atomizer Spray Hole (Right side) */}
            <circle cx="137" cy="42" r="2.2" fill="#261b0a" />
            <circle cx="137" cy="42" r="1.2" fill="#000000" />
            {/* Horizontal Knurling Grip Lines */}
            <line x1="113" y1="36" x2="132" y2="36" stroke="rgba(0,0,0,0.25)" strokeWidth="0.8" />
            <line x1="113" y1="48" x2="132" y2="48" stroke="rgba(0,0,0,0.25)" strokeWidth="0.8" />
          </g>

          {/* Gold Flacon Collar & Neck Ring (Fixed) */}
          <rect
            x="104"
            y="62"
            width="42"
            height="14"
            rx="2"
            fill="url(#goldCollarGrad)"
            stroke="#4d3b14"
            strokeWidth="0.8"
          />
          {/* Collar Accent Rim */}
          <rect
            x="101"
            y="74"
            width="48"
            height="5"
            rx="1.5"
            fill="url(#goldCapGrad)"
            stroke="#4d3b14"
            strokeWidth="0.6"
          />

          {/* ================= GLASS FLACON BODY ================= */}
          {/* Outer Crystal Glass Silhouette */}
          <rect
            x="60"
            y="79"
            width="130"
            height="224"
            rx="14"
            fill="rgba(255, 255, 255, 0.42)"
            stroke="rgba(216, 195, 140, 0.45)"
            strokeWidth="1.5"
          />

          {/* Inner Vessel Cavity Background */}
          <rect
            x="69"
            y="88"
            width="112"
            height="194"
            rx="8"
            fill="rgba(255, 255, 255, 0.22)"
          />

          {/* Siphon Dip Tube (Glass straw descending down) */}
          <line
            x1="125"
            y1="78"
            x2="125"
            y2="284"
            stroke="rgba(255, 255, 255, 0.75)"
            strokeWidth="3.2"
          />
          <line
            x1="125"
            y1="78"
            x2="125"
            y2="284"
            stroke="rgba(216, 195, 140, 0.45)"
            strokeWidth="1.2"
          />

          {/* ================= STRICTLY CLIPPED LIQUID & BUBBLES ================= */}
          {/* This clipPath guarantees the liquid and bubbles NEVER go outside the bottle cavity */}
          <g clipPath="url(#innerChamberClip)">
            {/* Dynamic Perfume Oil Extract with Organic Wave Meniscus */}
            <path
              d={liquidPath}
              fill="url(#liquidGrad)"
              className="transition-[d] duration-75 ease-out"
            />

            {/* Rising Effervescent Bubbles (Confined inside liquid) */}
            {bubbles.map((b) => (
              <circle
                key={b.id}
                cx={b.x}
                cy={b.y}
                r={b.r}
                fill="rgba(255, 255, 255, 0.82)"
                stroke="rgba(255, 235, 180, 0.9)"
                strokeWidth="0.5"
                opacity={b.opacity}
              />
            ))}
          </g>

          {/* Heavy Crystal Glass Base (Weighted bottom) */}
          <rect
            x="64"
            y="272"
            width="122"
            height="27"
            rx="8"
            fill="url(#glassBaseGrad)"
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth="1"
          />

          {/* Crystal Bevel Highlights on Sides */}
          <rect
            x="64"
            y="85"
            width="10"
            height="190"
            fill="url(#glassReflection)"
          />
          <rect
            x="176"
            y="85"
            width="10"
            height="190"
            fill="url(#glassReflection)"
            transform="scale(-1, 1) translate(-250, 0)"
          />

          {/* ================= SAFA OFFICIAL EMBOSSED LUXURY LABEL ================= */}
          <g transform="translate(75, 138)">
            {/* Label Plaque (Emerald Noir Base with Gold Border) */}
            <rect
              x="0"
              y="0"
              width="100"
              height="104"
              rx="8"
              fill="url(#labelGrad)"
              stroke="url(#goldCapGrad)"
              strokeWidth="1.8"
              filter="drop-shadow(0 6px 12px rgba(0,0,0,0.35))"
            />
            {/* Inner Fine Gold Inset Line */}
            <rect
              x="3.5"
              y="3.5"
              width="93"
              height="97"
              rx="6"
              fill="none"
              stroke="#d8c38c"
              strokeWidth="0.7"
              strokeOpacity="0.8"
            />

            {/* Official Safa Gold Logo Image */}
            <image
              href="/logo-gold.png"
              x="12"
              y="10"
              width="76"
              height="50"
              preserveAspectRatio="xMidYMid meet"
            />

            {/* Subtitle Typography */}
            <text
              x="50"
              y="68"
              textAnchor="middle"
              fill="#e7decb"
              fontSize="7"
              fontFamily="sans-serif"
              fontWeight="bold"
              letterSpacing="2"
            >
              EXTRAIT DE PARFUM
            </text>

            <text
              x="50"
              y="80"
              textAnchor="middle"
              fill="#c5af7d"
              fontSize="6"
              fontFamily="sans-serif"
              fontWeight="600"
              letterSpacing="1.4"
            >
              HAUTE PARFUMERIE
            </text>

            <text
              x="50"
              y="93"
              textAnchor="middle"
              fill="#d8c38c"
              fontSize="5.5"
              fontFamily="sans-serif"
              fontWeight="500"
              letterSpacing="0.8"
            >
              50 ML • 1.7 FL. OZ.
            </text>
          </g>

          {/* Front Specular Diagonal Glass Sheen */}
          <path
            d="M 68 87 L 98 87 L 78 285 L 68 285 Z"
            fill="rgba(255, 255, 255, 0.18)"
            style={{ mixBlendMode: "overlay" }}
          />
        </svg>
      </div>

      {/* ================= MINIMALIST LUXURY SPRAY TRIGGER ================= */}
      <div className="w-full mt-2 flex flex-col items-center z-20">
        <button
          type="button"
          onClick={triggerSpray}
          className={`relative overflow-hidden rounded-full py-3.5 px-10 text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 ${
            isPressing
              ? "bg-[#0e281d] text-[#d8c38c] ring-2 ring-[#d8c38c]"
              : "bg-[#1b4431] text-white hover:bg-[#0e281d] hover:shadow-lg border border-[#255840]"
          }`}
          aria-label="Spray Safa Extrait Perfume"
        >
          <Droplets className={`size-4 text-[#d8c38c] ${isPressing ? "animate-ping" : ""}`} />
          <span>Spray Safa Extrait</span>
          <span className="text-[#d8c38c]">✦</span>
        </button>
      </div>
    </div>
  );
}
