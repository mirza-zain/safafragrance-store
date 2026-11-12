'use client';

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

interface SprayParticle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
}

export default function Safa3DHero() {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameId = useRef<number | null>(null);

  // Interaction references for natural mouse tilt and drag orbit
  const isPointerDown = useRef(false);
  const pointerStart = useRef({ x: 0, y: 0 });
  const pointerDelta = useRef({ x: 0, y: 0 });
  const pointerMoveDist = useRef(0);
  const pointerDownTime = useRef(0);
  const targetRot = useRef({ x: 0.04, y: 0.0, z: 0.0 });
  const currentRot = useRef({ x: 0.04, y: 0.0, z: 0.0 });

  // Scroll and manual click uncap progress
  const scrollProgressRef = useRef(0);
  const manualUncapTarget = useRef(0);
  const manualUncapCurrent = useRef(0);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const capNodeRef = useRef<THREE.Object3D | null>(null);
  const nozzleNodeRef = useRef<THREE.Object3D | null>(null);
  const capCurrentY = useRef(0);

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
    camera.position.set(0, 0.35, isMobile ? 10.4 : 8.6);
    camera.lookAt(0, 0.15, 0);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    // -----------------------------------------------------------------------
    // STUDIO LIGHTING RIG (Balanced so Colors Stay Rich, Saturated & Deep)
    // -----------------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffeedb, 0.55);
    scene.add(ambientLight);

    // Key Light: Crisp directional studio light from upper-right front
    const keyLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    keyLight.position.set(3.5, 6.0, 5.0);
    scene.add(keyLight);

    // Warm Golden Accent Backlight: Soft rim lighting around the silhouette
    const rimBacklight = new THREE.DirectionalLight(0xffb347, 0.75);
    rimBacklight.position.set(0, 1.5, -4.0);
    scene.add(rimBacklight);

    // Fill Light: Soft warm fill for the left flank
    const fillLight = new THREE.DirectionalLight(0xffeed4, 0.70);
    fillLight.position.set(-4, 3, 4);
    scene.add(fillLight);

    // Top Rim Light: Catches the 24K gold crown arches and crystal shoulder
    const topRimLight = new THREE.DirectionalLight(0xfff5e6, 0.85);
    topRimLight.position.set(0, 6, -3);
    scene.add(topRimLight);

    // Environment Map: a neutral studio room gives the gold and glass real reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envMap = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    scene.environment = envMap;
    pmremGenerator.dispose();
    (roomEnv as unknown as { dispose?: () => void }).dispose?.();

    // -----------------------------------------------------------------------
    // MASTER BOTTLE STAGE GROUP
    // -----------------------------------------------------------------------
    const masterStage = new THREE.Group();
    masterStage.position.set(0, -0.15, 0);
    const initialScale = isMobile ? 0.62 : 0.78;
    masterStage.scale.set(initialScale, initialScale, initialScale);
    scene.add(masterStage);

    const modelPivot = new THREE.Group();
    masterStage.add(modelPivot);

    // Textures loading
    const textureLoader = new THREE.TextureLoader();

    // Decal texture for the emerald-green & gold calligraphy
    const decalTex = textureLoader.load("/images/safa-bottle-decal.png");
    decalTex.colorSpace = THREE.SRGBColorSpace;
    decalTex.flipY = false;

    // Shared 24K Royal Gold Material for accents
    const royalGoldMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xe5b842), // Lustrous 24K Royal Gold
      metalness: 0.98,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      envMapIntensity: 2.2,
    });

    // Soft blurred circular mist droplet texture for atomized fragrance spray
    const sprayDropletTex = textureLoader.load("/images/spray_droplet.png");

    // -----------------------------------------------------------------------
    // LOAD THE AUTHENTIC EXPORTED BLENDER 3D MODEL
    // -----------------------------------------------------------------------
    let isCancelled = false;
    const loader = new GLTFLoader();

    loader.load(
      "/models/safa_perfume_v3.glb",
      (gltf) => {
        if (isCancelled) return;

        // Traverse and enhance each authentic Blender material with high precision
        gltf.scene.traverse((child) => {
          // Identify Crown Cap for uncap elevation
          if (child.name.includes("Crown_Cap") || child.name.includes("Royal_Crown")) {
            capNodeRef.current = child;
            child.position.y = 0; // firmly seated initially
          }

          // Identify Nozzle for exact spray emission origin
          if (child.name.includes("Nozzle") || child.name.includes("Atomizer_Nozzle")) {
            nozzleNodeRef.current = child;
          }

          // Hide all static/looping Blender mist geometry (droplets & plume)
          if (
            child.name.includes("Mist") ||
            child.name.includes("Spray") ||
            child.name.includes("Plume") ||
            child.name.includes("Droplet")
          ) {
            child.visible = false;
          }

          // Hide the 3D mesh flowers completely - a clean, pure flacon podium looks 100x more premium
          if (
            child.name.includes("Rose") ||
            child.name.includes("Flower") ||
            child.name.includes("Leaf") ||
            child.name.includes("Floor_Petal") ||
            child.name.includes("Flowing_Petal")
          ) {
            child.visible = false;
          }

          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const matName = (mesh.material as THREE.Material)?.name || "";
            const meshName = mesh.name || "";
            const parentName = mesh.parent?.name || "";

            // Skip processing hidden flower meshes
            if (
              meshName.includes("Rose") ||
              parentName.includes("Rose") ||
              matName.includes("Rose") ||
              matName.includes("Leaf")
            ) {
              mesh.visible = false;
              return;
            }

            // 1. Crown Apex Jewel: must be tested BEFORE gold because its name contains "Crown"
            if (matName.includes("Jewel") || meshName.includes("Jewel") || child.name.includes("Jewel")) {
              mesh.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0x0d9668),
                emissive: new THREE.Color(0x065f46),
                emissiveIntensity: 0.9,
                roughness: 0.03,
                metalness: 0.05,
                clearcoat: 1.0,
                clearcoatRoughness: 0.02,
                envMapIntensity: 2.0,
                ior: 1.58,
              });
            }
            // 2. Crystal glass: Heavy luxury optical crystal flacon body with solid crystal sham base
            else if (meshName.includes("Safa_Bottle_Glass") || meshName.includes("Crystal_Base")) {
              const isBaseSham = meshName.includes("Crystal_Base");
              // Luxury French crystal: clear optical glass with subtle golden-crystal warmth & sharp diamond reflections
              const glassMat = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(isBaseSham ? 0xf9f7f2 : 0xfcfbf8),
                metalness: 0.0,
                roughness: 0.02,
                clearcoat: 1.0,
                clearcoatRoughness: 0.02,
                ior: 1.54,
                envMapIntensity: 2.6,
                transparent: true,
                // Natural crystal transparency: allows the glowing cognac essence to be seen with true optical depth
                opacity: isBaseSham ? 0.40 : 0.20,
                depthWrite: false,
              });
              glassMat.onBeforeCompile = (shader) => {
                const marker = shader.fragmentShader.includes("#include <opaque_fragment>")
                  ? "#include <opaque_fragment>"
                  : "#include <output_fragment>";
                shader.fragmentShader = shader.fragmentShader.replace(
                  marker,
                  marker + `
                  // Heavy lead-crystal fresnel: sharp glass edge reflections & crystal facet gleam
                  float nd = clamp(abs(dot(normalize(vNormal), normalize(vViewPosition))), 0.0, 1.0);
                  float glassFres = pow(1.0 - nd, 3.2);
                  float glassSpec = clamp(dot(outgoingLight, vec3(0.3333)), 0.0, 1.0);
                  
                  // Warm champagne crystal glint
                  gl_FragColor.rgb += vec3(1.0, 0.95, 0.86) * (glassFres * 0.75 + glassSpec * 0.35);
                  gl_FragColor.a = clamp(gl_FragColor.a + glassFres * 0.70, 0.0, 0.85);`
                );
              };
              mesh.material = glassMat;
              mesh.renderOrder = 3;
            }
            // 3. Perfume liquid: Luminous rich cognac-amber & golden champagne essence
            else if (
              matName.includes("Liquid") ||
              matName.includes("Champagne") ||
              meshName.includes("Liquid")
            ) {
              // Liquid is an organic, translucent essence with high internal luminosity and light transmission
              const liquidMat = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0xd97706), // Radiant warm amber
                emissive: new THREE.Color(0x92400e), // Deep rich cognac heart
                emissiveIntensity: 0.60,
                roughness: 0.05,
                metalness: 0.0,
                clearcoat: 1.0,
                clearcoatRoughness: 0.02,
                envMapIntensity: 1.8,
                transparent: true,
                opacity: 0.88, // Translucent perfume extract - not a flat solid block!
                depthWrite: false,
              });
              liquidMat.onBeforeCompile = (shader) => {
                const marker = shader.fragmentShader.includes("#include <opaque_fragment>")
                  ? "#include <opaque_fragment>"
                  : "#include <output_fragment>";
                shader.fragmentShader = shader.fragmentShader.replace(
                  marker,
                  marker + `
                  // Luxury liquid optical depth: rich dark cognac at the edges, glowing golden champagne in the center
                  float liqView = clamp(abs(dot(normalize(vNormal), normalize(vViewPosition))), 0.0, 1.0);
                  vec3 deepCognac = vec3(0.55, 0.22, 0.04);
                  vec3 warmAmber = vec3(0.88, 0.52, 0.08);
                  vec3 champagneGold = vec3(0.98, 0.82, 0.35);
                  
                  // Internal radiance gradient based on optical path length
                  vec3 coreLiquid = mix(deepCognac, warmAmber, pow(liqView, 0.8));
                  coreLiquid = mix(coreLiquid, champagneGold, pow(liqView, 2.2) * 0.45);
                  
                  gl_FragColor.rgb = mix(coreLiquid, gl_FragColor.rgb, 0.35) + champagneGold * 0.15;
                  gl_FragColor.a = mix(0.92, 0.78, liqView);`
                );
              };
              mesh.material = liquidMat;
              mesh.renderOrder = 2;
            }
            // 3b. Dip tube
            else if (meshName.includes("Dip_Tube") || child.name.includes("Dip_Tube")) {
              mesh.visible = false;
            }
            // 4. Polished 24K Royal Gold (Hermite Crown, Atomizer Nozzle, Collar, Base Rim)
            else if (
              matName.includes("Gold") ||
              meshName.includes("Gold") ||
              meshName.includes("Crown") ||
              meshName.includes("Nozzle") ||
              meshName.includes("Collar") ||
              parentName.includes("Crown") ||
              child.name.includes("Crown") ||
              child.name.includes("Nozzle") ||
              child.name.includes("Collar")
            ) {
              mesh.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0xd4af37), // Pure 24K Polished Gold
                metalness: 1.0,
                roughness: 0.10,
                clearcoat: 1.0,
                clearcoatRoughness: 0.03,
                envMapIntensity: 2.5,
                emissive: new THREE.Color(0x5a3d0a),
                emissiveIntensity: 0.15,
              });
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
            // 5. English Rose - Deep French Crimson Core (Petite & Velvety)
            else if (matName.includes("Blush_Core") || meshName.includes("Blush_Core")) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x991b1b), // Deep velvet crimson
                roughness: 0.45,
                metalness: 0.02,
                side: THREE.DoubleSide,
              });
            }
            // 6. English Rose - Soft Petal Pink (Gentle gradient blush)
            else if (
              matName.includes("Blush_Outer") ||
              (matName.includes("Blush") && !matName.includes("Core")) ||
              meshName.includes("Blush")
            ) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0xf472b6), // Soft delicate blush pink
                roughness: 0.40,
                metalness: 0.02,
                side: THREE.DoubleSide,
              });
            }
            // 7. Garden Peony - Honey Pollen Center
            else if (matName.includes("Ivory_Core") || meshName.includes("Ivory_Core")) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0xd97706),
                emissive: new THREE.Color(0x78350f),
                emissiveIntensity: 0.3,
                roughness: 0.40,
                side: THREE.DoubleSide,
              });
            }
            // 8. Garden Peony - Fine Silk Porcelain White
            else if (
              matName.includes("Ivory_Outer") ||
              (matName.includes("Ivory") && !matName.includes("Core")) ||
              meshName.includes("Ivory")
            ) {
              mesh.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0xfffdfa),
                roughness: 0.28,
                clearcoat: 0.8,
                side: THREE.DoubleSide,
              });
            }
            // 9. Calyx Leaves - Deep Emerald Garden Foliage
            else if (matName.includes("Leaf") || meshName.includes("Leaf")) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0x064e3b), // Deep luxury forest emerald
                roughness: 0.40,
                side: THREE.DoubleSide,
              });
            }
            // 10. Front Brand Logo Decal: Striking Rich Emerald Green Calligraphy
            // High contrast against champagne liquid, matching the official brand color & logo header!
            else if (matName.includes("Decal") || meshName.includes("Label") || child.name.includes("Label")) {
              mesh.material = new THREE.MeshStandardMaterial({
                map: decalTex,
                color: new THREE.Color(0x0a3d2e), // Deep Haute Emerald Green
                transparent: true,
                alphaTest: 0.04,
                roughness: 0.22,
                metalness: 0.35,
                emissive: new THREE.Color(0x04241b), // Rich emerald depth
                emissiveIntensity: 0.45,
                side: THREE.DoubleSide,
                polygonOffset: true,
                polygonOffsetFactor: -4,
                polygonOffsetUnits: -4,
                depthWrite: false,
                depthTest: true,
              });
              mesh.renderOrder = 10;
            }
          }
        });

        // Center and scale the Blender geometry to fit the viewport majestically
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const targetHeight = 4.8;
        const s = targetHeight / (size.y || 1);
        gltf.scene.scale.set(s, s, s);
        gltf.scene.position.set(-center.x * s, -center.y * s + 0.15, -center.z * s);
        modelPivot.add(gltf.scene);

        // SETUP BLENDER ANIMATIONS:
        // Play ONLY the gentle ambient floating rose petals.
        // DO NOT play the cap lifting or mist plume clips on an automatic loop!
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(gltf.scene);
          mixerRef.current = mixer;

          gltf.animations.forEach((clip) => {
            if (clip.name.includes("Petal")) {
              const action = mixer.clipAction(clip);
              action.setEffectiveTimeScale(0.85);
              action.play();
            }
          });
        }
      },
      undefined,
      (err) => {
        console.warn("Notice loading 3D Flacon GLB:", err);
      }
    );

    // -----------------------------------------------------------------------
    // SPRAY MIST PARTICLES: Soft atomized golden fragrance mist
    // Activates ONLY when the cap goes up, spraying horizontally to the right!
    // -----------------------------------------------------------------------
    const particleCount = 280;
    const sprayParticles: SprayParticle[] = [];
    const particlePositions = new Float32Array(particleCount * 3);

    const resetParticle = (p: SprayParticle, origin: THREE.Vector3) => {
      p.pos.copy(origin);
      // Fine atomized plume to the RIGHT flank:
      // High initial velocity that bursts outwards, expanding into a soft mist cone
      const sideSpeed = 0.075 + Math.random() * 0.095;
      const spreadY = (Math.random() - 0.5) * 0.28;
      const spreadZ = (Math.random() - 0.5) * 0.24;

      p.vel.set(
        sideSpeed,                           // spray direction: right
        spreadY * sideSpeed + 0.006,         // fine vertical cone fan + gentle initial rise
        spreadZ * sideSpeed                  // 3D depth cone dispersion
      );
      p.life = 0;
      p.maxLife = 36 + Math.random() * 28;
      p.size = 0.35 + Math.random() * 0.30;
    };

    const initialOrigin = new THREE.Vector3(0, 1.25, 0.05);
    for (let i = 0; i < particleCount; i++) {
      const p: SprayParticle = {
        pos: new THREE.Vector3(0, 1.25, 0.05),
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 45,
        size: 0.35,
      };
      resetParticle(p, initialOrigin);
      p.life = Math.random() * p.maxLife; // stagger lifecycle
      sprayParticles.push(p);

      particlePositions[i * 3] = p.pos.x;
      particlePositions[i * 3 + 1] = p.pos.y;
      particlePositions[i * 3 + 2] = p.pos.z;
    }

    const sprayGeo = new THREE.BufferGeometry();
    sprayGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const sprayMat = new THREE.PointsMaterial({
      map: sprayDropletTex,
      color: 0xffe6a3, // Luminous golden-champagne fragrance mist
      size: 0.38,
      transparent: true,
      opacity: 0.0, // Strictly 0.0 when cap is closed!
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sprayPoints = new THREE.Points(sprayGeo, sprayMat);
    sprayPoints.visible = false;
    sprayPoints.renderOrder = 20; // Ensure visible above glass and background
    modelPivot.add(sprayPoints);

    // -----------------------------------------------------------------------
    // FLYING ROSE PETALS ALL AROUND THE SITE (Cinematic 3D Swarm)
    // -----------------------------------------------------------------------
    interface FlyingPetalData {
      mesh: THREE.Mesh;
      pos: THREE.Vector3;
      vel: THREE.Vector3;
      rotVel: THREE.Vector3;
      phase: number;
      swaySpeed: number;
      swayAmp: number;
    }

    const flyingPetals: FlyingPetalData[] = [];
    const flyingPetalsGroup = new THREE.Group();
    scene.add(flyingPetalsGroup);

    // Curved organic 3D rose petal geometry (gentle natural petal curvature)
    const createPetalGeometry = (w = 0.28, l = 0.38, curv = 0.08) => {
      const geo = new THREE.PlaneGeometry(w, l, 6, 6);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i) / (w * 0.5);
        const y = pos.getY(i) / (l * 0.5);
        // Realistic teardrop/cup shaped petal taper
        const taper = Math.max(0.0, 1.0 - y * 0.35);
        pos.setX(i, pos.getX(i) * taper);
        const cup = (1.0 - x * x) * Math.sin((y * 0.5 + 0.5) * Math.PI);
        pos.setZ(i, -cup * curv);
      }
      geo.computeVertexNormals();
      return geo;
    };

    const petalGeo = createPetalGeometry(0.28, 0.38, 0.08);

    // Natural Soft Rose Petal Materials (Soft Pink, Blush Rose & Delicate Ivory)
    const petalMaterials = [
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xf48fb1), // Soft Blush Pink
        roughness: 0.55,
        metalness: 0.01,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xe57373), // Gentle Rose Coral
        roughness: 0.52,
        metalness: 0.01,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xfff3e0), // Soft Ivory Petal
        roughness: 0.45,
        metalness: 0.01,
        side: THREE.DoubleSide,
      }),
    ];

    const petalCount = 18; // Clean, elegant count - not too crowded
    for (let i = 0; i < petalCount; i++) {
      const mat = petalMaterials[i % petalMaterials.length];
      const pMesh = new THREE.Mesh(petalGeo, mat);
      const scaleRand = 0.65 + Math.random() * 0.45;
      pMesh.scale.set(scaleRand, scaleRand, scaleRand);

      const x = (Math.random() - 0.5) * 14.0;
      const y = (Math.random() - 0.5) * 8.0;
      const z = -2.0 + Math.random() * 5.0;
      pMesh.position.set(x, y, z);
      pMesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      flyingPetalsGroup.add(pMesh);

      flyingPetals.push({
        mesh: pMesh,
        pos: pMesh.position,
        vel: new THREE.Vector3(
          0,
          -0.0025 - Math.random() * 0.0035, // Very slow, graceful falling speed
          0
        ),
        rotVel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.010,
          (Math.random() - 0.5) * 0.006
        ),
        phase: Math.random() * Math.PI * 2,
        swaySpeed: 0.4 + Math.random() * 0.5, // Slow gentle swaying
        swayAmp: 0.004 + Math.random() * 0.005,
      });
    }

    // -----------------------------------------------------------------------
    // MOUSE & TOUCH ORBIT INTERACTION + CLICK-TO-UNCAP
    // -----------------------------------------------------------------------
    let uncapResetTimer: ReturnType<typeof setTimeout> | null = null;

    const triggerClickUncap = () => {
      manualUncapTarget.current = 1.0;
      if (uncapResetTimer) clearTimeout(uncapResetTimer);
      uncapResetTimer = setTimeout(() => {
        manualUncapTarget.current = 0.0;
      }, 2600);
    };

    const onPointerDownHandler = (e: MouseEvent | TouchEvent) => {
      isPointerDown.current = true;
      pointerMoveDist.current = 0;
      pointerDownTime.current = Date.now();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      pointerStart.current = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      if (isPointerDown.current) {
        const dx = clientX - pointerStart.current.x;
        const dy = clientY - pointerStart.current.y;
        pointerMoveDist.current += Math.abs(dx) + Math.abs(dy);

        pointerDelta.current = {
          x: dx * 0.005,
          y: dy * 0.005,
        };
        targetRot.current.y += pointerDelta.current.x;
        targetRot.current.x = Math.max(-0.25, Math.min(0.35, targetRot.current.x + pointerDelta.current.y));
        pointerStart.current = { x: clientX, y: clientY };
      } else {
        const normX = (clientX / window.innerWidth) * 2 - 1;
        const normY = -(clientY / window.innerHeight) * 2 + 1;
        targetRot.current.y = normX * 0.28;
        targetRot.current.x = 0.04 - normY * 0.14;
      }
    };

    const onPointerUpHandler = () => {
      isPointerDown.current = false;
      const duration = Date.now() - pointerDownTime.current;
      // Quick tap or click without dragging triggers an uncap & spray burst!
      if (pointerMoveDist.current < 6 && duration < 320) {
        triggerClickUncap();
      }
    };

    window.addEventListener("mousedown", onPointerDownHandler);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUpHandler);
    window.addEventListener("touchstart", onPointerDownHandler, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUpHandler);

    // SCROLL LISTENER: Smoothly uncaps the crown as the user scrolls
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
      camera.position.z = mobile ? 10.4 : 8.6;
      camera.updateProjectionMatrix();

      const scale = mobile ? 0.62 : 0.78;
      masterStage.scale.set(scale, scale, scale);

      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    // -----------------------------------------------------------------------
    // MAIN REAL-TIME 60FPS PHYSICS & ANIMATION LOOP
    // -----------------------------------------------------------------------
    const clock = new THREE.Clock();
    const tempVec = new THREE.Vector3();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth physics Lerp interpolation for rotation
      currentRot.current.x += (targetRot.current.x - currentRot.current.x) * 0.06;
      currentRot.current.y += (targetRot.current.y - currentRot.current.y) * 0.06;
      currentRot.current.z += (targetRot.current.z - currentRot.current.z) * 0.06;

      // Ambient luxury floating sway
      const idleBob = Math.sin(elapsedTime * 1.1) * 0.035;
      const idleSway = Math.cos(elapsedTime * 0.7) * 0.012;

      masterStage.position.y = -0.15 + idleBob;
      modelPivot.rotation.x = currentRot.current.x;
      modelPivot.rotation.y = currentRot.current.y + idleSway;
      modelPivot.rotation.z = currentRot.current.z;

      // Update Blender animation mixer (Ambient floating rose petals)
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Smooth manual click uncap transition
      manualUncapCurrent.current += (manualUncapTarget.current - manualUncapCurrent.current) * 0.10;

      // Effective uncap lift driven by scroll OR interactive click
      const effectiveLift = Math.max(scrollProgressRef.current, manualUncapCurrent.current);

      // Crown uncap elevation (+1.75m)
      if (capNodeRef.current) {
        const targetCrownLift = effectiveLift * 1.75;
        capCurrentY.current += (targetCrownLift - capCurrentY.current) * 0.14;
        capNodeRef.current.position.y = capCurrentY.current;

        // Subtle regal backward tilt when uncapped
        const tiltRatio = Math.min(1.0, capCurrentY.current / 1.5);
        capNodeRef.current.rotation.x = -tiltRatio * 0.12;
      }

      // SPRAY MIST:
      // Sprays ONLY when the cap goes up (capCurrentY.current > 0.18)!
      // When cap is down / resting on the flacon collar, spray is 100% OFF.
      const isCapUp = capCurrentY.current > 0.18;

      if (!isCapUp) {
        sprayPoints.visible = false;
        sprayMat.opacity = 0.0;
      } else {
        sprayPoints.visible = true;
        const uncapRatio = Math.min(1.0, (capCurrentY.current - 0.18) / 1.1);
        sprayMat.opacity = Math.min(0.92, uncapRatio * 0.95);

        // Nozzle elevation tracking in modelPivot coordinates
        const nozzleOrigin = new THREE.Vector3(0.08, 1.25, 0.05);
        if (nozzleNodeRef.current) {
          nozzleNodeRef.current.getWorldPosition(tempVec);
          modelPivot.worldToLocal(tempVec);
          nozzleOrigin.copy(tempVec);
          // Emitter point at the side orifice
          nozzleOrigin.x += 0.08;
          nozzleOrigin.y += 0.04;
        }

        const posAttr = sprayGeo.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
          const p = sprayParticles[i];
          p.life += 1;
          p.pos.x += p.vel.x;
          p.pos.y += p.vel.y;
          p.pos.z += p.vel.z;

          // Atmospheric air resistance slows the horizontal burst into a soft lingering fog
          p.vel.x *= 0.958;
          p.vel.y -= 0.0003; // very light gravity settling
          p.vel.z *= 0.965;

          if (p.life >= p.maxLife) {
            resetParticle(p, nozzleOrigin);
          }

          posArray[i * 3] = p.pos.x;
          posArray[i * 3 + 1] = p.pos.y;
          posArray[i * 3 + 2] = p.pos.z;
        }
        posAttr.needsUpdate = true;
      }

      // Flying rose petals physics across the entire screen
      for (let i = 0; i < petalCount; i++) {
        const fp = flyingPetals[i];
        // Continuous downward flutter
        fp.pos.y += fp.vel.y;
        // Organic horizontal and depth sways
        fp.pos.x += Math.sin(elapsedTime * fp.swaySpeed + fp.phase) * fp.swayAmp;
        fp.pos.z += Math.cos(elapsedTime * fp.swaySpeed * 0.8 + fp.phase) * (fp.swayAmp * 0.7);

        // 3D tumbling rotation
        fp.mesh.rotation.x += fp.rotVel.x;
        fp.mesh.rotation.y += fp.rotVel.y;
        fp.mesh.rotation.z += fp.rotVel.z;

        // Interactive breeze reaction from mouse/touch movement
        if (pointerDelta.current.x !== 0 || pointerDelta.current.y !== 0) {
          fp.pos.x += pointerDelta.current.x * 0.12;
          fp.pos.y += pointerDelta.current.y * 0.08;
        }

        // Seamless infinite wrap-around
        if (fp.pos.y < -4.6) {
          fp.pos.y = 4.8;
          fp.pos.x = (Math.random() - 0.5) * 16.0;
          fp.pos.z = -2.5 + Math.random() * 7.5;
        }
        if (fp.pos.x < -8.8) fp.pos.x = 8.8;
        if (fp.pos.x > 8.8) fp.pos.x = -8.8;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isCancelled = true;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      if (uncapResetTimer) clearTimeout(uncapResetTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousedown", onPointerDownHandler);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUpHandler);
      window.removeEventListener("touchstart", onPointerDownHandler);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUpHandler);
      window.removeEventListener("resize", handleResize);

      petalGeo.dispose();
      petalMaterials.forEach((m) => m.dispose());

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

      {/* 3. REFINED 3D EDITORIAL TYPOGRAPHY (Text on Sides, Bottle in Mid — No Buttons) */}
      <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-6 sm:p-10 lg:p-16 max-w-7xl mx-auto w-full">
        {/* Desktop Dual-Flank Layout: Perfectly frames the 3D bottle in the middle */}
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

          {/* Right Flank: Concentration & Brand Notes */}
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
        </div>
      </div>

      {/* 4. THREE.JS 3D CANVAS MOUNT (Interactive Luxury Flacon, Roses, Petals & Mist) */}
      <div
        ref={mountRef}
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing flex items-center justify-center"
      />
    </section>
  );
}