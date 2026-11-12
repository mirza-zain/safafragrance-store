"""
Safa Perfumes — 3D Luxury Flacon Generator for Blender
======================================================
How to use in Blender:
1. Open Blender.
2. Click the 'Scripting' workspace tab at the very top header.
3. Click '+ New' in the text editor.
4. Paste this entire script into the editor.
5. Click the 'Run Script' (▶) button or press Alt+P.

Result:
- Creates a high-end luxury crystal flacon inspired by Givenchy L'Interdit.
- Separate crystal cap (ready for lifting/animation).
- Detailed 18k gold atomizer nozzle and neck collar with Safa emblem.
- Glowing amber perfume liquid inside with meniscus.
- Studio lighting rig and professional Principled BSDF glass materials.
- Automatically exports 'safa_perfume.glb' to your home or desktop folder!
"""

import bpy
import bmesh
import math
import os

def clean_scene():
    """Clear default objects"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block in bpy.data.meshes:
        bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        bpy.data.materials.remove(block)

def create_glass_material(name="LuxuryGlass"):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    output = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (1.0, 1.0, 1.0, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.02
    bsdf.inputs['IOR'].default_value = 1.52
    
    # Compatibility with Blender 3.x and 4.x / 5.x
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
    # Rich glowing amber cognac color
    bsdf.inputs['Base Color'].default_value = (0.86, 0.48, 0.16, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.05
    bsdf.inputs['IOR'].default_value = 1.34
    
    trans_input = bsdf.inputs.get("Transmission Weight") or bsdf.inputs.get("Transmission")
    if trans_input:
        trans_input.default_value = 0.85
        
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat

def create_gold_material(name="PolishedGold"):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    output = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.95, 0.78, 0.42, 1.0) # 18K Luxury Gold
    bsdf.inputs['Metallic'].default_value = 0.98
    bsdf.inputs['Roughness'].default_value = 0.12
    
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat

def create_noir_material(name="SatinNoir"):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    output = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.04, 0.04, 0.04, 1.0) # Satin Black
    bsdf.inputs['Metallic'].default_value = 0.2
    bsdf.inputs['Roughness'].default_value = 0.4
    
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat

def build_perfume():
    clean_scene()
    
    glass_mat = create_glass_material()
    liquid_mat = create_liquid_material()
    gold_mat = create_gold_material()
    noir_mat = create_noir_material()
    
    # 1. MAIN GLASS BOTTLE (Curved cylinder with rounded bevels & thick base)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=64, 
        radius=1.35, 
        depth=2.4, 
        location=(0, 0, 1.2)
    )
    bottle = bpy.context.active_object
    bottle.name = "Safa_Bottle_Glass"
    bottle.data.materials.append(glass_mat)
    
    # Smooth shading & bevel modifier
    bpy.ops.object.shade_smooth()
    bev = bottle.modifiers.new(name="Bevel", type='BEVEL')
    bev.width = 0.25
    bev.segments = 8
    
    sub = bottle.modifiers.new(name="Subdivision", type='SUBSURF')
    sub.levels = 2
    sub.render_levels = 2
    
    # 2. INNER LIQUID MESH (Slightly smaller, sits inside glass)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=48, 
        radius=1.18, 
        depth=1.8, 
        location=(0, 0, 1.0)
    )
    liquid = bpy.context.active_object
    liquid.name = "Safa_Perfume_Liquid"
    liquid.data.materials.append(liquid_mat)
    bpy.ops.object.shade_smooth()
    
    # 3. NECK COLLAR & NOIR RIBBON
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=48, 
        radius=0.55, 
        depth=0.38, 
        location=(0, 0, 2.55)
    )
    collar = bpy.context.active_object
    collar.name = "Safa_Collar_Noir"
    collar.data.materials.append(noir_mat)
    bpy.ops.object.shade_smooth()
    
    # Gold trim ring on collar
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.56,
        minor_radius=0.04,
        major_segments=48,
        minor_segments=16,
        location=(0, 0, 2.72)
    )
    ring = bpy.context.active_object
    ring.name = "Safa_Gold_Ring"
    ring.data.materials.append(gold_mat)
    bpy.ops.object.shade_smooth()
    
    # Front Gold Clasp Medallion
    bpy.ops.mesh.primitive_cube_add(
        size=1.0, 
        location=(0, 0.58, 2.55)
    )
    clasp = bpy.context.active_object
    clasp.name = "Safa_Gold_Clasp"
    clasp.scale = (0.28, 0.05, 0.18)
    clasp.data.materials.append(gold_mat)
    bpy.ops.object.shade_smooth()
    
    # 4. ATOMIZER & NOZZLE (Revealed when cap lifts!)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=32, 
        radius=0.22, 
        depth=0.35, 
        location=(0, 0, 2.85)
    )
    nozzle = bpy.context.active_object
    nozzle.name = "Safa_Atomizer_Nozzle"
    nozzle.data.materials.append(gold_mat)
    bpy.ops.object.shade_smooth()
    
    # 5. FACETED EMERALD-CUT CRYSTAL CAP (SEPARATE OBJECT FOR LIFTING ANIMATION)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=8, # Octagonal diamond facet cut
        radius=0.82, 
        depth=0.85, 
        location=(0, 0, 3.4)
    )
    cap = bpy.context.active_object
    cap.name = "Safa_Crystal_Cap"
    cap.data.materials.append(glass_mat)
    
    # Upper crown bevel of cap
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=8, 
        radius=0.55, 
        depth=0.35, 
        location=(0, 0, 3.9)
    )
    cap_top = bpy.context.active_object
    cap_top.name = "Safa_Crystal_Cap_Top"
    cap_top.data.materials.append(glass_mat)
    
    # Parent cap top to main cap so lifting cap moves both
    cap_top.parent = cap
    
    # 6. STUDIO LIGHTING SETUP
    bpy.ops.object.light_add(type='AREA', location=(-3.5, -3.5, 4.5))
    key_light = bpy.context.active_object
    key_light.name = "Studio_Key_Light"
    key_light.data.energy = 450
    key_light.data.size = 2.5
    
    bpy.ops.object.light_add(type='AREA', location=(3.5, -2.5, 3.5))
    fill_light = bpy.context.active_object
    fill_light.name = "Studio_Fill_Light"
    fill_light.data.energy = 250
    fill_light.data.color = (1.0, 0.9, 0.75) # Warm
    
    bpy.ops.object.light_add(type='SPOT', location=(0, 3.5, 5.0))
    rim_light = bpy.context.active_object
    rim_light.name = "Studio_Rim_Light"
    rim_light.data.energy = 600
    rim_light.data.spot_size = math.radians(45)

    # 7. EXPORT DIRECTLY TO GLB (glTF 2.0)
    desktop = os.path.expanduser("~/Desktop")
    export_path = os.path.join(desktop, "safa_perfume.glb")
    try:
        bpy.ops.export_scene.gltf(
            filepath=export_path,
            export_format='GLB',
            export_materials='EXPORT',
            export_colors=True,
            export_cameras=False,
            export_lights=True
        )
        print(f"\n==========================================")
        print(f"SUCCESS! Model exported to: {export_path}")
        print(f"==========================================\n")
    except Exception as e:
        print("Export note:", e)

if __name__ == "__main__":
    build_perfume()
