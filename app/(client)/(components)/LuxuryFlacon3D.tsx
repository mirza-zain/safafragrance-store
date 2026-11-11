'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Sparkles, RotateCw, Play, Pause, Flame } from "lucide-react";

interface ScentPreset {
  name: string;
  notes: string;
  color: string;
  capColor: string;
  glowColor: string;
}

const SCENT_PRESETS: ScentPreset[] = [
  {
    name: "Royale Oud",
    notes: "Cambodian Agarwood • Taif Rose",
    color: "#b8873f",
    capColor: "#0e281d",
    glowColor: "#d8c38c",
  },
  {
    name: "Emerald Noir",
    notes: "Smoked Vetiver • Mineral Ambergris",
    color: "#184e37",
    capColor: "#0a1f16",
    glowColor: "#34d399",
  },
  {
    name: "Saffron Blanc",
    notes: "Persian Saffron • White Suede",
    color: "#d4af37",
    capColor: "#1b4431",
    glowColor: "#fde047",
  },
];

export default function LuxuryFlacon3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePreset, setActivePreset] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isSpraying, setIsSpraying] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);

  // References to animate and interact with Three.js scene
  const sceneRef = useRef<THREE.Scene | null>(null);
  const liquidMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const capMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const bottleGroupRef = useRef<THREE.Group | null>(null);
  const sprayParticlesRef = useRef<THREE.Points | null>(null);
  const sprayVelocitiesRef = useRef<Float32Array | null>(null);
  const sprayAlphasRef = useRef<Float32Array | null>(null);

  // Interaction tracking state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const mousePositionRef = useRef({ x: 0, y: 0 });

  // Generate luxury procedural label texture
  const createLabelTexture = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Background
    ctx.fillStyle = "#faf7f2";
    ctx.fillRect(0, 0, 512, 512);

    // Inner gold luxury border
    ctx.strokeStyle = "#b39b66";
    ctx.lineWidth = 6;
    ctx.strokeRect(24, 24, 464, 464);

    ctx.strokeStyle = "#1b4431";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(34, 34, 444, 444);

    // Crest diamond
    ctx.fillStyle = "#1b4431";
    ctx.beginPath();
    ctx.moveTo(256, 70);
    ctx.lineTo(286, 100);
    ctx.lineTo(256, 130);
    ctx.lineTo(226, 100);
    ctx.closePath();
    ctx.fill();

    // Small gold inner diamond
    ctx.fillStyle = "#d8c38c";
    ctx.beginPath();
    ctx.moveTo(256, 85);
    ctx.lineTo(271, 100);
    ctx.lineTo(256, 115);
    ctx.lineTo(241, 100);
    ctx.closePath();
    ctx.fill();

    // Brand Name: SAFA
    ctx.fillStyle = "#0e281d";
    ctx.font = "bold 68px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.letterSpacing = "6px";
    ctx.fillText("SAFA", 256, 195);

    // Divider line
    ctx.strokeStyle = "#b39b66";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(140, 245);
    ctx.lineTo(372, 245);
    ctx.stroke();

    // Subtitle: EXTRAIT DE PARFUM
    ctx.fillStyle = "#555555";
    ctx.font = "600 24px sans-serif";
    ctx.letterSpacing = "4px";
    ctx.fillText("EXTRAIT DE PARFUM", 256, 280);

    // Concentration
    ctx.fillStyle = "#b39b66";
    ctx.font = "bold 20px sans-serif";
    ctx.letterSpacing = "3px";
    ctx.fillText("35% CONCENTRATION", 256, 325);

    // Provenance
    ctx.fillStyle = "#888888";
    ctx.font = "500 18px serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("HAUTE PARFUMERIE • 50 ML", 256, 400);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    return texture;
  }, []);

  // Trigger mist spray effect
  const triggerSpray = useCallback(() => {
    if (isSpraying || !sprayParticlesRef.current || !sprayVelocitiesRef.current) return;
    setIsSpraying(true);

    const particles = sprayParticlesRef.current;
    const count = 120;
    const positions = particles.geometry.attributes.position.array as Float32Array;
    const velocities = sprayVelocitiesRef.current;
    const alphas = sprayAlphasRef.current;

    // Reset particles at the nozzle location (top of bottle: y = 2.4)
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      positions[idx] = (Math.random() - 0.5) * 0.1;
      positions[idx + 1] = 2.45 + Math.random() * 0.1;
      positions[idx + 2] = 0.2 + (Math.random() - 0.5) * 0.1;

      // Cone spray velocity
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.05 + Math.random() * 0.08;
      const spread = 0.03 + Math.random() * 0.04;
      velocities[idx] = Math.cos(angle) * spread;
      velocities[idx + 1] = speed;
      velocities[idx + 2] = 0.04 + Math.sin(angle) * spread;

      if (alphas) alphas[i] = 1.0;
    }

    particles.geometry.attributes.position.needsUpdate = true;
    particles.visible = true;

    // Reset spraying state after 1.8s
    setTimeout(() => {
      setIsSpraying(false);
    }, 1800);
  }, [isSpraying]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Test WebGL support
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch {
      setWebGLSupported(false);
      return;
    }

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 520;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 7.2);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfaf7f2, 1.4);
    scene.add(ambientLight);

    // Key front-left light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(-3, 4, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Rim gold backlight
    const rimLight = new THREE.DirectionalLight(0xd8c38c, 3.5);
    rimLight.position.set(4, 2, -3);
    scene.add(rimLight);

    // Emerald shadow fill
    const fillLight = new THREE.PointLight(0x1b4431, 2.0, 10);
    fillLight.position.set(0, -3, 3);
    scene.add(fillLight);

    // Top shine spotlight
    const topSpot = new THREE.SpotLight(0xfffaed, 3.0, 15, Math.PI / 4, 0.5);
    topSpot.position.set(0, 6, 2);
    scene.add(topSpot);

    // 4. Bottle Group
    const bottleGroup = new THREE.Group();
    bottleGroupRef.current = bottleGroup;
    scene.add(bottleGroup);

    // --- A. Crystal Glass Body (Flacon) ---
    // Heavy beveled crystal cylinder
    const glassGeometry = new THREE.CylinderGeometry(1.22, 1.25, 3.2, 48, 1);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#fbfcfd"),
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.52, // Authentic crystal refraction index
      thickness: 0.9,
      specularIntensity: 1.0,
      specularColor: new THREE.Color("#ffffff"),
      envMapIntensity: 1.5,
    });
    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    glassMesh.castShadow = true;
    glassMesh.receiveShadow = true;
    bottleGroup.add(glassMesh);

    // Solid crystal heavy base
    const baseGeometry = new THREE.CylinderGeometry(1.23, 1.27, 0.45, 48);
    const baseMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#f8fafc"),
      transmission: 0.94,
      transparent: true,
      roughness: 0.03,
      ior: 1.54,
    });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.y = -1.6;
    bottleGroup.add(baseMesh);

    // --- B. Perfume Liquid (Inside) ---
    const liquidGeometry = new THREE.CylinderGeometry(1.06, 1.08, 2.65, 48);
    const liquidMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(SCENT_PRESETS[0].color),
      transmission: 0.45,
      transparent: true,
      roughness: 0.08,
      ior: 1.38,
      reflectivity: 0.6,
    });
    liquidMaterialRef.current = liquidMaterial;
    const liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
    liquidMesh.position.y = -0.15;
    bottleGroup.add(liquidMesh);

    // Dip Tube
    const tubeGeometry = new THREE.CylinderGeometry(0.04, 0.04, 2.9, 16);
    const tubeMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#ffffff"),
      transmission: 0.85,
      transparent: true,
      roughness: 0.1,
    });
    const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
    tubeMesh.position.set(0.02, -0.1, 0.02);
    tubeMesh.rotation.z = 0.02;
    bottleGroup.add(tubeMesh);

    // --- C. Metallic Gold Collar & Atomizer ---
    const collarGeometry = new THREE.CylinderGeometry(0.55, 0.58, 0.35, 32);
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#d8c38c"),
      metalness: 0.92,
      roughness: 0.2,
    });
    const collarMesh = new THREE.Mesh(collarGeometry, goldMaterial);
    collarMesh.position.y = 1.75;
    bottleGroup.add(collarMesh);

    const pumpGeometry = new THREE.CylinderGeometry(0.24, 0.24, 0.45, 24);
    const pumpMesh = new THREE.Mesh(pumpGeometry, goldMaterial);
    pumpMesh.position.y = 2.05;
    bottleGroup.add(pumpMesh);

    // --- D. Signature Emerald Noir Heavy Cap ---
    const capGeometry = new THREE.CylinderGeometry(0.72, 0.72, 1.15, 8); // Octagonal faceted cap
    const capMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(SCENT_PRESETS[0].capColor),
      metalness: 0.85,
      roughness: 0.25,
    });
    capMaterialRef.current = capMaterial;
    const capMesh = new THREE.Mesh(capGeometry, capMaterial);
    capMesh.position.y = 2.45;
    capMesh.castShadow = true;
    bottleGroup.add(capMesh);

    // Gold band on cap
    const ringGeometry = new THREE.CylinderGeometry(0.73, 0.73, 0.12, 32);
    const ringMesh = new THREE.Mesh(ringGeometry, goldMaterial);
    ringMesh.position.y = 1.95;
    bottleGroup.add(ringMesh);

    // --- E. Authentic Procedural Metallic Brand Label ---
    const labelTexture = createLabelTexture();
    if (labelTexture) {
      const labelGeometry = new THREE.PlaneGeometry(1.4, 1.4);
      const labelMaterial = new THREE.MeshStandardMaterial({
        map: labelTexture,
        roughness: 0.4,
        metalness: 0.2,
        transparent: true,
      });
      const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
      labelMesh.position.set(0, -0.05, 1.24); // Right against front glass
      bottleGroup.add(labelMesh);
    }

    // --- F. Ambient Floating Olfactory Mist Particles ---
    const ambientCount = 65;
    const ambientGeo = new THREE.BufferGeometry();
    const ambientPos = new Float32Array(ambientCount * 3);
    const ambientScales = new Float32Array(ambientCount);

    for (let i = 0; i < ambientCount; i++) {
      ambientPos[i * 3] = (Math.random() - 0.5) * 6;
      ambientPos[i * 3 + 1] = (Math.random() - 0.5) * 5;
      ambientPos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      ambientScales[i] = Math.random();
    }
    ambientGeo.setAttribute("position", new THREE.BufferAttribute(ambientPos, 3));

    const ambientMat = new THREE.PointsMaterial({
      color: new THREE.Color("#d8c38c"),
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const ambientPoints = new THREE.Points(ambientGeo, ambientMat);
    scene.add(ambientPoints);

    // --- G. Interactive Mist Spray System ---
    const sprayCount = 120;
    const sprayGeo = new THREE.BufferGeometry();
    const sprayPos = new Float32Array(sprayCount * 3);
    const sprayVels = new Float32Array(sprayCount * 3);
    const sprayAlphas = new Float32Array(sprayCount);

    for (let i = 0; i < sprayCount; i++) {
      sprayPos[i * 3] = 0;
      sprayPos[i * 3 + 1] = 2.45;
      sprayPos[i * 3 + 2] = 0;
      sprayAlphas[i] = 0.0;
    }

    sprayGeo.setAttribute("position", new THREE.BufferAttribute(sprayPos, 3));
    sprayVelocitiesRef.current = sprayVels;
    sprayAlphasRef.current = sprayAlphas;

    const sprayMat = new THREE.PointsMaterial({
      color: new THREE.Color("#fef3c7"),
      size: 0.09,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const sprayPoints = new THREE.Points(sprayGeo, sprayMat);
    sprayPoints.visible = false;
    scene.add(sprayPoints);
    sprayParticlesRef.current = sprayPoints;

    // --- H. Glass Pedestal with Shadow ---
    const pedestalGeo = new THREE.CylinderGeometry(2.1, 2.2, 0.08, 48);
    const pedestalMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#eee6d7"),
      roughness: 0.3,
      metalness: 0.1,
      transmission: 0.3,
      transparent: true,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.86;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Shadow plane
    const shadowGeo = new THREE.PlaneGeometry(5, 5);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.25 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.9;
    shadowMesh.receiveShadow = true;
    scene.add(shadowMesh);

    // Initial position & tilt
    bottleGroup.position.y = 0.1;
    bottleGroup.rotation.y = 0.35;

    // Interaction Handlers
    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      // Calculate normalized mouse coords (-1 to 1)
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePositionRef.current = { x, y };

      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      rotationVelocityRef.current = {
        x: deltaY * 0.005,
        y: deltaX * 0.007,
      };

      targetRotationRef.current.y += rotationVelocityRef.current.y;
      targetRotationRef.current.x = Math.max(
        -0.3,
        Math.min(0.3, targetRotationRef.current.x + rotationVelocityRef.current.x)
      );

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Auto rotation when not dragging
      if (autoRotate && !isDraggingRef.current) {
        targetRotationRef.current.y += 0.008;
      }

      // Smooth damping interpolation (Lerp)
      bottleGroup.rotation.y += (targetRotationRef.current.y - bottleGroup.rotation.y) * 0.06;
      bottleGroup.rotation.x += (targetRotationRef.current.x - bottleGroup.rotation.x) * 0.06;

      // Subtle mouse tilt reaction
      const targetTiltZ = -mousePositionRef.current.x * 0.08;
      bottleGroup.rotation.z += (targetTiltZ - bottleGroup.rotation.z) * 0.05;

      // Gentle floating levitation
      bottleGroup.position.y = 0.1 + Math.sin(elapsedTime * 1.5) * 0.05;

      // Ambient particle drift
      const aPos = ambientPoints.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < ambientCount; i++) {
        aPos[i * 3 + 1] += Math.sin(elapsedTime + i) * 0.003;
        aPos[i * 3] += Math.cos(elapsedTime * 0.8 + i) * 0.002;
      }
      ambientPoints.geometry.attributes.position.needsUpdate = true;
      ambientPoints.rotation.y = elapsedTime * 0.03;

      // Spray particle animation
      if (sprayPoints.visible && sprayVelocitiesRef.current) {
        const sPos = sprayPoints.geometry.attributes.position.array as Float32Array;
        const vels = sprayVelocitiesRef.current;
        let anyVisible = false;

        for (let i = 0; i < sprayCount; i++) {
          const idx = i * 3;
          sPos[idx] += vels[idx];
          sPos[idx + 1] += vels[idx + 1];
          sPos[idx + 2] += vels[idx + 2];

          // Air resistance slows particles
          vels[idx] *= 0.96;
          vels[idx + 1] *= 0.95;
          vels[idx + 2] *= 0.96;

          if (sPos[idx + 1] < 4.5) {
            anyVisible = true;
          }
        }
        sprayPoints.geometry.attributes.position.needsUpdate = true;
        if (!anyVisible) {
          sprayPoints.visible = false;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [autoRotate, createLabelTexture]);

  // Switch perfume liquid & cap color smoothly
  const handlePresetChange = (index: number) => {
    setActivePreset(index);
    const preset = SCENT_PRESETS[index];

    if (liquidMaterialRef.current) {
      liquidMaterialRef.current.color.set(preset.color);
    }
    if (capMaterialRef.current) {
      capMaterialRef.current.color.set(preset.capColor);
    }
  };

  if (!webGLSupported) {
    return (
      <div className="relative aspect-4/5 w-full max-w-sm sm:max-w-md rounded-3xl overflow-hidden bg-gradient-to-b from-white to-[#faf7f2] border border-[#e7decb] shadow-xl p-8 flex items-center justify-center">
        <img
          src="/images/icon2.png"
          alt="Safa Fragrance Flacon"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  const current = SCENT_PRESETS[activePreset];

  return (
    <div
      className="relative flex flex-col items-center w-full max-w-md mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-4/5 sm:aspect-square max-h-[500px] cursor-grab active:cursor-grabbing select-none rounded-3xl overflow-hidden bg-gradient-to-b from-white/80 via-[#faf7f2]/90 to-[#f2ece2]/60 backdrop-blur-xs border border-[#e7decb] shadow-2xl"
      >
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#e7decb] shadow-xs">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#1b4431]">
              Live 3D Flacon
            </span>
          </div>

          <div className="text-[10px] font-semibold text-neutral-500 bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-neutral-200">
            Drag 360° to Inspect
          </div>
        </div>

        {/* Center Floating Scent Title HUD */}
        <div className="absolute bottom-4 left-4 right-4 pointer-events-none z-10 flex items-end justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-widest text-[#b39b66] font-bold">
              {current.name}
            </span>
            <p className="text-xs font-semibold text-[#0e281d]">{current.notes}</p>
          </div>

          <span className="text-[10px] text-neutral-400 font-mono">35% Extrait</span>
        </div>
      </div>

      {/* Interactive Controls Panel */}
      <div className="mt-4 w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white/90 border border-[#e7decb] shadow-sm backdrop-blur-xs">
        {/* Scent Variant Selectors */}
        <div className="flex items-center gap-2">
          {SCENT_PRESETS.map((preset, idx) => (
            <button
              key={preset.name}
              onClick={() => handlePresetChange(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePreset === idx
                  ? "bg-[#1b4431] text-white shadow-xs scale-102"
                  : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
              }`}
            >
              <span
                className="size-2.5 rounded-full border border-white/50"
                style={{ backgroundColor: preset.color }}
              />
              <span className="hidden sm:inline">{preset.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons: Auto-spin & Spray Essence */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="p-2 rounded-xl border border-[#e7decb] hover:bg-[#faf7f2] text-neutral-700 transition"
            title={autoRotate ? "Pause Spin" : "Auto Rotate 360°"}
            aria-label="Toggle Auto Rotation"
          >
            {autoRotate ? <Pause size={15} /> : <Play size={15} />}
          </button>

          <button
            onClick={triggerSpray}
            disabled={isSpraying}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1b4431] to-[#255840] hover:from-[#0e281d] hover:to-[#1b4431] text-white text-xs font-bold uppercase tracking-wider transition shadow-md disabled:opacity-50 active:scale-98"
          >
            <Sparkles size={14} className="text-[#d8c38c]" />
            <span>{isSpraying ? "Mist Released..." : "Spray Essence"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
