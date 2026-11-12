"""
Safa Perfumes — 3D Luxury Flacon Generator & Web Exporter for Blender
=====================================================================
What this script does:
1. Builds the hyper-realistic Safa crystal flacon with:
   - Glowing cognac-amber perfume extract
   - Slender glass dip tube & liquid meniscus
   - Front 24K gold embossed brand plaque ('S A F A' + 'EXTRAIT DE PARFUM')
   - Diamond-cut faceted crystal cap with lifting & gliding animation
2. Completely REMOVES any background floor/backdrop (100% transparent background).
3. AUTOMATICALLY EXPORTS the model directly to your website folder:
   -> public/models/safa_perfume_flacon.glb
   -> ~/Desktop/safa_perfume_flacon.glb

How to run:
1. Open Blender.
2. In the 'Scripting' tab, paste this entire script.
3. Click 'Run Script' (▶) or press Alt+P.
4. That's it! The model is built, rendered in transparent studio view,
   and exported directly as .glb for the website!
"""

import bpy
import bmesh
import math
import os

def clean_scene():
    """Clear default objects"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block in list(bpy.data.meshes):
        bpy.data.meshes.remove(block)
    for block in list(bpy.data.materials):
        bpy.data.materials.remove(block)
    for block in list(bpy.data.curves):
        bpy.data.curves.remove(block)
    for block in list(bpy.data.lights):
        bpy.data.lights.remove(block)
    for block in list(bpy.data.cameras):
        bpy.data.cameras.remove(block)

def create_glass_material(name="LuxuryGlass"):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    output = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (1.0, 1.0, 1.0, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.005 # High-polish crystal
    bsdf.inputs['IOR'].default_value = 1.52 # Optical flint crystal glass
    
    trans_input = bsdf.inputs.get("Transmission Weight") or bsdf.inputs.get("Transmission")
    if trans_input:
        trans_input.default_value = 1.0
        
    coat_input = bsdf.inputs.get("Coat Weight") or bsdf.inputs.get("Clearcoat")
    if coat_input:
        coat_input.default_value = 1.0
        
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat

def create_liquid_material(name="AmberPerfume"):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    output = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    # Rich deep glowing cognac-amber liquid
    bsdf.inputs['Base Color'].default_value = (0.84, 0.38, 0.05, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.015
    bsdf.inputs['IOR'].default_value = 1.34 # Alcohol perfume essence
    
    trans_input = bsdf.inputs.get("Transmission Weight") or bsdf.inputs.get("Transmission")
    if trans_input:
        trans_input.default_value = 0.95
        
    coat_input = bsdf.inputs.get("Coat Weight") or bsdf.inputs.get("Clearcoat")
    if coat_input:
        coat_input.default_value = 1.0
        
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    
    # Volume absorption for realistic amber fluid depth
    try:
        vol = nodes.new(type='ShaderNodeVolumeAbsorption')
        vol.inputs['Color'].default_value = (0.88, 0.40, 0.05, 1.0)
        vol.inputs['Density'].default_value = 1.4
        mat.node_tree.links.new(vol.outputs['Volume'], output.inputs['Volume'])
    except Exception:
        pass
        
    return mat

def create_gold_material(name="Polished18KGold"):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    output = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (1.0, 0.82, 0.42, 1.0) # 18K Luxury Gold
    bsdf.inputs['Metallic'].default_value = 1.0
    bsdf.inputs['Roughness'].default_value = 0.08
    
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat

def create_noir_material(name="SatinNoir"):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    output = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.03, 0.08, 0.05, 1.0) # Deep Noir Emerald
    bsdf.inputs['Metallic'].default_value = 0.1
    bsdf.inputs['Roughness'].default_value = 0.15
    
    coat_input = bsdf.inputs.get("Coat Weight") or bsdf.inputs.get("Clearcoat")
    if coat_input:
        coat_input.default_value = 1.0
        
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat

def setup_studio_world():
    world = bpy.context.scene.world
    if not world:
        world = bpy.data.worlds.new("SafaStudioWorld")
        bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        # Soft ambient studio fill
        bg.inputs['Color'].default_value = (0.06, 0.06, 0.06, 1.0)
        bg.inputs['Strength'].default_value = 0.1
        
    # TRANSPARENT FILM: No background geometry or floor at all!
    bpy.context.scene.render.film_transparent = True

def build_perfume():
    clean_scene()
    setup_studio_world()
    
    # Configure CYCLES for high quality with real-time viewport denoising
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    try:
        scene.cycles.device = 'GPU'
    except Exception:
        pass
    
    # Real-time denoising (clean, noise-free preview)
    scene.cycles.preview_samples = 32
    scene.cycles.use_preview_denoising = True
    try:
        scene.cycles.preview_denoiser = 'OPENIMAGEDENOISE'
    except Exception:
        pass
        
    scene.cycles.max_bounces = 12
    scene.cycles.diffuse_bounces = 4
    scene.cycles.glossy_bounces = 8
    scene.cycles.transmission_bounces = 12
    scene.cycles.transparent_max_bounces = 12
    
    glass_mat = create_glass_material("Safa_Crystal_Glass")
    liquid_mat = create_liquid_material("Safa_Amber_Extract")
    gold_mat = create_gold_material("Safa_18K_Gold")
    noir_mat = create_noir_material("Safa_Noir_Emerald")
    
    # 1. LUXURY CRYSTAL BOTTLE BODY (Heavy solid crystal base)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=64, 
        radius=1.46, 
        depth=2.4, 
        location=(0, 0, 1.2)
    )
    bottle = bpy.context.active_object
    bottle.name = "Safa_Bottle_Glass"
    bottle.data.materials.append(glass_mat)
    bpy.ops.object.shade_smooth()
    
    # Rounded shoulder transition
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=64, 
        radius=1.42, 
        depth=0.5, 
        location=(0, 0, 2.45)
    )
    shoulder = bpy.context.active_object
    shoulder.name = "Safa_Bottle_Shoulder"
    shoulder.scale = (0.95, 0.95, 0.6)
    shoulder.data.materials.append(glass_mat)
    bpy.ops.object.shade_smooth()
    
    # 2. PERFUME OIL EXTRACT & MENISCUS (Rich glowing amber fluid inside bottle)
    # Liquid body
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=64, 
        radius=1.26, 
        depth=1.82, 
        location=(0, 0, 1.35)
    )
    liquid = bpy.context.active_object
    liquid.name = "Safa_Perfume_Liquid"
    liquid.data.materials.append(liquid_mat)
    bpy.ops.object.shade_smooth()
    
    # Liquid Top Surface Meniscus (Surface line catching highlights)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=64,
        radius=1.25,
        depth=0.03,
        location=(0, 0, 2.26)
    )
    meniscus = bpy.context.active_object
    meniscus.name = "Safa_Liquid_Meniscus"
    meniscus.data.materials.append(liquid_mat)
    bpy.ops.object.shade_smooth()
    
    # Iconic Slender Glass Dip Tube (Atomizer Suction Tube passing down through perfume)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=32,
        radius=0.042,
        depth=2.2,
        location=(0, -0.05, 1.7)
    )
    dip_tube = bpy.context.active_object
    dip_tube.name = "Safa_Atomizer_Dip_Tube"
    dip_tube.data.materials.append(glass_mat)
    bpy.ops.object.shade_smooth()
    dip_tube.rotation_euler = (math.radians(2.0), math.radians(1.0), 0)
    
    # Internal Amber Fluid Radiance Glow (Illuminates liquid warmly from within!)
    bpy.ops.object.light_add(type='POINT', location=(0, -0.08, 1.45))
    liquid_light = bpy.context.active_object
    liquid_light.name = "Safa_Internal_Liquid_Glow"
    liquid_light.data.energy = 18 # Warm 18W internal radiance
    liquid_light.data.color = (1.0, 0.58, 0.16)
    liquid_light.data.shadow_soft_size = 0.35
    
    # 3. FRONT BRAND EMBLEM PLAQUE (Located on FRONT at Y = -1.45)
    bpy.ops.mesh.primitive_cube_add(
        size=1.0, 
        location=(0, -1.45, 1.35)
    )
    plaque = bpy.context.active_object
    plaque.name = "Safa_Brand_Plaque"
    plaque.scale = (0.95, 0.04, 1.15)
    plaque.data.materials.append(noir_mat)
    bpy.ops.object.shade_smooth()
    
    # 3D 24K Gold Text: S A F A (Facing front towards camera, reads left-to-right correctly!)
    bpy.ops.object.text_add(location=(0, -1.48, 1.55))
    text_safa = bpy.context.active_object
    text_safa.name = "Safa_Text_Logo"
    text_safa.data.body = "S A F A"
    text_safa.data.align_x = 'CENTER'
    text_safa.data.align_y = 'CENTER'
    text_safa.data.size = 0.28
    text_safa.data.extrude = 0.02
    text_safa.rotation_euler = (math.radians(90), 0, 0)
    text_safa.data.materials.append(gold_mat)
    
    # 3D 24K Gold Subtitle: EXTRAIT DE PARFUM (Facing front towards camera)
    bpy.ops.object.text_add(location=(0, -1.48, 1.2))
    text_sub = bpy.context.active_object
    text_sub.name = "Safa_Text_Subtitle"
    text_sub.data.body = "EXTRAIT DE PARFUM"
    text_sub.data.align_x = 'CENTER'
    text_sub.data.align_y = 'CENTER'
    text_sub.data.size = 0.09
    text_sub.data.extrude = 0.015
    text_sub.rotation_euler = (math.radians(90), 0, 0)
    text_sub.data.materials.append(gold_mat)
    
    # 4. NECK COLLAR & CLASP
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=64, 
        radius=0.74, 
        depth=0.35, 
        location=(0, 0, 2.7)
    )
    collar = bpy.context.active_object
    collar.name = "Safa_Neck_Collar"
    collar.data.materials.append(gold_mat)
    bpy.ops.object.shade_smooth()
    
    # Noir velvet ribbon ring
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=64, 
        radius=0.76, 
        depth=0.15, 
        location=(0, 0, 2.7)
    )
    ribbon = bpy.context.active_object
    ribbon.name = "Safa_Velvet_Ribbon"
    ribbon.data.materials.append(noir_mat)
    bpy.ops.object.shade_smooth()
    
    # Gold clasp medallion on FRONT of ribbon
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.12, 
        minor_radius=0.035, 
        location=(0, -0.77, 2.7)
    )
    clasp = bpy.context.active_object
    clasp.name = "Safa_Gold_Clasp"
    clasp.rotation_euler = (math.radians(90), 0, 0)
    clasp.data.materials.append(gold_mat)
    
    # 5. ATOMIZER & NOZZLE (Revealed when cap lifts!)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=32, 
        radius=0.25, 
        depth=0.45, 
        location=(0, 0, 3.0)
    )
    nozzle = bpy.context.active_object
    nozzle.name = "Safa_Atomizer_Nozzle"
    nozzle.data.materials.append(gold_mat)
    bpy.ops.object.shade_smooth()
    
    # 6. FACETED DIAMOND-CUT CRYSTAL CAP (JOINED AS A SINGLE SOLID OBJECT - NEVER DETACHES!)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=8, # Octagonal diamond facet cut
        radius=0.88, 
        depth=0.85, 
        location=(0, 0, 3.55)
    )
    cap = bpy.context.active_object
    cap.name = "Safa_Crystal_Cap"
    cap.data.materials.append(glass_mat)
    
    # Upper crown bevel of cap
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=8, 
        radius=0.55, 
        depth=0.35, 
        location=(0, 0, 4.05)
    )
    cap_top = bpy.context.active_object
    cap_top.name = "Safa_Crystal_Cap_Top"
    cap_top.data.materials.append(glass_mat)
    
    # Join the cap and cap_top into ONE single unified object
    bpy.ops.object.select_all(action='DESELECT')
    cap.select_set(True)
    cap_top.select_set(True)
    bpy.context.view_layer.objects.active = cap
    bpy.ops.object.join()
    
    # Set cap pivot origin to its resting center
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='MEDIAN')
    
    # 7. ANIMATION: CAP LIFTS UP AND GLIDES DOWN (90 Frames)
    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 90
    
    rest_z = cap.location.z
    lift_z = rest_z + 1.45 # Lifts 1.45m up
    
    # Frame 1: Resting on bottle
    cap.location.z = rest_z
    cap.keyframe_insert(data_path="location", frame=1)
    
    # Frame 35: Lifts UP in air revealing golden nozzle!
    cap.location.z = lift_z
    cap.keyframe_insert(data_path="location", frame=35)
    
    # Frame 52: Hovers gently at apex
    cap.location.z = lift_z
    cap.keyframe_insert(data_path="location", frame=52)
    
    # Frame 78: Glides smoothly back DOWN
    cap.location.z = rest_z
    cap.keyframe_insert(data_path="location", frame=78)
    
    # Frame 90: Closed resting loop
    cap.location.z = rest_z
    cap.keyframe_insert(data_path="location", frame=90)
    
    # Smooth bezier interpolation for luxurious fluid motion
    try:
        if cap.animation_data and cap.animation_data.action:
            for fcurve in cap.animation_data.action.fcurves:
                for kf in fcurve.keyframe_points:
                    kf.interpolation = 'BEZIER'
    except Exception:
        pass
    
    # 8. CALIBRATED STUDIO LIGHTING RIG (Balanced Softboxes)
    # Key Light: Vertical softbox strip creating razor-sharp crystal highlight
    bpy.ops.object.light_add(type='AREA', location=(-2.6, -2.8, 2.8))
    key_light = bpy.context.active_object
    key_light.name = "Studio_Key_Light"
    key_light.data.energy = 160
    key_light.data.shape = 'RECTANGLE'
    key_light.data.size = 1.0
    key_light.data.size_y = 3.2
    key_light.rotation_euler = (math.radians(35), math.radians(-25), math.radians(-42))
    
    # Fill Light: Warm champagne softbox softening right shadows
    bpy.ops.object.light_add(type='AREA', location=(2.5, -2.4, 2.2))
    fill_light = bpy.context.active_object
    fill_light.name = "Studio_Fill_Light"
    fill_light.data.energy = 80
    fill_light.data.color = (1.0, 0.94, 0.88)
    fill_light.data.shape = 'RECTANGLE'
    fill_light.data.size = 1.6
    fill_light.data.size_y = 2.6
    fill_light.rotation_euler = (math.radians(30), math.radians(28), math.radians(45))
    
    # Rim / Overhead Light: Sparkling top highlights on cap facets and gold collar
    bpy.ops.object.light_add(type='AREA', location=(0, 1.4, 4.0))
    rim_light = bpy.context.active_object
    rim_light.name = "Studio_Rim_Light"
    rim_light.data.energy = 130
    rim_light.data.shape = 'DISK'
    rim_light.data.size = 2.2
    rim_light.rotation_euler = (math.radians(-55), 0, 0)
    
    # Front Soft Accent: Gentle illumination on the front gold plaque
    bpy.ops.object.light_add(type='AREA', location=(0, -3.8, 1.8))
    front_soft = bpy.context.active_object
    front_soft.name = "Studio_Front_Softbox"
    front_soft.data.energy = 50
    front_soft.data.color = (1.0, 0.97, 0.92)
    front_soft.data.size = 2.0
    front_soft.rotation_euler = (math.radians(12), 0, 0)

    # 9. LUXURY STUDIO CAMERA (Front Facing, 85mm Telephoto)
    bpy.ops.object.camera_add(
        location=(0, -5.6, 1.85),
        rotation=(math.radians(85), 0, 0)
    )
    cam = bpy.context.active_object
    cam.name = "Studio_Front_Camera"
    cam.data.lens = 85
    bpy.context.scene.camera = cam

    # =========================================================================
    # 10. EXPORT CLEAN GLB FOR WEBSITE (Auto-exports to public/models/ & Desktop)
    # =========================================================================
    # Convert 3D Text objects to Polygonal Meshes (required for glTF export)
    try:
        bpy.ops.object.select_all(action='DESELECT')
        text_safa.select_set(True)
        bpy.context.view_layer.objects.active = text_safa
        bpy.ops.object.convert(target='MESH')
    except Exception as e:
        print("Text convert logo note:", e)

    try:
        bpy.ops.object.select_all(action='DESELECT')
        text_sub.select_set(True)
        bpy.context.view_layer.objects.active = text_sub
        bpy.ops.object.convert(target='MESH')
    except Exception as e:
        print("Text convert sub note:", e)

    # Select ONLY the bottle components (NO background, NO lights, NO cameras!)
    flacon_components = [
        bottle, shoulder, liquid, meniscus, dip_tube,
        plaque, text_safa, text_sub, collar, ribbon,
        clasp, nozzle, cap
    ]

    bpy.ops.object.select_all(action='DESELECT')
    for comp in flacon_components:
        comp.select_set(True)
    bpy.context.view_layer.objects.active = bottle

    # Target export destinations
    project_export_path = "/home/mirzazain/Documents/safaWebsite/safaperfumes/public/models/safa_perfume_flacon.glb"
    desktop_export_path = os.path.expanduser("~/Desktop/safa_perfume_flacon.glb")

    exported_targets = []
    for out_path in [project_export_path, desktop_export_path]:
        try:
            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            bpy.ops.export_scene.gltf(
                filepath=out_path,
                export_format='GLB',
                use_selection=True,
                export_apply=True,
                export_animations=True,
                export_materials='EXPORT',
                export_cameras=False,
                export_lights=False
            )
            exported_targets.append(out_path)
            print(f"🎉 SUCCESS! Model exported to: {out_path}")
        except Exception as err:
            print(f"Export to {out_path} error:", err)

    # Deselect all objects for a clean final view
    bpy.ops.object.select_all(action='DESELECT')

    # 11. CONFIGURE 3D VIEWPORT (Switches into Camera View + Rendered Shading + Hides Gizmos)
    try:
        for area in bpy.context.screen.areas:
            if area.type == 'VIEW_3D':
                for space in area.spaces:
                    if space.type == 'VIEW_3D':
                        space.region_3d.view_perspective = 'CAMERA'
                        space.shading.type = 'RENDERED'
                        space.shading.use_scene_lights = True
                        space.shading.use_scene_world = True
                        space.overlay.show_overlays = False # Clean magazine view
    except Exception:
        pass

    print("\n" + "="*65)
    print("✨ SAFA LUXURY FLACON COMPLETED & EXPORTED!")
    print("="*65)
    print("1. Background: Completely removed (100% transparent background).")
    print("2. Liquid: Rich cognac amber with glass dip tube and meniscus.")
    print("3. Front Plaque: 24K gold embossed 'S A F A' facing camera.")
    print("4. Lifting Cap: 90-frame smooth elevation animation.")
    if exported_targets:
        print("5. Web Model: Successfully exported to:")
        for t in exported_targets:
            print(f"   -> {t}")
    print("="*65 + "\n")

if __name__ == "__main__":
    build_perfume()
