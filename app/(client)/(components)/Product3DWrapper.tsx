'use client';

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Sparkles, Eye } from "lucide-react";

interface Product3DWrapperProps {
  src: string;
  alt: string;
  badge?: string;
  subtitle?: string;
  priority?: boolean;
  maxTilt?: number;
  perspective?: number;
  showHint?: boolean;
  className?: string;
  aspectRatio?: string;
  sizes?: string;
  children?: React.ReactNode;
}

export default function Product3DWrapper({
  src,
  alt,
  badge = "Extrait de Parfum • 35%",
  subtitle = "Private Reserve Flacon",
  priority = false,
  maxTilt = 18,
  perspective = 1200,
  showHint = true,
  className = "",
  aspectRatio = "aspect-4/5",
  sizes = "(max-width: 640px) 90vw, 480px",
  children,
}: Product3DWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const frameId = useRef<number | null>(null);

  // Target and current values for smooth linear interpolation (lerp)
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);

  const [isInteracting, setIsInteracting] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  // Ambient idle breathing animation
  const isIdle = !isInteracting;

  const updateMotion = useCallback(() => {
    // Lerp smoothing (0.10 for heavy luxury physics feel)
    currentX.current += (targetX.current - currentX.current) * 0.1;
    currentY.current += (targetY.current - currentY.current) * 0.1;

    if (cardRef.current) {
      const rotateX = (-currentY.current * maxTilt).toFixed(2);
      const rotateY = (currentX.current * maxTilt).toFixed(2);

      // Dynamic reactive drop shadow moving in opposite direction
      const shadowX = (-currentX.current * 24).toFixed(1);
      const shadowY = (currentY.current * 24 + 20).toFixed(1);
      const shadowBlur = (Math.abs(currentX.current) * 15 + 35).toFixed(1);

      cardRef.current.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      cardRef.current.style.boxShadow = `${shadowX}px ${shadowY}px ${shadowBlur}px -8px rgba(14, 40, 29, 0.22), 0 25px 50px -12px rgba(0, 0, 0, 0.18)`;
    }

    frameId.current = requestAnimationFrame(updateMotion);
  }, [maxTilt, perspective]);

  useEffect(() => {
    frameId.current = requestAnimationFrame(updateMotion);
    return () => {
      if (frameId.current) cancelAnimationFrame(frameId.current);
    };
  }, [updateMotion]);

  // Ambient sine wave floating when idle
  useEffect(() => {
    if (!isIdle) return;

    let time = 0;
    const interval = setInterval(() => {
      time += 0.04;
      targetX.current = Math.sin(time * 0.7) * 0.28;
      targetY.current = Math.cos(time * 0.5) * 0.22;
      setGlarePosition({
        x: 50 + targetX.current * 40,
        y: 50 + targetY.current * 40,
        opacity: 0.25,
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isIdle]);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    setIsInteracting(true);
    if (!hasInteracted) setHasInteracted(true);

    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Relative coords from -1 (left/top) to +1 (right/bottom)
    const px = (e.clientX - rect.left) / width;
    const py = (e.clientY - rect.top) / height;

    const normX = Math.max(-1, Math.min(1, (px - 0.5) * 2));
    const normY = Math.max(-1, Math.min(1, (py - 0.5) * 2));

    targetX.current = normX;
    targetY.current = normY;

    // Specular highlight tracks the light angle
    setGlarePosition({
      x: px * 100,
      y: py * 100,
      opacity: 0.65,
    });
  }

  function handlePointerLeave() {
    setIsInteracting(false);
    targetX.current = 0;
    targetY.current = 0;
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative select-none touch-pan-y cursor-grab active:cursor-grabbing ${className}`}
      style={{ perspective: `${perspective}px` }}
      aria-label={`${alt} in interactive 3D perspective preview`}
    >
      {/* 3D Transformable Stage Card */}
      <div
        ref={cardRef}
        className={`relative w-full ${aspectRatio} rounded-3xl overflow-hidden bg-gradient-to-b from-white via-[#faf7f2] to-[#f4ede0] border border-[#e7decb] transition-shadow duration-300 will-change-transform`}
        style={{
          transformStyle: "preserve-3d",
          transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`,
        }}
      >
        {/* Layer 0 (Back): Ambient Inner Light Glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_rgba(216,195,140,0.35)_0%,_transparent_75%)]"
          style={{ transform: "translateZ(5px)" }}
        />

        {/* Layer 1 (Mid-Back): Subtle Studio Pedestal Reflection Ring */}
        <div
          className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full bg-[#0e281d]/10 blur-md"
          style={{ transform: "translateZ(15px)" }}
        />

        {/* Layer 2 (Main Visual): The Uploaded 2D Product Picture floating in 3D */}
        <div
          className="relative w-full h-full p-6 sm:p-8 flex items-center justify-center"
          style={{ transform: "translateZ(45px) scale(1.04)" }}
        >
          <div className="relative w-full h-full">
            <Image
              src={src}
              alt={alt}
              fill
              priority={priority}
              quality={95}
              sizes={sizes}
              className="object-contain drop-shadow-[0_16px_24px_rgba(0,0,0,0.18)] transition-transform duration-300"
            />
          </div>
        </div>

        {/* Layer 3: Dynamic Specular Sheen / Glass Reflection Overlay */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 mix-blend-soft-light"
          style={{
            transform: "translateZ(60px)",
            opacity: glarePosition.opacity,
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.75) 0%, rgba(216, 195, 140, 0.35) 30%, transparent 70%)`,
          }}
        />

        {/* Layer 4: Shimmering Gold Border Bevel */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl border border-white/60"
          style={{ transform: "translateZ(55px)" }}
        />

        {/* Layer 5 (Foreground Floating Element): Luxury Accreditation Badge */}
        {badge && (
          <div
            className="pointer-events-none absolute top-4 left-4 sm:top-5 sm:left-5 flex items-center gap-1.5 rounded-full bg-[#0e281d]/90 backdrop-blur-md px-3.5 py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#d8c38c] border border-[#255840] shadow-md"
            style={{ transform: "translateZ(75px)" }}
          >
            <Sparkles className="size-3 text-[#d8c38c] animate-pulse" />
            <span>{badge}</span>
          </div>
        )}

        {/* Layer 6 (Foreground Floating Element): Subtitle Pill */}
        {subtitle && (
          <div
            className="pointer-events-none absolute top-4 right-4 sm:top-5 sm:right-5 text-[10px] sm:text-xs uppercase tracking-widest font-semibold text-neutral-500 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#e7decb]"
            style={{ transform: "translateZ(70px)" }}
          >
            {subtitle}
          </div>
        )}

        {/* Layer 7: Interactive 3D Inspection Hint */}
        {showHint && (
          <div
            className={`pointer-events-none absolute bottom-4 inset-x-0 flex justify-center transition-all duration-500 ${
              hasInteracted ? "opacity-35 hover:opacity-100" : "opacity-90 animate-bounce"
            }`}
            style={{ transform: "translateZ(85px)" }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-[#1b4431]/90 backdrop-blur-md px-4 py-1.5 text-[10px] sm:text-xs font-medium tracking-widest uppercase text-white shadow-lg border border-[#b39b66]/40">
              <Eye className="size-3.5 text-[#d8c38c]" />
              <span>Interactive 3D Stage • Tilt to inspect</span>
            </div>
          </div>
        )}

        {/* Optional Custom Injected Children */}
        {children && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ transform: "translateZ(65px)" }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
