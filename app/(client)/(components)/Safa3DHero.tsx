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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2.0));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // -----------------------------------------------------------------------
    // STUDIO LIGHTING RIG (Balanced so Colors Stay Rich, Saturated & Deep)
    // -----------------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffeedb, 0.50);
    scene.add(ambientLight);

    // Key Light: Crisp directional studio light from upper-right front
    const keyLight = new THREE.DirectionalLight(0xfffaed, 1.45);
    keyLight.position.set(3.5, 6.0, 5.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Warm Golden Accent Backlight: Soft rim lighting around the silhouette
    const rimBacklight = new THREE.DirectionalLight(0xffb347, 0.75);
    rimBacklight.position.set(0, 1.5, -4.0);
    scene.add(rimBacklight);

    // Fill Light: Soft warm fill for the left flank
    const fillLight = new THREE.DirectionalLight(0xffeed4, 0.70);
    fillLight.position.set(-4, 3, 4);
    scene.add(fillLight);

    // Base Bounce Light: gentle warm lift from the studio floor so the crystal
    // base and lower label never fall into muddy shadow.
    const baseBounceLight = new THREE.DirectionalLight(0xffe2b8, 0.32);
    baseBounceLight.position.set(0, -4.0, 3.5);
    scene.add(baseBounceLight);

    // Crystal Edge Light: faint cool rim that makes the glass silhouette read
    // cleanly against the warm champagne backdrop.
    const crystalEdgeLight = new THREE.DirectionalLight(0xdce8ff, 0.20);
    crystalEdgeLight.position.set(4.5, 2.0, -3.5);
    scene.add(crystalEdgeLight);

    // Top Rim Light: Catches the 24K gold crown arches and crystal shoulder
    const topRimLight = new THREE.DirectionalLight(0xfff5e6, 0.85);
    topRimLight.position.set(0, 6, -3);
    scene.add(topRimLight);

    // Environment Map: a neutral studio room gives the gold and glass real reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();

    // Augment the room with narrow, bright studio softbox strips. The default
    // room lights are broad, which makes polished gold reflect soft blobs; these
    // narrow strips give the nozzle/collar crisp vertical specular highlights.
    const addEnvSoftbox = (
      panelWidth: number,
      panelHeight: number,
      tint: THREE.ColorRepresentation,
      intensity: number,
      x: number,
      y: number,
      z: number
    ) => {
      const panelMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(tint),
        side: THREE.DoubleSide,
      });
      // Values above 1.0 survive PMREM's HDR render target, so the strip reads
      // as a real, bright light source in the reflections.
      panelMat.color.multiplyScalar(intensity);

      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(panelWidth, panelHeight),
        panelMat
      );
      panel.position.set(x, y, z);
      panel.lookAt(0, 10, 0);
      roomEnv.add(panel);
    };

    // Crisp vertical softboxes on both flanks
    addEnvSoftbox(1.15, 16, 0xfff6e8, 6.5, -12.5, 10.5, 7.0);
    addEnvSoftbox(0.95, 15, 0xfff1dc, 7.5, 12.0, 10.5, 6.5);
    // Narrow top strip: sharp glints along the crown arches and collar rim
    addEnvSoftbox(11, 0.7, 0xffffff, 5.5, 0, 19.5, 3.0);
    // Slender frontal strip: a clean vertical highlight down the polished band & nozzle
    addEnvSoftbox(0.75, 9, 0xfffaf0, 5.0, 1.5, 12.5, 13.0);

    // Negative-fill dark studio gobos: create rich dark-to-gold contrast on
    // polished metal (nozzle, collar, crown) and crisp dark edges on crystal glass.
    addEnvSoftbox(3.2, 18, 0x050403, 0.08, -7.5, 10.0, 9.5);
    addEnvSoftbox(3.2, 18, 0x050403, 0.08, 7.5, 10.0, 9.5);
    addEnvSoftbox(12.0, 2.2, 0x060504, 0.1, 0, 4.5, 11.5);

    const envMap = pmremGenerator.fromScene(roomEnv, 0.012).texture;
    scene.environment = envMap;
    pmremGenerator.dispose();
    (roomEnv as unknown as { dispose?: () => void }).dispose?.();

    // -----------------------------------------------------------------------
    // MASTER BOTTLE STAGE GROUP
    // -----------------------------------------------------------------------
    const masterStage = new THREE.Group();
    masterStage.position.set(0, -0.08, 0);
    const initialScale = isMobile ? 0.68 : 0.84;
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
    // Soft blurred circular mist droplet texture for atomized fragrance spray
    const sprayDropletTex = textureLoader.load("/images/spray_droplet.png");

    // Soft contact-shadow texture, generated on the fly. Two of these (a wide
    // ambient pool + a tight core) are placed under the flacon so it sits on
    // the studio floor instead of floating or casting a generic tube shadow.
    const createContactShadowTexture = (innerAlpha: number) => {
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const gradient = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
      );
      gradient.addColorStop(0, `rgba(22, 15, 8, ${innerAlpha})`);
      gradient.addColorStop(0.34, `rgba(22, 15, 8, ${innerAlpha * 0.58})`);
      gradient.addColorStop(0.66, `rgba(22, 15, 8, ${innerAlpha * 0.18})`);
      gradient.addColorStop(1, "rgba(22, 15, 8, 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    // Cleanup hooks for anything created asynchronously after the model loads.
    const lateDisposables: Array<() => void> = [];

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
            // 2. Crystal glass: Heavy luxury optical crystal flacon body with real physical refraction
            else if (meshName.includes("Safa_Bottle_Glass") || meshName.includes("Crystal_Base")) {
              const isBaseSham = meshName.includes("Crystal_Base");
              // Luxury French crystal: real physical transmission + thick optical glass refraction
              const glassMat = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(isBaseSham ? 0xfaf7f0 : 0xffffff),
                metalness: 0.0,
                roughness: 0.015,
                transmission: 0.96,
                thickness: isBaseSham ? 1.35 : 0.72,
                attenuationColor: new THREE.Color(isBaseSham ? 0xf3ead8 : 0xfcf9f2),
                attenuationDistance: isBaseSham ? 2.6 : 4.5,
                clearcoat: 1.0,
                clearcoatRoughness: 0.012,
                ior: 1.54,
                envMapIntensity: 2.8,
                specularIntensity: 1.0,
                iridescence: 0.10,
                iridescenceIOR: 1.3,
                iridescenceThicknessMinimum: 120,
                iridescenceThicknessMaximum: 420,
              });
              glassMat.onBeforeCompile = (shader) => {
                const marker = shader.fragmentShader.includes("#include <opaque_fragment>")
                  ? "#include <opaque_fragment>"
                  : "#include <output_fragment>";
                shader.fragmentShader = shader.fragmentShader.replace(
                  marker,
                  marker + `
                  // Heavy lead-crystal fresnel: crisp glass edge reflections & crystal facet gleam
                  float nd = clamp(abs(dot(normalize(vNormal), normalize(vViewPosition))), 0.0, 1.0);
                  float glassFres = pow(1.0 - nd, 3.6);
                  float glassSpec = clamp(dot(outgoingLight, vec3(0.3333)), 0.0, 1.0);
                  
                  // Subtle warm champagne crystal rim gleam
                  gl_FragColor.rgb += vec3(1.0, 0.96, 0.88) * (glassFres * 0.42 + glassSpec * 0.18);`
                );
              };
              mesh.material = glassMat;
              mesh.renderOrder = 3;
            }
            // 3. Perfume liquid: Luminous rich cognac-amber & golden champagne essence
            // Rendered opaque so Three.js physical glass transmission refracts it cleanly!
            else if (
              matName.includes("Liquid") ||
              matName.includes("Champagne") ||
              meshName.includes("Liquid")
            ) {
              const liquidMat = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0xd97706), // Radiant warm amber
                emissive: new THREE.Color(0x8a3b08), // Deep rich cognac heart
                emissiveIntensity: 0.55,
                roughness: 0.04,
                metalness: 0.0,
                clearcoat: 1.0,
                clearcoatRoughness: 0.02,
                envMapIntensity: 1.9,
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
                  vec3 deepCognac = vec3(0.48, 0.18, 0.03);
                  vec3 warmAmber = vec3(0.88, 0.52, 0.08);
                  vec3 champagneGold = vec3(0.99, 0.84, 0.38);
                  
                  vec3 coreLiquid = mix(deepCognac, warmAmber, pow(liqView, 0.78));
                  coreLiquid = mix(coreLiquid, champagneGold, pow(liqView, 2.2) * 0.48);
                  
                  gl_FragColor.rgb = mix(coreLiquid, gl_FragColor.rgb, 0.35) + champagneGold * 0.12;`
                );
              };
              mesh.material = liquidMat;
              mesh.renderOrder = 2;
            }
            // 3b. Dip tube: subtle translucent polymer stem inside the flacon
            else if (meshName.includes("Dip_Tube") || child.name.includes("Dip_Tube")) {
              mesh.visible = true;
              mesh.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0xf6efe2),
                roughness: 0.16,
                metalness: 0.0,
                clearcoat: 1.0,
                transparent: true,
                opacity: 0.34,
                depthWrite: false,
              });
              mesh.renderOrder = 1;
            }
            // 3c. Hide original forward-facing Spray Orifice (replaced by left-side machined insert)
            else if (matName.includes("Orifice") || meshName.includes("Orifice") || child.name.includes("Orifice")) {
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
              // The atomizer nozzle, neck collar, and crown base band are
              // machined metal parts — give them a tighter, sharper polish than
              // the decorative crown so they read as real hardware.
              const isMachinedGold =
                meshName.includes("Nozzle") ||
                meshName.includes("Neck_Collar") ||
                meshName.includes("Crown_Base_Band") ||
                parentName.includes("Nozzle") ||
                parentName.includes("Neck_Collar");

              mesh.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0xd4af37), // Pure 24K Polished Gold
                metalness: 1.0,
                roughness: isMachinedGold ? 0.045 : 0.08,
                clearcoat: 1.0,
                clearcoatRoughness: 0.02,
                envMapIntensity: isMachinedGold ? 3.2 : 2.8,
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
            // 10. Front Brand Logo Decal: Crisp Foil-Stamped Emerald Green Calligraphy
            else if (matName.includes("Decal") || meshName.includes("Label") || child.name.includes("Label")) {
              mesh.material = new THREE.MeshPhysicalMaterial({
                map: decalTex,
                color: new THREE.Color(0x0a3d2e), // Deep Haute Emerald Green
                transparent: true,
                alphaTest: 0.04,
                roughness: 0.18,
                metalness: 0.35,
                clearcoat: 0.75,
                clearcoatRoughness: 0.12,
                emissive: new THREE.Color(0x04241b),
                emissiveIntensity: 0.18,
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

        const targetHeight = 5.15;
        const s = targetHeight / (size.y || 1);
        gltf.scene.scale.set(s, s, s);
        gltf.scene.position.set(-center.x * s, -center.y * s + 0.15, -center.z * s);
        modelPivot.add(gltf.scene);

        // -------------------------------------------------------------------
        // GROUNDED CONTACT SHADOW
        // Two soft, bottle-footprint-shaped ellipses sit on the studio floor so
        // the flacon reads as planted. They live on masterStage (not modelPivot)
        // so they follow the gentle float but never rotate with the bottle.
        // -------------------------------------------------------------------
        masterStage.updateWorldMatrix(true, true);
        const worldBox = new THREE.Box3().setFromObject(gltf.scene);
        const worldCenter = worldBox.getCenter(new THREE.Vector3());
        const worldSize = worldBox.getSize(new THREE.Vector3());
        const stageScale = masterStage.scale.x || 1;

        const shadowCenterLocal = masterStage.worldToLocal(
          new THREE.Vector3(worldCenter.x, worldBox.min.y, worldCenter.z)
        );
        const footprintWidth = worldSize.x / stageScale;
        const footprintDepth = worldSize.z / stageScale;

        const addContactShadow = (
          shadowWidth: number,
          shadowDepth: number,
          innerAlpha: number,
          yOffset: number
        ) => {
          const tex = createContactShadowTexture(innerAlpha);
          if (!tex) return;

          const geo = new THREE.PlaneGeometry(1, 1);
          const mat = new THREE.MeshBasicMaterial({
            map: tex,
            transparent: true,
            opacity: 1,
            depthWrite: false,
            toneMapped: false,
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.rotation.x = -Math.PI / 2;
          mesh.scale.set(shadowWidth, shadowDepth, 1);
          mesh.position.set(
            shadowCenterLocal.x,
            shadowCenterLocal.y + yOffset,
            shadowCenterLocal.z
          );
          mesh.renderOrder = -1;
          masterStage.add(mesh);

          lateDisposables.push(() => {
            masterStage.remove(mesh);
            geo.dispose();
            mat.dispose();
            tex.dispose();
          });
        };

        // Wide soft ambient occlusion pool
        addContactShadow(
          Math.max(footprintWidth * 1.7, 2.1),
          Math.max(footprintDepth * 2.6, 2.1),
          0.50,
          -0.02
        );
        // Tighter, darker core that matches the actual base footprint
        addContactShadow(
          Math.max(footprintWidth * 1.05, 1.3),
          Math.max(footprintDepth * 1.55, 1.3),
          0.66,
          -0.012
        );

        // -------------------------------------------------------------------
        // MACHINED ATOMIZER DETAIL
        // Crisp crimp seams and edge rings on the gold crown base band make the
        // nozzle/collar read as real machined hardware instead of a soft, blurry
        // cylinder. They are parented to the cap so they lift with it on uncap.
        // -------------------------------------------------------------------
        const capNode = capNodeRef.current;
        if (capNode) {
          const addCapRing = (
            radius: number,
            tube: number,
            y: number,
            color: number,
            roughness: number,
            emissive = 0x000000,
            emissiveIntensity = 0
          ) => {
            const geo = new THREE.TorusGeometry(radius, tube, 10, 128);
            const mat = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(color),
              metalness: 1.0,
              roughness,
              envMapIntensity: 3.2,
              emissive: new THREE.Color(emissive),
              emissiveIntensity,
            });
            const ring = new THREE.Mesh(geo, mat);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = y;
            ring.castShadow = true;
            capNode.add(ring);

            lateDisposables.push(() => {
              capNode.remove(ring);
              geo.dispose();
              mat.dispose();
            });
          };

          // Bottom edge highlight where the band meets the glass neck
          addCapRing(0.5435, 0.0065, 3.663, 0xffd88a, 0.035, 0x2a1a00, 0.2);
          // Lower crimp seam groove
          addCapRing(0.5425, 0.0055, 3.705, 0x5a3d12, 0.38);
          // Upper crimp seam groove
          addCapRing(0.5425, 0.0045, 3.955, 0x5a3d12, 0.38);
          // Top edge highlight just under the scalloped rim
          addCapRing(0.5435, 0.0055, 3.992, 0xffd88a, 0.035, 0x2a1a00, 0.2);
        }

        // -------------------------------------------------------------------
        // REAL PRECISION ATOMIZER NOZZLE & CRIMP COLLAR ASSEMBLY
        // Replaces the plain cylinder silhouette with machined actuator bevels,
        // recessed finger-press top, stepped neck crimp collar, and a crisp
        // multi-ring spray insert + pinhole orifice.
        // -------------------------------------------------------------------
        const nozzleNode = nozzleNodeRef.current;
        if (nozzleNode) {
          const addNozzlePart = (
            geo: THREE.BufferGeometry,
            mat: THREE.Material,
            x: number,
            y: number,
            z: number,
            rotX = 0,
            rotZ = 0
          ) => {
            const part = new THREE.Mesh(geo, mat);
            part.position.set(x, y, z);
            if (rotX !== 0) part.rotation.x = rotX;
            if (rotZ !== 0) part.rotation.z = rotZ;
            part.castShadow = true;
            part.receiveShadow = true;
            nozzleNode.add(part);
            lateDisposables.push(() => {
              nozzleNode.remove(part);
              geo.dispose();
              mat.dispose();
            });
            return part;
          };

          const polishedGoldMat = () =>
            new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(0xdcb854),
              metalness: 1.0,
              roughness: 0.04,
              clearcoat: 1.0,
              clearcoatRoughness: 0.015,
              envMapIntensity: 3.4,
            });

          const brushedGoldMat = () =>
            new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(0xc79e36),
              metalness: 0.96,
              roughness: 0.24,
              envMapIntensity: 2.6,
            });

          const darkSeamMat = () =>
            new THREE.MeshStandardMaterial({
              color: new THREE.Color(0x4a320d),
              metalness: 0.9,
              roughness: 0.35,
            });

          // 1. Machined top rim bevel + recessed brushed-gold finger-press actuator cap
          addNozzlePart(new THREE.TorusGeometry(0.285, 0.017, 16, 72), polishedGoldMat(), 0, 0.272, 0, Math.PI / 2);
          addNozzlePart(new THREE.CylinderGeometry(0.255, 0.265, 0.014, 64), brushedGoldMat(), 0, 0.274, 0);
          addNozzlePart(new THREE.TorusGeometry(0.18, 0.005, 10, 64), darkSeamMat(), 0, 0.281, 0, Math.PI / 2);

          // 2. Crisp upper & lower machined waist grooves on the actuator cylinder
          addNozzlePart(new THREE.TorusGeometry(0.301, 0.005, 12, 72), darkSeamMat(), 0, 0.23, 0, Math.PI / 2);
          addNozzlePart(new THREE.TorusGeometry(0.302, 0.006, 12, 72), polishedGoldMat(), 0, -0.22, 0, Math.PI / 2);
          addNozzlePart(new THREE.TorusGeometry(0.301, 0.005, 12, 72), darkSeamMat(), 0, -0.255, 0, Math.PI / 2);

          // 3. Stepped base skirt where actuator meets the neck collar
          addNozzlePart(new THREE.CylinderGeometry(0.325, 0.345, 0.06, 64), polishedGoldMat(), 0, -0.285, 0);

          // 4. Precision multi-part spray insert on RIGHT (+X = +0.30, local y = +0.13, z = 0)
          const insertHousingMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x161310),
            metalness: 0.85,
            roughness: 0.22,
          });
          const insertBezelMat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(0xe6c86e),
            metalness: 1.0,
            roughness: 0.05,
            envMapIntensity: 3.4,
          });
          const pinholeMat = new THREE.MeshBasicMaterial({ color: 0x040302 });

          addNozzlePart(new THREE.CylinderGeometry(0.054, 0.054, 0.022, 32), insertBezelMat, 0.295, 0.13, 0, 0, Math.PI / 2);
          addNozzlePart(new THREE.CylinderGeometry(0.042, 0.042, 0.026, 32), insertHousingMat, 0.298, 0.13, 0, 0, Math.PI / 2);
          addNozzlePart(new THREE.CylinderGeometry(0.015, 0.015, 0.030, 24), pinholeMat, 0.301, 0.13, 0, 0, Math.PI / 2);
        }

        const neckCollarNode = gltf.scene.getObjectByName("Safa_Neck_Collar");
        if (neckCollarNode) {
          const addCollarRing = (radius: number, tube: number, y: number, color: number, roughness: number) => {
            const geo = new THREE.TorusGeometry(radius, tube, 12, 96);
            const mat = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(color),
              metalness: 1.0,
              roughness,
              envMapIntensity: 3.2,
            });
            const ring = new THREE.Mesh(geo, mat);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = y;
            ring.castShadow = true;
            neckCollarNode.add(ring);
            lateDisposables.push(() => {
              neckCollarNode.remove(ring);
              geo.dispose();
              mat.dispose();
            });
          };

          addCollarRing(0.461, 0.008, 0.195, 0xffe094, 0.04);
          addCollarRing(0.462, 0.005, 0.165, 0x4e350e, 0.35);
          addCollarRing(0.462, 0.006, -0.185, 0xffe094, 0.04);
        }

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
    const particleCount = isMobile ? 120 : 180;
    const sprayParticles: SprayParticle[] = [];
    const particlePositions = new Float32Array(particleCount * 3);

    const resetParticle = (p: SprayParticle, origin: THREE.Vector3) => {
      p.pos.copy(origin);
      // Fine atomized plume from the RIGHT-side nozzle (+X):
      // High initial velocity that bursts outwards, expanding into a soft mist cone
      const sideSpeed = 0.075 + Math.random() * 0.095;
      const spreadY = (Math.random() - 0.5) * 0.28;
      const spreadZ = (Math.random() - 0.5) * 0.24;

      p.vel.set(
        sideSpeed,                           // spray direction: right (+X)
        spreadY * sideSpeed + 0.006,         // fine vertical cone fan + gentle initial rise
        spreadZ * sideSpeed                  // 3D depth cone dispersion
      );
      p.life = 0;
      p.maxLife = 36 + Math.random() * 28;
      p.size = 0.35 + Math.random() * 0.30;
    };

    const initialOrigin = new THREE.Vector3(0.22, 1.28, 0);
    for (let i = 0; i < particleCount; i++) {
      const p: SprayParticle = {
        pos: new THREE.Vector3(0.22, 1.28, 0),
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
    // ETHEREAL CHERRY BLOSSOM & ROSE PETAL SWARM (Sakura Luxury Drift)
    // -----------------------------------------------------------------------
    interface FlyingPetalData {
      mesh: THREE.Mesh;
      pos: THREE.Vector3;
      vel: THREE.Vector3;
      rotVel: THREE.Vector3;
      phase: number;
      swaySpeed: number;
      swayAmp: number;
      flutterFreq: number;
    }

    const flyingPetals: FlyingPetalData[] = [];
    const flyingPetalsGroup = new THREE.Group();
    scene.add(flyingPetalsGroup);

    // Sculpted organic cherry blossom petal with natural notched tip & soft curl
    const createSakuraPetalGeometry = (w = 0.26, l = 0.36) => {
      const segX = 10;
      const segY = 12;
      const geo = new THREE.PlaneGeometry(w, l, segX, segY);
      const pos = geo.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);

        // Normalized [-1, 1]
        const nx = x / (w * 0.5);
        const ny = y / (l * 0.5);

        // Gentle petal contour: rounded spade profile tapering to base (ny = -1)
        // With an iconic subtle Sakura petal heart-cleft notch at the very tip (ny > 0.8)
        const widthScale = Math.sin((ny * 0.5 + 0.5) * Math.PI * 0.85);
        if (ny > 0.75) {
          const notch = (1.0 - Math.abs(nx * 1.8)) * 0.12 * Math.max(0, (ny - 0.75) / 0.25);
          y -= notch * (l * 0.5);
        }

        x *= Math.max(0.12, widthScale);
        pos.setX(i, x);
        pos.setY(i, y);

        // Delicate 3D petal bowl cup & wavy edge curl
        const cup = (1.0 - nx * nx) * Math.sin((ny * 0.5 + 0.5) * Math.PI) * 0.055;
        const wave = Math.sin(nx * 4.0) * 0.012;
        pos.setZ(i, -cup + wave);
      }

      geo.computeVertexNormals();
      return geo;
    };

    const sakuraPetalGeo = createSakuraPetalGeometry(0.25, 0.35);

    // Ethereal translucent cherry blossom palette:
    // Soft pastel Sakura pink, delicate blush petal, warm mother-of-pearl ivory
    const sakuraMaterials = [
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xfbcfe8), // Soft Sakura pastel pink
        roughness: 0.35,
        metalness: 0.0,
        clearcoat: 0.6,
        clearcoatRoughness: 0.25,
        transmission: 0.25, // Translucent petal backlit glow
        ior: 1.45,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xf472b6), // Radiant blush cherry blossom
        roughness: 0.38,
        metalness: 0.0,
        clearcoat: 0.5,
        clearcoatRoughness: 0.25,
        transmission: 0.20,
        ior: 1.45,
        transparent: true,
        opacity: 0.90,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xfdf2f8), // Gentle pale ivory-pink blossom
        roughness: 0.32,
        metalness: 0.0,
        clearcoat: 0.7,
        clearcoatRoughness: 0.20,
        transmission: 0.30,
        ior: 1.45,
        transparent: true,
        opacity: 0.88,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xfecdd3), // Warm rose-tinted blossom
        roughness: 0.36,
        metalness: 0.0,
        clearcoat: 0.6,
        clearcoatRoughness: 0.25,
        transmission: 0.22,
        ior: 1.45,
        transparent: true,
        opacity: 0.91,
        side: THREE.DoubleSide,
      }),
    ];

    const petalCount = isMobile ? 14 : 24;
    for (let i = 0; i < petalCount; i++) {
      const mat = sakuraMaterials[i % sakuraMaterials.length];
      const pMesh = new THREE.Mesh(sakuraPetalGeo, mat);
      const scaleRand = 0.62 + Math.random() * 0.58;
      pMesh.scale.set(scaleRand, scaleRand, scaleRand);

      const x = (Math.random() - 0.5) * 15.0;
      const y = (Math.random() - 0.5) * 9.0;
      const z = -2.5 + Math.random() * 6.5;
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
          0.0015 + Math.random() * 0.003, // Gentle horizontal breeze drift
          -0.0032 - Math.random() * 0.0042, // Slow, graceful falling speed
          0
        ),
        rotVel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.012,
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.008
        ),
        phase: Math.random() * Math.PI * 2,
        swaySpeed: 0.65 + Math.random() * 0.85, // Gentle pendulum fluttering
        swayAmp: 0.009 + Math.random() * 0.009,
        flutterFreq: 1.4 + Math.random() * 1.8,
      });
    }

    // -----------------------------------------------------------------------
    // MOUSE & TOUCH ORBIT INTERACTION + CLICK-TO-UNCAP
    // -----------------------------------------------------------------------
    let uncapResetTimer: ReturnType<typeof setTimeout> | null = null;
    let heroVisible = true;
    let pageVisible = !document.hidden;
    let lastRenderAt = 0;

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

      const scale = mobile ? 0.68 : 0.84;
      masterStage.scale.set(scale, scale, scale);

      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2.0));
    };

    window.addEventListener("resize", handleResize);

    // -----------------------------------------------------------------------
    // MAIN REAL-TIME 60FPS PHYSICS & ANIMATION LOOP
    // -----------------------------------------------------------------------
    const timer = new THREE.Timer();
    const tempVec = new THREE.Vector3();

    const animate = () => {
      if (!heroVisible || !pageVisible) {
        animFrameId.current = null;
        return;
      }

      animFrameId.current = requestAnimationFrame(animate);
      const now = performance.now();
      if (now - lastRenderAt < 33) return;
      lastRenderAt = now;

      timer.update();
      const delta = timer.getDelta();
      const elapsedTime = timer.getElapsed();

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

        // Nozzle elevation tracking in modelPivot coordinates (exact right-side orifice)
        const nozzleOrigin = new THREE.Vector3(0.22, 1.28, 0);
        if (nozzleNodeRef.current) {
          tempVec.set(0.31, 0.13, 0);
          nozzleNodeRef.current.localToWorld(tempVec);
          modelPivot.worldToLocal(tempVec);
          nozzleOrigin.copy(tempVec);
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

      // Flying cherry blossom / rose petals physics across the entire screen
      for (let i = 0; i < petalCount; i++) {
        const fp = flyingPetals[i];
        // Continuous gentle downward flutter + slight horizontal breeze drift
        fp.pos.y += fp.vel.y;
        fp.pos.x += fp.vel.x;

        // Realistic leaf/petal oscillatory tumbling and swinging
        fp.pos.x += Math.sin(elapsedTime * fp.swaySpeed + fp.phase) * fp.swayAmp;
        fp.pos.z += Math.cos(elapsedTime * fp.swaySpeed * 0.75 + fp.phase) * (fp.swayAmp * 0.85);

        // Natural tumbling rotations around pitch, yaw and roll
        fp.mesh.rotation.x += fp.rotVel.x + Math.sin(elapsedTime * fp.flutterFreq) * 0.005;
        fp.mesh.rotation.y += fp.rotVel.y;
        fp.mesh.rotation.z += fp.rotVel.z + Math.cos(elapsedTime * fp.flutterFreq) * 0.004;

        // Interactive gentle breeze reaction from mouse/touch movement
        if (pointerDelta.current.x !== 0 || pointerDelta.current.y !== 0) {
          fp.pos.x += pointerDelta.current.x * 0.14;
          fp.pos.y += pointerDelta.current.y * 0.08;
        }

        // Seamless infinite wrap-around across viewport
        if (fp.pos.y < -4.8) {
          fp.pos.y = 5.0;
          fp.pos.x = (Math.random() - 0.5) * 16.0;
          fp.pos.z = -2.5 + Math.random() * 7.5;
        }
        if (fp.pos.x < -9.0) fp.pos.x = 9.0;
        if (fp.pos.x > 9.0) fp.pos.x = -9.0;
      }

      renderer.render(scene, camera);
    };

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        heroVisible = entry.isIntersecting;
        if (heroVisible && pageVisible && animFrameId.current === null) {
          animate();
        }
      },
      { threshold: 0.05 }
    );
    heroObserver.observe(mount);

    const onVisibilityChange = () => {
      pageVisible = !document.hidden;
      if (pageVisible && heroVisible && animFrameId.current === null) {
        animate();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    animate();

    return () => {
      isCancelled = true;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      if (uncapResetTimer) clearTimeout(uncapResetTimer);
      heroObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousedown", onPointerDownHandler);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUpHandler);
      window.removeEventListener("touchstart", onPointerDownHandler);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUpHandler);
      window.removeEventListener("resize", handleResize);

      sakuraPetalGeo.dispose();
      sakuraMaterials.forEach((m) => m.dispose());
      lateDisposables.forEach((dispose) => dispose());
      decalTex.dispose();
      sprayDropletTex.dispose();
      envMap.dispose();

      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <section className="relative w-full h-[90vh] min-h-[620px] max-h-[980px] bg-gradient-to-b from-[#f2ece2] via-[#ebe0d2] to-[#d8cbb9] text-[#0e281d] overflow-hidden flex items-center justify-center select-none">
      {/* 1. SEAMLESS LUXURY ATELIER STUDIO LIGHTING (Warm Silk & Champagne Studio) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Warm Blush Glow behind the flacon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75vw] h-[75vw] max-w-[850px] max-h-[850px] rounded-full bg-radial from-[#dfc9bd]/45 via-[#eee3d7]/20 to-transparent blur-3xl" />
        {/* Regal Champagne Gold Radiance */}
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-radial from-[#dfc59b]/35 via-[#ebdcc2]/15 to-transparent blur-2xl" />
        {/* Soft Polished Studio Floor Ambient Pool (3D contact shadow handles the real grounding) */}
        <div className="absolute bottom-[7%] left-1/2 -translate-x-1/2 w-[300px] sm:w-[420px] h-[34px] rounded-[100%] bg-radial from-[#2a221b]/12 via-[#473a2e]/04 to-transparent blur-lg" />
        {/* Studio vignette blending smoothly into #faf7f2 */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#f2e9dd]/8 to-[#d4c6b3]/35" />
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
              THE SAFA SIGNATURE
            </div>
            <h1 className="text-3xl lg:text-5xl font-serif text-[#0e281d] leading-[1.08] font-[Galsod] uppercase tracking-wide">
              A signature<br />
              <span className="text-[#b39b66] italic font-normal font-serif lowercase">made personal.</span>
            </h1>
            <p className="text-xs text-[#5a6b63] tracking-wider leading-relaxed font-sans pt-1">
              Concentrated extrait de parfum, composed for a lasting impression and a refined, unmistakable presence.
            </p>
          </div>

          {/* Right Flank: Concentration & Brand Notes */}
          <div className="max-w-[280px] lg:max-w-xs flex flex-col items-end text-right space-y-3">
            <div className="flex items-center gap-2 text-[#b39b66] text-[10px] lg:text-[11px] uppercase tracking-[0.35em] font-mono font-medium">
              EXTRAIT DE PARFUM
              <span className="w-6 h-[1px] bg-[#b39b66]" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-serif text-[#0e281d] leading-none font-[Galsod] uppercase tracking-wide">
              Warm. Refined.<br />Unmistakably yours.
            </h2>
            <p className="text-xs text-[#b39b66] tracking-[0.3em] uppercase font-mono">
              CONCENTRATED WITH INTENTION
            </p>
          </div>
        </div>

        {/* Mobile Editorial Layout (Clean & Balanced) */}
        <div className="md:hidden flex flex-col justify-between items-center text-center h-full py-4">
          <div className="pt-2 space-y-1">
            <span className="text-[10px] tracking-[0.35em] uppercase text-[#b39b66] font-mono font-medium">
              — SAFA FRAGRANCE —
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#0e281d] uppercase font-[Galsod] tracking-wide">
              A signature <span className="text-[#b39b66] italic font-normal">made personal</span>
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