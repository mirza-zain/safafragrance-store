'use client';

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

export default function Safa3DHero() {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameId = useRef<number | null>(null);

  // Interaction references for smooth natural mouse tilt and drag orbit
  const isPointerDown = useRef(false);
  const pointerStart = useRef({ x: 0, y: 0 });
  const pointerDelta = useRef({ x: 0, y: 0 });
  const targetRot = useRef({ x: 0.03, y: 0.0, z: 0.0 });
  const currentRot = useRef({ x: 0.03, y: 0.0, z: 0.0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const isMobile = width < 768;
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0, isMobile ? 9.2 : 7.8);
    camera.lookAt(0, 0, 0);

    // WebGL Renderer with High-End Color Management & ACES Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // CREATE SEAMLESS LUXURY STUDIO ENVIRONMENT MAP (Warm Champagne & Softbox Atelier)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envCanvas = document.createElement("canvas");
    envCanvas.width = 1024;
    envCanvas.height = 512;
    const envCtx = envCanvas.getContext("2d");
    if (envCtx) {
      // Atmospheric warm champagne & silk studio gradient
      const bgGrad = envCtx.createLinearGradient(0, 0, 0, 512);
      bgGrad.addColorStop(0, "#f9f4eb");
      bgGrad.addColorStop(0.5, "#eee5d8");
      bgGrad.addColorStop(1, "#dfd3c1");
      envCtx.fillStyle = bgGrad;
      envCtx.fillRect(0, 0, 1024, 512);

      // Key Softbox: Razor-sharp tall vertical white light strip on the left
      const leftSoftbox = envCtx.createLinearGradient(120, 0, 300, 0);
      leftSoftbox.addColorStop(0, "rgba(255, 255, 255, 0)");
      leftSoftbox.addColorStop(0.25, "rgba(255, 255, 255, 1)");
      leftSoftbox.addColorStop(0.75, "rgba(255, 255, 255, 1)");
      leftSoftbox.addColorStop(1, "rgba(255, 255, 255, 0)");
      envCtx.fillStyle = leftSoftbox;
      envCtx.fillRect(120, 30, 180, 452);

      // Rim Softbox: Warm champagne vertical softbox strip on the right
      const rightSoftbox = envCtx.createLinearGradient(720, 0, 880, 0);
      rightSoftbox.addColorStop(0, "rgba(255, 248, 235, 0)");
      rightSoftbox.addColorStop(0.3, "rgba(255, 248, 235, 0.95)");
      rightSoftbox.addColorStop(0.7, "rgba(255, 248, 235, 0.95)");
      rightSoftbox.addColorStop(1, "rgba(255, 248, 235, 0)");
      envCtx.fillStyle = rightSoftbox;
      envCtx.fillRect(720, 50, 160, 412);

      // Overhead Skylight: Top highlight for royal crown gold facets
      const topLight = envCtx.createRadialGradient(512, 80, 20, 512, 80, 220);
      topLight.addColorStop(0, "rgba(255, 255, 255, 1)");
      topLight.addColorStop(0.5, "rgba(255, 255, 255, 0.7)");
      topLight.addColorStop(1, "rgba(255, 255, 255, 0)");
      envCtx.fillStyle = topLight;
      envCtx.fillRect(256, 0, 512, 220);

      // Warm Rose-Gold Bounce (Reflects up into blush flacon base)
      const bottomWarm = envCtx.createRadialGradient(512, 450, 20, 512, 450, 260);
      bottomWarm.addColorStop(0, "rgba(235, 195, 170, 0.85)");
      bottomWarm.addColorStop(0.6, "rgba(215, 175, 150, 0.35)");
      bottomWarm.addColorStop(1, "rgba(255, 255, 255, 0)");
      envCtx.fillStyle = bottomWarm;
      envCtx.fillRect(256, 280, 512, 232);
    }
    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    const envMap = pmremGenerator.fromEquirectangular(envTexture).texture;
    scene.environment = envMap;
    pmremGenerator.dispose();
    envTexture.dispose();

    // MASTER BOTTLE GROUP (Centered Pivot & Proportionate Scale)
    const masterFlaconGroup = new THREE.Group();
    masterFlaconGroup.position.set(0, 0.05, 0);
    const initialScale = isMobile ? 0.44 : 0.52;
    masterFlaconGroup.scale.set(initialScale, initialScale, initialScale);
    scene.add(masterFlaconGroup);

    // CONTAINER FOR AUTHENTIC DOWNLOADED 3D GLB MODEL
    const glbContainer = new THREE.Group();
    masterFlaconGroup.add(glbContainer);

    // Asynchronously load the authentic GLB model with MeshoptDecoder
    let isCancelled = false;
    const loadModel = async () => {
      try {
        await MeshoptDecoder.ready;
        if (isCancelled) return;

        const loader = new GLTFLoader();
        loader.setMeshoptDecoder(MeshoptDecoder);

        loader.load(
          "/models/safa_perfume.glb",
          (gltf) => {
            if (isCancelled) return;

            const textureLoader = new THREE.TextureLoader();
            const metalnessMap = textureLoader.load("/models/safa_metalness.jpg");
            const roughnessMap = textureLoader.load("/models/safa_roughness.jpg");
            metalnessMap.flipY = false;
            roughnessMap.flipY = false;

            gltf.scene.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                const oldMat = mesh.material as THREE.MeshStandardMaterial;

                // Ultra-luxury PBR Physical material: 18K gold crown reflections + crystal glass glaze
                const physicalMat = new THREE.MeshPhysicalMaterial({
                  map: oldMat.map,
                  normalMap: oldMat.normalMap,
                  normalScale: new THREE.Vector2(2.4, 2.4), // deep 3D filigree relief
                  metalnessMap: metalnessMap,
                  metalness: 1.0,
                  roughnessMap: roughnessMap,
                  roughness: 1.0,
                  clearcoat: 0.92, // crystal glass / lacquer gloss finish
                  clearcoatRoughness: 0.1,
                  envMapIntensity: 1.85, // catches dynamic studio softboxes
                });

                mesh.material = physicalMat;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
              }
            });

            // Center and scale the model neatly in viewport
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            const targetHeight = 4.1;
            const s = targetHeight / (size.y || 1);
            gltf.scene.scale.set(s, s, s);

            // Dedicated pivot group to ensure rotation pivots exactly around the model's geometrical center:
            const modelPivot = new THREE.Group();
            glbContainer.add(modelPivot);

            // Center the model relative to pivot
            gltf.scene.position.set(-center.x * s, -center.y * s, -center.z * s);
            modelPivot.add(gltf.scene);

            // Rotate by -90 degrees (-Math.PI / 2) to bring the FRONT of the box & bottle facing the user!
            modelPivot.rotation.y = -Math.PI / 2 + 0.12;
          },
          undefined,
          (err) => {
            console.warn("GLB load notice:", err);
          }
        );
      } catch (err) {
        console.warn("Meshopt initialization notice:", err);
      }
    };

    loadModel();

    // DIRECT STUDIO LIGHTING RIG (Balanced for Silk Alabaster & Warm Gold Atelier)
    const keyLight = new THREE.DirectionalLight(0xfffdfa, 2.8);
    keyLight.position.set(-4.5, 6, 5);
    scene.add(keyLight);

    const backRimLight = new THREE.DirectionalLight(0xf7f0e4, 2.0);
    backRimLight.position.set(4.5, 5, -4);
    scene.add(backRimLight);

    const crownSparkle = new THREE.PointLight(0xffeedb, 2.6, 12);
    crownSparkle.position.set(1.5, 3.2, 3.5);
    scene.add(crownSparkle);

    const frontFill = new THREE.DirectionalLight(0xfff8ed, 1.4);
    frontFill.position.set(0, 1.8, 6);
    scene.add(frontFill);

    const ambientLight = new THREE.AmbientLight(0xfff7ee, 1.05);
    scene.add(ambientLight);

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
        targetRot.current.x = 0.03 - normY * 0.15;
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

    // RESIZE OBSERVER
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      const mobile = w < 768;

      camera.aspect = w / h;
      camera.position.z = mobile ? 9.2 : 7.8;
      camera.updateProjectionMatrix();

      const scale = mobile ? 0.44 : 0.52;
      masterFlaconGroup.scale.set(scale, scale, scale);

      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    // MAIN ANIMATION LOOP
    const clock = new THREE.Clock();
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth physics Lerp interpolation
      currentRot.current.x += (targetRot.current.x - currentRot.current.x) * 0.06;
      currentRot.current.y += (targetRot.current.y - currentRot.current.y) * 0.06;
      currentRot.current.z += (targetRot.current.z - currentRot.current.z) * 0.06;

      // Ambient luxury breathing float
      const idleBob = Math.sin(elapsedTime * 1.1) * 0.05;
      const idleSway = Math.cos(elapsedTime * 0.7) * 0.015;

      masterFlaconGroup.position.y = 0.05 + idleBob;
      masterFlaconGroup.rotation.x = currentRot.current.x;
      masterFlaconGroup.rotation.y = currentRot.current.y + idleSway;
      masterFlaconGroup.rotation.z = currentRot.current.z;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isCancelled = true;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
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
    <section className="relative w-full h-[88vh] min-h-[580px] max-h-[960px] bg-gradient-to-b from-[#faf7f2] via-[#f7f1e7] to-[#ede2d2] text-[#0e281d] overflow-hidden flex items-center justify-center select-none">
      {/* 1. SEAMLESS LUXURY ATELIER STUDIO LIGHTING (Warm Silk & Champagne Studio) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Warm Blush Glow behind the flacon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75vw] h-[75vw] max-w-[850px] max-h-[850px] rounded-full bg-radial from-[#ebd7cd]/65 via-[#f5ede4]/35 to-transparent blur-3xl" />
        {/* Regal Champagne Gold Radiance */}
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-radial from-[#dfc59b]/40 via-[#ebdcc2]/20 to-transparent blur-2xl" />
        {/* Soft Polished Studio Floor Shadow / Pedestal */}
        <div className="absolute bottom-[13%] left-1/2 -translate-x-1/2 w-[420px] sm:w-[560px] h-[55px] rounded-[100%] bg-radial from-[#2a221b]/20 via-[#473a2e]/06 to-transparent blur-lg" />
        {/* Studio vignette blending smoothly into #faf7f2 */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#faf7f2]/10 to-[#ede3d4]/30" />
      </div>

      {/* 2. REFINED EDITORIAL TYPOGRAPHY (Cohesively Integrated with Safa Brand Colors) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0 px-4 sm:px-8 max-w-full overflow-hidden">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Main Title: CRAFTED FOR DISTINCTION with champagne gold accent */}
          <h1 className="text-[clamp(2.2rem,7.5vw,6.5rem)] font-bold uppercase tracking-[0.06em] sm:tracking-[0.12em] leading-none text-[#0e281d] font-[Galsod] text-center drop-shadow-[0_2px_20px_rgba(14,40,29,0.06)]">
            Crafted For <span className="text-[#b39b66] drop-shadow-[0_2px_15px_rgba(179,155,102,0.22)]">Distinction</span>
          </h1>

          {/* Second Brand Line: SAFA PERFUMES */}
          <p className="text-[clamp(0.75rem,2.2vw,1.6rem)] font-semibold uppercase tracking-[0.35em] sm:tracking-[0.55em] text-[#b39b66] mt-3 sm:mt-5 text-center font-sans">
            S A F A &nbsp; P E R F U M E S
          </p>

          {/* Concentration tag */}
          <p className="mt-3 text-[9px] sm:text-xs tracking-[0.25em] sm:tracking-[0.4em] uppercase text-[#61736b] font-mono text-center">
            EXTRAIT DE PARFUM • 35% PURE OIL CONCENTRATE
          </p>
        </div>
      </div>

      {/* 3. THREE.JS 3D CANVAS MOUNT (Interactive 3D Flacon & Box with Smooth Parallax Orbit) */}
      <div
        ref={mountRef}
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing flex items-center justify-center"
        title="Drag to orbit in 3D"
      />
    </section>
  );
}
