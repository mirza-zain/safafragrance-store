'use client';

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface MistDroplet {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  alpha: number;
  decay: number;
}

export default function Safa3DHero() {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameId = useRef<number | null>(null);

  // Interaction references for smooth natural mouse tilt and drag orbit
  const isPointerDown = useRef(false);
  const pointerStart = useRef({ x: 0, y: 0 });
  const pointerDelta = useRef({ x: 0, y: 0 });
  const targetRot = useRef({ x: 0.04, y: 0.0, z: 0.0 });
  const currentRot = useRef({ x: 0.04, y: 0.0, z: 0.0 });

  // Cap animation state
  const capGroupRef = useRef<THREE.Group | null>(null);
  const capCurrentY = useRef(4.35);
  const scrollProgressRef = useRef(0);

  // 3D Mist particles
  const dropletsRef = useRef<MistDroplet[]>([]);
  const mistPointsRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const isMobile = width < 768;
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    camera.position.set(0, 0.4, isMobile ? 9.6 : 8.2);
    camera.lookAt(0, 0.1, 0);

    // WebGL Renderer with High-End Color Management & ACES Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    // CREATE HIGH-CONTRAST LUXURY STUDIO ENVIRONMENT MAP (Dark Atelier with Razor-Sharp Softboxes)
    // Dark flags in the studio environment are what give crystal glass its crisp edges and facet contours!
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envCanvas = document.createElement("canvas");
    envCanvas.width = 1024;
    envCanvas.height = 512;
    const envCtx = envCanvas.getContext("2d");
    if (envCtx) {
      // Deep studio charcoal base (replaces flat white glare so crystal glass has contrast!)
      envCtx.fillStyle = "#141815";
      envCtx.fillRect(0, 0, 1024, 512);

      // Subtle warm champagne ambient gradient in center
      const bgGrad = envCtx.createRadialGradient(512, 256, 40, 512, 256, 450);
      bgGrad.addColorStop(0, "rgba(75, 62, 50, 0.45)");
      bgGrad.addColorStop(1, "rgba(18, 22, 19, 0.95)");
      envCtx.fillStyle = bgGrad;
      envCtx.fillRect(0, 0, 1024, 512);

      // Key Softbox: Razor-sharp tall vertical white light strip on the left
      const leftSoftbox = envCtx.createLinearGradient(120, 0, 280, 0);
      leftSoftbox.addColorStop(0, "rgba(255, 255, 255, 0)");
      leftSoftbox.addColorStop(0.25, "rgba(255, 255, 255, 1)");
      leftSoftbox.addColorStop(0.75, "rgba(255, 255, 255, 1)");
      leftSoftbox.addColorStop(1, "rgba(255, 255, 255, 0)");
      envCtx.fillStyle = leftSoftbox;
      envCtx.fillRect(120, 20, 160, 472);

      // Fill Softbox: Warm champagne vertical softbox strip on the right
      const rightSoftbox = envCtx.createLinearGradient(740, 0, 880, 0);
      rightSoftbox.addColorStop(0, "rgba(255, 245, 225, 0)");
      rightSoftbox.addColorStop(0.3, "rgba(255, 245, 225, 0.95)");
      rightSoftbox.addColorStop(0.7, "rgba(255, 245, 225, 0.95)");
      rightSoftbox.addColorStop(1, "rgba(255, 245, 225, 0)");
      envCtx.fillStyle = rightSoftbox;
      envCtx.fillRect(740, 30, 140, 452);

      // Overhead Skylight: Top highlight for royal gold & crystal facets
      const topLight = envCtx.createRadialGradient(512, 80, 20, 512, 80, 220);
      topLight.addColorStop(0, "rgba(255, 255, 255, 1)");
      topLight.addColorStop(0.5, "rgba(255, 255, 255, 0.7)");
      topLight.addColorStop(1, "rgba(255, 255, 255, 0)");
      envCtx.fillStyle = topLight;
      envCtx.fillRect(256, 0, 512, 220);

      // Deep Noir Studio Flags on side flanks (carves crisp crystal contours)
      envCtx.fillStyle = "rgba(4, 7, 5, 0.96)";
      envCtx.fillRect(0, 0, 100, 512);
      envCtx.fillRect(924, 0, 100, 512);

      // Warm Amber Bounce (Reflects up into perfume liquid)
      const bottomWarm = envCtx.createRadialGradient(512, 450, 20, 512, 450, 260);
      bottomWarm.addColorStop(0, "rgba(255, 140, 30, 0.95)");
      bottomWarm.addColorStop(0.6, "rgba(200, 90, 20, 0.4)");
      bottomWarm.addColorStop(1, "rgba(0, 0, 0, 0)");
      envCtx.fillStyle = bottomWarm;
      envCtx.fillRect(256, 280, 512, 232);
    }
    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    const envMap = pmremGenerator.fromEquirectangular(envTexture).texture;
    scene.environment = envMap;
    pmremGenerator.dispose();
    envTexture.dispose();

    // MASTER BOTTLE GROUP (Centered Pivot & Proportionate Scale - NO BOX, PURE FLACON)
    const masterFlaconGroup = new THREE.Group();
    masterFlaconGroup.position.set(0, -0.2, 0);
    const initialScale = isMobile ? 0.46 : 0.54;
    masterFlaconGroup.scale.set(initialScale, initialScale, initialScale);
    scene.add(masterFlaconGroup);

    // FLACON ASSEMBLY ROOT (Centered near liquid gravity center)
    const flaconRoot = new THREE.Group();
    flaconRoot.position.set(0, -1.9, 0);
    masterFlaconGroup.add(flaconRoot);

    // 1. HIGH-PRECISION OPTICAL CRYSTAL GLASS FLACON (Thick Crystal Base & Liquid Cavity)
    const glassPoints = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.95, 0.05),
      new THREE.Vector2(1.36, 0.28),
      new THREE.Vector2(1.48, 0.65),
      new THREE.Vector2(1.5, 1.8),
      new THREE.Vector2(1.48, 2.5),
      new THREE.Vector2(1.32, 2.95),
      new THREE.Vector2(0.95, 3.25),
      new THREE.Vector2(0.66, 3.42),
      new THREE.Vector2(0.66, 3.82),
      new THREE.Vector2(0.72, 3.88),
      new THREE.Vector2(0.52, 3.88),
      new THREE.Vector2(0.5, 3.42),
      new THREE.Vector2(1.22, 2.9),
      new THREE.Vector2(1.28, 2.45),
      new THREE.Vector2(1.28, 0.75),
      new THREE.Vector2(1.18, 0.54),
      new THREE.Vector2(0, 0.5), // Heavy solid 0.5 unit crystal base
    ];

    const glassGeometry = new THREE.LatheGeometry(glassPoints, 96);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0e1411), // Deep crystal flint tint - eliminates white milky fog completely!
      transparent: true,
      opacity: 0.16, // Pure optical crystal clarity
      roughness: 0.01,
      metalness: 0.02,
      ior: 1.54, // Optical flint crystal glass
      reflectivity: 0.98,
      clearcoat: 1.0,
      clearcoatRoughness: 0.015,
      envMapIntensity: 2.0,
    });
    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    glassMesh.renderOrder = 10;
    flaconRoot.add(glassMesh);

    // 2. INNER PERFUME OIL (Rich Amber-Cognac fluid with visible meniscus & glowing internal radiance)
    const liquidPoints = [
      new THREE.Vector2(0, 0.54),
      new THREE.Vector2(1.24, 0.54),
      new THREE.Vector2(1.26, 1.0),
      new THREE.Vector2(1.26, 2.4),
      new THREE.Vector2(1.2, 2.42),
      new THREE.Vector2(0, 2.41), // Meniscus curvature
    ];
    const liquidGeometry = new THREE.LatheGeometry(liquidPoints, 64);
    const liquidMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xd45200), // Deep glowing cognac amber perfume extract
      transparent: true,
      opacity: 0.96,
      roughness: 0.03,
      metalness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 2.0,
    });
    const liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
    liquidMesh.renderOrder = 2;
    flaconRoot.add(liquidMesh);

    // Liquid Top Surface Meniscus Highlight Rim
    const meniscusGeo = new THREE.CylinderGeometry(1.23, 1.23, 0.03, 64);
    const meniscusMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xf58a18),
      transparent: true,
      opacity: 0.96,
      roughness: 0.02,
      clearcoat: 1.0,
      reflectivity: 0.98,
    });
    const meniscus = new THREE.Mesh(meniscusGeo, meniscusMat);
    meniscus.position.set(0, 2.41, 0);
    meniscus.renderOrder = 2;
    flaconRoot.add(meniscus);

    // Iconic Slender Glass Dip Tube (Atomizer Suction Tube passing through Liquid)
    const dipTubeGeo = new THREE.CylinderGeometry(0.042, 0.042, 2.9, 32);
    const dipTubeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
      roughness: 0.04,
      ior: 1.48,
      reflectivity: 0.9,
    });
    const dipTube = new THREE.Mesh(dipTubeGeo, dipTubeMat);
    dipTube.position.set(0, 2.15, 0);
    flaconRoot.add(dipTube);

    // Warm Internal Liquid Glow Light (Makes the amber oil illuminate brightly from within the crystal!)
    const liquidGlow = new THREE.PointLight(0xff8822, 2.8, 6.0);
    liquidGlow.position.set(0, 1.6, 0.2);
    flaconRoot.add(liquidGlow);

    // 3. CURVED LUXURY SAFA FRONT PLAQUE (Embossed Gold & Noir Emerald Brand Emblem)
    const labelCanvas = document.createElement("canvas");
    labelCanvas.width = 1024;
    labelCanvas.height = 1024;
    const lctx = labelCanvas.getContext("2d");
    if (lctx) {
      lctx.clearRect(0, 0, 1024, 1024);

      // Deep Noir-Emerald Luxury Plate
      lctx.fillStyle = "rgba(14, 40, 29, 0.92)";
      lctx.beginPath();
      lctx.roundRect(80, 140, 864, 744, 48);
      lctx.fill();

      // Outer 24K Gold Foil Border
      lctx.strokeStyle = "#c5a869";
      lctx.lineWidth = 10;
      lctx.beginPath();
      lctx.roundRect(94, 154, 836, 716, 40);
      lctx.stroke();

      // Inner Hairline Gold Border
      lctx.strokeStyle = "rgba(216, 195, 140, 0.6)";
      lctx.lineWidth = 3;
      lctx.beginPath();
      lctx.roundRect(112, 172, 800, 680, 32);
      lctx.stroke();

      // Royal Crest Star
      lctx.fillStyle = "#e5c87a";
      lctx.font = "bold 96px serif";
      lctx.textAlign = "center";
      lctx.textBaseline = "middle";
      lctx.fillText("✦", 512, 305);

      // Main Brand Title: S A F A
      lctx.fillStyle = "#f5e6c8";
      lctx.font = "bold 120px serif";
      lctx.letterSpacing = "14px";
      lctx.fillText("S A F A", 512, 425);

      // Arabic Calligraphy: صفاء
      lctx.fillStyle = "#dfc59b";
      lctx.font = "bold 76px serif";
      lctx.fillText("صفاء", 512, 530);

      // Thin divider
      lctx.strokeStyle = "rgba(197, 168, 105, 0.7)";
      lctx.lineWidth = 2.5;
      lctx.beginPath();
      lctx.moveTo(280, 600);
      lctx.lineTo(744, 600);
      lctx.stroke();

      // Subtitle
      lctx.fillStyle = "#ffffff";
      lctx.font = "bold 52px sans-serif";
      lctx.letterSpacing = "10px";
      lctx.fillText("EXTRAIT DE PARFUM", 512, 670);

      // Flacon detail
      lctx.fillStyle = "#d8c38c";
      lctx.font = "34px sans-serif";
      lctx.letterSpacing = "6px";
      lctx.fillText("35% CONCENTRATE • 100 ML", 512, 755);
    }
    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    labelTexture.anisotropy = 8;

    // Curved cylinder patch positioned seamlessly onto the front face of the bottle
    const labelGeometry = new THREE.CylinderGeometry(
      1.505,
      1.485,
      1.7,
      64,
      1,
      true,
      -0.62,
      1.24
    );
    const labelMaterial = new THREE.MeshStandardMaterial({
      map: labelTexture,
      transparent: true,
      roughness: 0.22,
      metalness: 0.45,
      side: THREE.DoubleSide,
    });
    const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
    labelMesh.position.set(0, 1.72, 0);
    flaconRoot.add(labelMesh);

    // 4. POLISHED 18K GOLD HARDWARE MATERIALS
    const goldMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xf5d378), // Rich 18K Gold
      metalness: 0.98,
      roughness: 0.12,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      envMapIntensity: 2.0,
    });

    // Gold Neck Collar
    const collarGeo = new THREE.CylinderGeometry(0.72, 0.76, 0.38, 64);
    const collar = new THREE.Mesh(collarGeo, goldMat);
    collar.position.set(0, 3.6, 0);
    flaconRoot.add(collar);

    // Noir Silk Ribbon Accent Ring
    const ribbonGeo = new THREE.CylinderGeometry(0.74, 0.74, 0.15, 64);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0x081510,
      roughness: 0.65,
    });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.position.set(0, 3.6, 0);
    flaconRoot.add(ribbon);

    // Gold Ring Medallion clasp on ribbon
    const claspGeo = new THREE.TorusGeometry(0.12, 0.035, 16, 32);
    const clasp = new THREE.Mesh(claspGeo, goldMat);
    clasp.position.set(0, 3.6, 0.74);
    flaconRoot.add(clasp);

    // 5. DETAILED 18K GOLD ATOMIZER & NOZZLE (Revealed when Cap Lifts!)
    const nozzleGroup = new THREE.Group();
    nozzleGroup.position.set(0, 3.82, 0);
    flaconRoot.add(nozzleGroup);

    // Golden nozzle barrel
    const nozzleBarrelGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.45, 32);
    const nozzleBarrel = new THREE.Mesh(nozzleBarrelGeo, goldMat);
    nozzleBarrel.position.set(0, 0.22, 0);
    nozzleGroup.add(nozzleBarrel);

    // Golden push-button top
    const nozzleButtonGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.35, 32);
    const nozzleButton = new THREE.Mesh(nozzleButtonGeo, goldMat);
    nozzleButton.position.set(0, 0.55, 0);
    nozzleGroup.add(nozzleButton);

    // Tiny nozzle orifice hole on front
    const orificeGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.08, 16);
    const orificeMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const orifice = new THREE.Mesh(orificeGeo, orificeMat);
    orifice.rotation.x = Math.PI / 2;
    orifice.position.set(0, 0.58, 0.24);
    nozzleGroup.add(orifice);

    // 6. FACETED EMERALD-CUT DIAMOND CRYSTAL CAP (LIFTS UP & DOWN IN SMOOTH 3D ANIMATION)
    const capGroup = new THREE.Group();
    capGroup.position.set(0, 4.35, 0);
    capGroupRef.current = capGroup;
    flaconRoot.add(capGroup);

    // Crystal Cap Material with High Refraction & Diamond Bevel Highlights
    const capMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x101a15), // Deep emerald crystal flint tint - sharp diamond facets!
      transparent: true,
      opacity: 0.42, // Distinct, tangible crystal presence
      roughness: 0.01,
      ior: 1.65, // High diamond refraction
      flatShading: true, // Diamond-cut sparkle facets
      reflectivity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.015,
      envMapIntensity: 2.4,
    });

    // Lower faceted crystal body
    const capLowerGeo = new THREE.CylinderGeometry(0.86, 0.96, 0.85, 8);
    const capLower = new THREE.Mesh(capLowerGeo, capMaterial);
    capGroup.add(capLower);

    // Inner gold core inside the cap so 18K gold glints through the diamond crystal facets!
    const innerPlugGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.75, 32);
    const innerPlug = new THREE.Mesh(innerPlugGeo, goldMat);
    innerPlug.position.set(0, 0.4, 0);
    capGroup.add(innerPlug);

    // Inner gold lining inside the cap (visible from beneath when lifted!)
    const innerLiningGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.55, 32, 1, true);
    const innerLining = new THREE.Mesh(innerLiningGeo, goldMat);
    innerLining.position.set(0, -0.15, 0);
    capGroup.add(innerLining);

    // Upper beveled crystal crown
    const capUpperGeo = new THREE.CylinderGeometry(0.55, 0.86, 0.35, 8);
    const capUpper = new THREE.Mesh(capUpperGeo, capMaterial);
    capUpper.position.set(0, 0.58, 0);
    capGroup.add(capUpper);

    // Top Polished Flat Facet
    const capTopGeo = new THREE.CylinderGeometry(0.53, 0.55, 0.06, 8);
    const capTop = new THREE.Mesh(capTopGeo, capMaterial);
    capTop.position.set(0, 0.77, 0);
    capGroup.add(capTop);

    // DIRECT STUDIO LIGHTING RIG (Balanced for High-End Glass & Liquid Contrast)
    const keyLight = new THREE.DirectionalLight(0xfffdfa, 2.2);
    keyLight.position.set(-4.5, 6, 5);
    scene.add(keyLight);

    const backRimLight = new THREE.DirectionalLight(0xffeed6, 1.8);
    backRimLight.position.set(4.5, 5, -4);
    scene.add(backRimLight);

    const crownSparkle = new THREE.PointLight(0xffeedb, 2.2, 12);
    crownSparkle.position.set(1.5, 3.2, 3.5);
    scene.add(crownSparkle);

    const frontFill = new THREE.DirectionalLight(0xfff5ea, 0.85);
    frontFill.position.set(0, 1.8, 6);
    scene.add(frontFill);

    const ambientLight = new THREE.AmbientLight(0xfff7ee, 0.45);
    scene.add(ambientLight);

    // 3D PARTICLE MIST SYSTEM (Soft Golden Aerosol Mist when Cap Opens)
    const maxParticles = 200;
    const mistPositions = new Float32Array(maxParticles * 3);
    const mistGeometry = new THREE.BufferGeometry();
    mistGeometry.setAttribute("position", new THREE.BufferAttribute(mistPositions, 3));

    const mistCanvas = document.createElement("canvas");
    mistCanvas.width = 32;
    mistCanvas.height = 32;
    const mctx = mistCanvas.getContext("2d");
    if (mctx) {
      const gradient = mctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, "rgba(216, 185, 125, 0.95)");
      gradient.addColorStop(0.35, "rgba(235, 215, 175, 0.5)");
      gradient.addColorStop(1, "rgba(235, 215, 175, 0)");
      mctx.fillStyle = gradient;
      mctx.fillRect(0, 0, 32, 32);
    }
    const mistTexture = new THREE.CanvasTexture(mistCanvas);

    const mistMaterial = new THREE.PointsMaterial({
      size: 0.12,
      map: mistTexture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const mistPoints = new THREE.Points(mistGeometry, mistMaterial);
    scene.add(mistPoints);
    mistPointsRef.current = mistPoints;

    // POINTER & TOUCH 3D INTERACTION LISTENERS (Subtle, Natural Parallax)
    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const normX = (clientX / window.innerWidth) * 2 - 1;
      const normY = -(clientY / window.innerHeight) * 2 + 1;

      if (isPointerDown.current) {
        const dx = clientX - pointerStart.current.x;
        const dy = clientY - pointerStart.current.y;
        targetRot.current.y = pointerDelta.current.x + dx * 0.008;
        targetRot.current.x = THREE.MathUtils.clamp(
          pointerDelta.current.y + dy * 0.008,
          -0.3,
          0.3
        );
      } else {
        // Natural subtle cursor tilt
        targetRot.current.y = normX * 0.22;
        targetRot.current.x = 0.04 - normY * 0.15;
      }
    };

    const onPointerDownHandler = (e: MouseEvent | TouchEvent) => {
      isPointerDown.current = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      pointerStart.current = { x: clientX, y: clientY };
      pointerDelta.current = { x: targetRot.current.y, y: targetRot.current.x };
    };

    const onPointerUpHandler = () => {
      isPointerDown.current = false;
    };

    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("touchstart", onPointerDownHandler, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUpHandler);

    // GLTF LOADER FOR BLENDER-EXPORTED MODEL
    let mixer: THREE.AnimationMixer | null = null;
    let activeClip: THREE.AnimationClip | null = null;
    let activeAction: THREE.AnimationAction | null = null;
    let previousTime = performance.now();

    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      "/models/safa_perfume_flacon.glb",
      (gltf) => {
        // Swap procedural flacon with the exported Blender model
        flaconRoot.visible = false;
        const model = gltf.scene;

        // Auto-center and normalize model scale
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        model.position.sub(center);
        model.position.y += 0.2;

        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const targetHeight = 4.2;
          const s = targetHeight / maxDim;
          model.scale.set(s, s, s);
        }

        // Calibrate materials for photorealistic crystal glass & glowing amber liquid
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const processMat = (mat: THREE.Material) => {
                const m = mat as THREE.MeshPhysicalMaterial;

                // Crystal Glass (Bottle & Cap) - Crystal-clear, non-chalky glass!
                if (m.name.includes("Glass") || m.name.includes("Cap")) {
                  m.transmission = 0; // Fixes WebGL transparent canvas chalk-white bug!
                  m.transparent = true;
                  m.opacity = m.name.includes("Cap") ? 0.38 : 0.16; // Pure optical crystal clarity
                  m.roughness = 0.01;
                  m.ior = 1.54;
                  m.reflectivity = 0.98;
                  m.clearcoat = 1.0;
                  m.clearcoatRoughness = 0.015;
                  m.color.setHex(m.name.includes("Cap") ? 0x101a15 : 0x0e1411); // Deep crystal flint tint - completely eliminates white chalk/fog!
                  m.envMap = envMap;
                  m.envMapIntensity = 2.0;
                  mesh.renderOrder = 10;
                }
                // Perfume Liquid Extract & Meniscus
                else if (m.name.includes("Amber") || m.name.includes("Liquid") || m.name.includes("Extract")) {
                  m.transmission = 0;
                  m.transparent = true;
                  m.opacity = 0.96;
                  m.roughness = 0.03;
                  m.color.setHex(0xd45200); // Deep rich cognac amber
                  m.clearcoat = 1.0;
                  m.envMap = envMap;
                  m.envMapIntensity = 2.0;
                  mesh.renderOrder = 2;
                }
                // 18K Luxury Gold
                else if (m.name.includes("Gold")) {
                  m.metalness = 0.98;
                  m.roughness = 0.1;
                  m.color.setHex(0xf5c358);
                  m.clearcoat = 1.0;
                  m.envMap = envMap;
                  m.envMapIntensity = 2.4;
                  mesh.renderOrder = 4;
                }
                // Deep Noir Emerald
                else if (m.name.includes("Noir") || m.name.includes("Emerald")) {
                  m.color.setHex(0x0e281d);
                  m.roughness = 0.2;
                  m.clearcoat = 1.0;
                  m.envMap = envMap;
                  m.envMapIntensity = 1.2;
                  mesh.renderOrder = 4;
                } else {
                  if ("envMap" in m) {
                    (m as THREE.MeshStandardMaterial).envMap = envMap;
                  }
                }
                m.needsUpdate = true;
              };

              if (Array.isArray(mesh.material)) {
                mesh.material.forEach(processMat);
              } else {
                processMat(mesh.material);
              }
            }
          }
        });

        // Add warm internal glow light inside the liquid of the loaded model
        const innerGlow = new THREE.PointLight(0xff8822, 2.5, 4.0);
        innerGlow.position.set(0, 0, 0);
        model.add(innerGlow);

        masterFlaconGroup.add(model);

        // Bind cap elevation animation to page scroll
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          activeClip = gltf.animations[0];
          activeAction = mixer.clipAction(activeClip);
          activeAction.setLoop(THREE.LoopOnce, 1);
          activeAction.clampWhenFinished = true;
          activeAction.play();
        }
      },
      undefined,
      () => {
        // Procedural flacon remains active if GLB not yet generated
        flaconRoot.visible = true;
      }
    );

    // SCROLL LISTENER (Drives 3D cap elevation as user scrolls)
    const onScroll = () => {
      if (!mount) return;
      const rect = mount.getBoundingClientRect();
      const heroH = mount.clientHeight || window.innerHeight;
      const progress = Math.min(Math.max(-rect.top / (heroH * 0.75), 0), 1.0);
      scrollProgressRef.current = progress;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // RESIZE OBSERVER
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      const mobile = w < 768;

      camera.aspect = w / h;
      camera.position.z = mobile ? 9.6 : 8.2;
      camera.updateProjectionMatrix();

      const scale = mobile ? 0.46 : 0.54;
      masterFlaconGroup.scale.set(scale, scale, scale);

      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    // MAIN ANIMATION LOOP (Smooth Sine-Wave Cap Elevation & Breathing Float)
    const clock = new THREE.Clock();
    let lastSprayTrigger = 0;

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      const scrollProgress = scrollProgressRef.current;

      // Slower, majestic breathing float (Regal slow motion)
      const idleBob = Math.sin(elapsedTime * 0.45) * 0.025; // Slower frequency
      const idleSway = Math.cos(elapsedTime * 0.3) * 0.01;

      // Smooth physics Lerp interpolation for mouse tilt / drag
      currentRot.current.x += (targetRot.current.x - currentRot.current.x) * 0.04;
      currentRot.current.y += (targetRot.current.y - currentRot.current.y) * 0.04;
      currentRot.current.z += (targetRot.current.z - currentRot.current.z) * 0.04;

      // 3D perspective tilt responding dynamically to page scroll
      const scrollTilt = scrollProgress * 0.12;

      masterFlaconGroup.position.y = -0.2 + idleBob;
      masterFlaconGroup.rotation.x = currentRot.current.x + scrollTilt;
      masterFlaconGroup.rotation.y = currentRot.current.y + idleSway;
      masterFlaconGroup.rotation.z = currentRot.current.z;

      // SCROLL-DRIVEN CAP ELEVATION (Cap elevates UP in 3D when user scrolls down!)
      // At scroll = 0: cap is resting on bottle (4.35)
      // As user scrolls: cap opens smoothly to 6.2 in 3D space
      const idleHover = Math.sin(elapsedTime * 0.35) * 0.025;
      const targetCapY = 4.35 + scrollProgress * 1.85 + (scrollProgress < 0.05 ? Math.max(0, idleHover) : 0);

      // Slower luxury damping
      capCurrentY.current += (targetCapY - capCurrentY.current) * 0.05;

      if (capGroupRef.current) {
        capGroupRef.current.position.y = capCurrentY.current;

        // Subtle floating tilt when elevated in midair
        if (capCurrentY.current > 4.65) {
          capGroupRef.current.rotation.z = Math.sin(elapsedTime * 0.8) * 0.02;
          capGroupRef.current.rotation.x = Math.cos(elapsedTime * 0.6) * 0.015;
        } else {
          capGroupRef.current.rotation.z = 0;
          capGroupRef.current.rotation.x = 0;
        }
      }

      // Synchronize Blender GLB animation if loaded
      if (mixer && activeAction && activeClip) {
        const duration = activeClip.duration || 3.0;
        const targetTime = scrollProgress * duration;
        activeAction.time += (targetTime - activeAction.time) * 0.06;
        mixer.update(0);
      }

      // Trigger gentle golden aerosol mist when cap opens on scroll
      if (scrollProgress > 0.35 && elapsedTime - lastSprayTrigger > 0.1) {
        lastSprayTrigger = elapsedTime;
        const angle = (Math.random() - 0.5) * 0.6;
        const speed = 0.04 + Math.random() * 0.07;
        dropletsRef.current.push({
          x: (Math.random() - 0.5) * 0.04,
          y: 0.35 + (Math.random() - 0.5) * 0.02,
          z: 0.26 + Math.random() * 0.04,
          vx: Math.sin(angle) * speed,
          vy: 0.015 + Math.random() * 0.035,
          vz: Math.cos(angle) * speed + 0.03,
          alpha: 0.85,
          decay: 0.012 + Math.random() * 0.015,
        });
      }

      // Update 3D mist droplets
      const droplets = dropletsRef.current;
      const posAttr = mistGeometry.attributes.position as THREE.BufferAttribute;

      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        d.x += d.vx;
        d.y += d.vy;
        d.z += d.vz;
        d.vy -= 0.0008; // Gentle gravity
        d.alpha -= d.decay;

        if (d.alpha <= 0) {
          droplets.splice(i, 1);
        }
      }

      for (let i = 0; i < maxParticles; i++) {
        if (i < droplets.length) {
          posAttr.setXYZ(i, droplets[i].x, droplets[i].y, droplets[i].z);
        } else {
          posAttr.setXYZ(i, 0, -999, 0); // Hide offscreen
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("touchstart", onPointerDownHandler);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUpHandler);
      window.removeEventListener("resize", handleResize);

      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <section className="relative w-full h-[90vh] min-h-[620px] max-h-[980px] bg-gradient-to-b from-[#faf7f2] via-[#f7f1e7] to-[#ede2d2] text-[#0e281d] overflow-hidden flex items-center justify-center select-none">
      {/* 1. SEAMLESS LUXURY ATELIER STUDIO LIGHTING (Warm Silk & Champagne Studio) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Warm Blush Glow behind the flacon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75vw] h-[75vw] max-w-[850px] max-h-[850px] rounded-full bg-radial from-[#ebd7cd]/60 via-[#f5ede4]/30 to-transparent blur-3xl" />
        {/* Regal Champagne Gold Radiance */}
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-radial from-[#dfc59b]/35 via-[#ebdcc2]/15 to-transparent blur-2xl" />
        {/* Soft Polished Studio Floor Shadow / Pedestal */}
        <div className="absolute bottom-[13%] left-1/2 -translate-x-1/2 w-[380px] sm:w-[500px] h-[50px] rounded-[100%] bg-radial from-[#2a221b]/22 via-[#473a2e]/06 to-transparent blur-lg" />
        {/* Studio vignette blending smoothly into #faf7f2 */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#faf7f2]/10 to-[#ede3d4]/30" />
      </div>

      {/* 2. ARCHITECTURAL 3D BACKGROUND WATERMARK (Deep Spatial Depth Layer) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
        <span className="text-[22vw] font-serif font-black tracking-[0.22em] text-[#0e281d]/[0.045] uppercase select-none leading-none translate-y-[-2%]">
          SAFA
        </span>
      </div>

      {/* 3. REFINED 3D EDITORIAL TYPOGRAPHY (Flanking the Flacon with True Spatial Harmony) */}
      <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-6 sm:p-10 lg:p-16 max-w-7xl mx-auto w-full">
        {/* Desktop Dual-Flank Layout: Perfectly frames the 3D bottle without blocking it */}
        <div className="hidden md:flex justify-between items-center w-full h-full pt-4">
          {/* Left Flank: Collection Title & Artisanal Story */}
          <div className="max-w-[280px] lg:max-w-xs flex flex-col items-start text-left space-y-3">
            <div className="flex items-center gap-2 text-[#b39b66] text-[10px] lg:text-[11px] uppercase tracking-[0.35em] font-mono font-medium">
              <span className="w-6 h-[1px] bg-[#b39b66]" />
              RÉSERVE PRIVÉE
            </div>
            <h1 className="text-3xl lg:text-5xl font-serif text-[#0e281d] leading-[1.08] font-[Galsod] uppercase tracking-wide">
              Crafted for<br />
              <span className="text-[#b39b66] italic font-normal font-serif lowercase">distinction.</span>
            </h1>
            <p className="text-xs text-[#5a6b63] tracking-wider leading-relaxed font-sans pt-1">
              Hand-decanted perfume extract steeped in heavy optical crystal, crowned with 18K royal gold.
            </p>
          </div>

          {/* Right Flank: Concentration & Interactive Scroll Directive */}
          <div className="max-w-[280px] lg:max-w-xs flex flex-col items-end text-right space-y-3">
            <div className="flex items-center gap-2 text-[#b39b66] text-[10px] lg:text-[11px] uppercase tracking-[0.35em] font-mono font-medium">
              HAUTE PARFUMERIE
              <span className="w-6 h-[1px] bg-[#b39b66]" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-serif text-[#0e281d] leading-none font-[Galsod] uppercase tracking-wide">
              35% Pure Oil
            </h2>
            <p className="text-xs text-[#b39b66] tracking-[0.3em] uppercase font-mono">
              EXTRAIT DE PARFUM
            </p>
            <div className="pt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#73857b] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b39b66] animate-pulse" />
              Scroll down to uncap
            </div>
          </div>
        </div>

        {/* Mobile Editorial Layout (Clean & Balanced) */}
        <div className="md:hidden flex flex-col justify-between items-center text-center h-full py-4">
          <div className="pt-2 space-y-1">
            <span className="text-[10px] tracking-[0.35em] uppercase text-[#b39b66] font-mono font-medium">
              — SAFA HAUTE PARFUMERIE —
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#0e281d] uppercase font-[Galsod] tracking-wide">
              Crafted for <span className="text-[#b39b66] italic font-normal">Distinction</span>
            </h1>
          </div>
          <div className="pb-2">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#73857b] font-mono">
              Scroll to uncap flacon ↓
            </span>
          </div>
        </div>
      </div>

      {/* 4. THREE.JS 3D CANVAS MOUNT (Interactive Luxury Flacon with Scroll-Driven Cap Elevation) */}
      <div
        ref={mountRef}
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing flex items-center justify-center"
        title="Scroll down to uncap • Drag to orbit in 3D"
      />

      {/* 5. BOTTOM 3D SCROLL INDICATOR */}
      <div className="hidden sm:flex absolute bottom-5 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 pointer-events-none z-20 opacity-80">
        <span className="text-[9px] tracking-[0.35em] uppercase text-[#7a8c82] font-mono flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-[#b39b66]" />
          SCROLL TO UNCAP FLACON
          <span className="w-1 h-1 rounded-full bg-[#b39b66]" />
        </span>
        <div className="w-[1px] h-5 bg-gradient-to-b from-[#b39b66] to-transparent animate-bounce" />
      </div>
    </section>
  );
}
