"""
Safa Perfumes - Hero Flacon (web-safe GLB build)
================================================
Run in Blender (Scripting tab -> Run Script) or headless:
    blender --background --python safa_perfume_blender.py

Compatible with Blender 3.6 LTS, 4.x and 5.x.

What changed vs the previous version (all aimed at the website, not Cycles renders):
  * Label patch faces OUTWARD now (it faced inward before, which is what flips/mirrors
    the logo on the web). FLIP_LOGO_U lets you flip it in one line if your PNG is mirrored.
  * No transmission / volume nodes. three.js cannot render transmissive glass nested in
    transmissive liquid, and the volume node never exports to glTF. Glass and liquid use
    alpha-blend instead, which looks right in the browser.
  * Glass body is a hollow shell with a solid crystal base, liquid is a lighter champagne
    gold (the old cognac orange read as a tin can).
  * Orifice no longer uses the logo decal (it was invisible).
  * Spray scale starts at 0.001 (zero scale breaks matrices in three.js).
  * Everything exports as ONE animation clip (frames 1-90) so the site only plays one clip.
  * Fewer, softer petals and leaves, no orange rose core.
"""

import bpy
import bmesh
import math
import os

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
PROJECT_DIR = "/home/mirzazain/Documents/safaWebsite/safaperfumes"
DECAL_CANDIDATES = [
    os.path.join(PROJECT_DIR, "public/images/safa-bottle-decal.png"),
    "/tmp/safa-bottle-decal.png",
    os.path.expanduser("~/Desktop/safa-bottle-decal.png"),
]
EXPORT_TARGETS = [
    os.path.join(PROJECT_DIR, "public/models/safa_perfume_flacon.glb"),
    os.path.join(PROJECT_DIR, "public/models/safa_perfume_v3.glb"),
    os.path.join(PROJECT_DIR, "public/models/safa_perfume_v2.glb"),
    os.path.expanduser("~/Desktop/safa_perfume_flacon.glb"),
]
FLIP_LOGO_U = False   # set True if the logo still appears mirrored on the bottle
FPS = 30
END_FRAME = 90


# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------
def clean_scene():
    if bpy.context.object and bpy.context.object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.curves,
                 bpy.data.lights, bpy.data.cameras, bpy.data.images,
                 bpy.data.actions):
        for block in list(coll):
            coll.remove(block)


def set_in(bsdf, names, value):
    """Set the first Principled input that exists (names differ between Blender versions)."""
    for n in names:
        sock = bsdf.inputs.get(n)
        if sock is not None:
            sock.default_value = value
            return True
    return False


def set_blend(mat):
    try:
        mat.blend_method = 'BLEND'
    except Exception:
        pass
    try:
        mat.shadow_method = 'NONE'
    except Exception:
        pass
    mat.use_backface_culling = False


def make_material(name, color, metallic=0.0, roughness=0.5, alpha=1.0,
                  emission=None, emission_strength=0.0, ior=None):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    set_in(bsdf, ['Alpha'], alpha)
    if ior:
        set_in(bsdf, ['IOR'], ior)
    if emission:
        set_in(bsdf, ['Emission Color', 'Emission'], emission)
        set_in(bsdf, ['Emission Strength'], emission_strength)
    if alpha < 1.0:
        set_blend(mat)
    nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    return mat


def make_decal_material(name="Safa_Logo_Decal"):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    set_blend(mat)
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.05, 0.24, 0.14, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.3
    bsdf.inputs['Metallic'].default_value = 0.0

    img_path = next((p for p in DECAL_CANDIDATES if os.path.exists(p)), None)
    alpha_sock = bsdf.inputs.get('Alpha')
    if img_path:
        tex = nt.nodes.new('ShaderNodeTexImage')
        tex.image = bpy.data.images.load(img_path)
        tex.image.alpha_mode = 'STRAIGHT'
        tex.extension = 'CLIP'
        nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
        nt.links.new(tex.outputs['Alpha'], alpha_sock)
        print(f"Logo decal loaded: {img_path}")
    else:
        alpha_sock.default_value = 0.0
        print("WARNING: safa-bottle-decal.png not found - label will be invisible.")
    nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    return mat


def shade_smooth(obj):
    for poly in obj.data.polygons:
        poly.use_smooth = True


def add_cylinder(name, radius, depth, loc, mat, parent, verts=64, smooth=True):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(mat)
    obj.parent = parent
    if smooth:
        shade_smooth(obj)
    return obj


def key(obj, path, frame):
    obj.keyframe_insert(data_path=path, frame=frame)


# ---------------------------------------------------------------------------
# GEOMETRY
# ---------------------------------------------------------------------------
def create_curved_label_patch(name, radius, height, center_z, arc_deg=72):
    """Curved patch on the -Y (front) side. Normals face OUTWARD, UV (0,0) = bottom-left as seen from the front."""
    mesh = bpy.data.meshes.new(name)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)

    bm = bmesh.new()
    rows, cols = 10, 28
    arc = math.radians(arc_deg)

    grid = []
    for r in range(rows + 1):
        z = (center_z - height / 2.0) + (r / rows) * height
        row = []
        for c in range(cols + 1):
            ang = -math.pi / 2.0 - arc / 2.0 + (c / cols) * arc
            row.append(bm.verts.new((math.cos(ang) * radius, math.sin(ang) * radius, z)))
        grid.append(row)

    uv_layer = bm.loops.layers.uv.new("UVMap")

    def u(c):
        v = c / cols
        return 1.0 - v if FLIP_LOGO_U else v

    for r in range(rows):
        for c in range(cols):
            # counter-clockwise seen from the front camera => normal points outward
            f = bm.faces.new([grid[r][c], grid[r][c + 1], grid[r + 1][c + 1], grid[r + 1][c]])
            f.loops[0][uv_layer].uv = (u(c), r / rows)
            f.loops[1][uv_layer].uv = (u(c + 1), r / rows)
            f.loops[2][uv_layer].uv = (u(c + 1), (r + 1) / rows)
            f.loops[3][uv_layer].uv = (u(c), (r + 1) / rows)
            f.smooth = True

    bm.to_mesh(mesh)
    bm.free()
    return obj


def create_single_petal_mesh(name, width=0.45, length=0.6, curvature=0.15):
    mesh = bpy.data.meshes.new(name)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)

    bm = bmesh.new()
    res = 7
    grid = []
    for r in range(res):
        v = r / (res - 1)
        row = []
        for c in range(res):
            u = c / (res - 1)
            x = (u - 0.5) * width * math.sin(v * math.pi) * 1.3
            y = (v - 0.5) * length
            dist = math.sqrt((u - 0.5) ** 2 + (v - 0.4) ** 2)
            z = -curvature * (1.0 - dist * 1.5)
            row.append(bm.verts.new((x, y, z)))
        grid.append(row)
    for r in range(res - 1):
        for c in range(res - 1):
            bm.faces.new([grid[r][c], grid[r + 1][c], grid[r + 1][c + 1], grid[r][c + 1]])
    bm.to_mesh(mesh)
    bm.free()
    shade_smooth(obj)

    mod = obj.modifiers.new(name="Solidify", type='SOLIDIFY')
    mod.thickness = 0.008
    return obj


def create_rose(name, location, scale, rotation, core_mat, outer_mat, leaf_mat):
    root = bpy.data.objects.new(name, None)
    root.location = location
    root.scale = (scale, scale, scale)
    root.rotation_euler = rotation
    bpy.context.collection.objects.link(root)

    whorls = [
        {"count": 4,  "rad": 0.08, "len": 0.25, "wid": 0.22, "tilt": 15, "z": 0.05,  "mat": core_mat},
        {"count": 6,  "rad": 0.16, "len": 0.35, "wid": 0.32, "tilt": 35, "z": 0.03,  "mat": core_mat},
        {"count": 8,  "rad": 0.26, "len": 0.45, "wid": 0.42, "tilt": 55, "z": 0.0,   "mat": outer_mat},
        {"count": 10, "rad": 0.38, "len": 0.55, "wid": 0.52, "tilt": 75, "z": -0.04, "mat": outer_mat},
    ]
    golden = math.radians(137.5)
    accum = 0.0
    for wi, w in enumerate(whorls):
        for i in range(w["count"]):
            ang = accum + (i / w["count"]) * math.pi * 2
            petal = create_single_petal_mesh(f"{name}_P_{wi}_{i}", w["wid"], w["len"], 0.12 - wi * 0.02)
            petal.location = (math.cos(ang) * w["rad"], math.sin(ang) * w["rad"], w["z"])
            petal.rotation_euler = (math.radians(w["tilt"]), 0, ang + math.pi / 2)
            petal.data.materials.append(w["mat"])
            petal.parent = root
        accum += golden

    for i in range(5):
        a = (i / 5.0) * math.pi * 2 + 0.25
        leaf = create_single_petal_mesh(f"{name}_Leaf_{i}", 0.34, 0.75, 0.15)
        leaf.location = (math.cos(a) * 0.5, math.sin(a) * 0.5, 0.04)
        leaf.rotation_euler = (math.radians(72), 0, a + math.pi / 2)
        leaf.data.materials.append(leaf_mat)
        leaf.parent = root
    return root


def create_crown_rib(name, angle, gold_mat, parent):
    cd = bpy.data.curves.new(name=name, type='CURVE')
    cd.dimensions = '3D'
    cd.bevel_depth = 0.055
    cd.bevel_resolution = 4
    sp = cd.splines.new('BEZIER')
    sp.bezier_points.add(2)

    ca, sa = math.cos(angle), math.sin(angle)
    p0, p1, p2 = sp.bezier_points
    p0.co = (ca * 0.52, sa * 0.52, 4.05)
    p0.handle_left = (ca * 0.52, sa * 0.52, 3.85)
    p0.handle_right = (ca * 0.77, sa * 0.77, 4.35)
    p1.co = (ca * 0.84, sa * 0.84, 4.75)
    p1.handle_left = (ca * 0.84, sa * 0.84, 4.45)
    p1.handle_right = (ca * 0.84, sa * 0.84, 5.05)
    p2.co = (ca * 0.18, sa * 0.18, 5.35)
    p2.handle_left = (ca * 0.45, sa * 0.45, 5.25)
    p2.handle_right = (0, 0, 5.40)

    obj = bpy.data.objects.new(name, cd)
    obj.data.materials.append(gold_mat)
    bpy.context.collection.objects.link(obj)
    obj.parent = parent
    return obj


# ---------------------------------------------------------------------------
# BUILD
# ---------------------------------------------------------------------------
def build_perfume():
    clean_scene()
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.render.fps = FPS
    scene.frame_start = 1
    scene.frame_end = END_FRAME
    scene.render.film_transparent = True

    # ---- materials (web-safe: alpha blend, no transmission/volume) ----
    glass_mat   = make_material("Safa_Crystal_Glass", (0.80, 0.95, 0.88, 1.0), roughness=0.04, alpha=0.16, ior=1.5)
    base_mat    = make_material("Safa_Crystal_Base",  (0.80, 0.95, 0.88, 1.0), roughness=0.05, alpha=0.40, ior=1.5)
    liquid_mat  = make_material("Safa_Champagne_Liquid", (0.96, 0.80, 0.45, 1.0), roughness=0.10, alpha=0.80,
                                emission=(1.0, 0.78, 0.35, 1.0), emission_strength=0.25)
    gold_mat    = make_material("Safa_24K_Gold", (1.0, 0.80, 0.34, 1.0), metallic=1.0, roughness=0.22)
    dark_mat    = make_material("Safa_Orifice", (0.05, 0.04, 0.03, 1.0), metallic=1.0, roughness=0.4)
    jewel_mat   = make_material("Safa_Crown_Jewel", (0.10, 0.65, 0.55, 1.0), roughness=0.05, ior=1.65,
                                emission=(0.10, 0.65, 0.55, 1.0), emission_strength=0.4)
    mist_mat    = make_material("Safa_Mist", (1.0, 0.92, 0.72, 1.0), roughness=0.2, alpha=0.28,
                                emission=(1.0, 0.88, 0.55, 1.0), emission_strength=0.8)
    decal_mat   = make_decal_material()

    rose_core   = make_material("Rose_Blush_Core",  (0.70, 0.10, 0.22, 1.0), roughness=0.55)
    rose_outer  = make_material("Rose_Blush_Outer", (0.90, 0.35, 0.48, 1.0), roughness=0.55)
    ivory_core  = make_material("Rose_Ivory_Core",  (0.93, 0.80, 0.68, 1.0), roughness=0.55)
    ivory_outer = make_material("Rose_Ivory_Outer", (0.92, 0.86, 0.82, 1.0), roughness=0.55)
    leaf_mat    = make_material("Rose_Leaf",        (0.06, 0.30, 0.12, 1.0), roughness=0.5)
    for m in (rose_core, rose_outer, ivory_core, ivory_outer, leaf_mat):
        m.use_backface_culling = False

    master = bpy.data.objects.new("Safa_Hero_Flacon_Scene", None)
    bpy.context.collection.objects.link(master)

    # ---- bottle body: hollow shell + solid crystal base ----
    body = add_cylinder("Safa_Bottle_Glass", 1.20, 3.60, (0, 0, 1.80), glass_mat, master)
    bev = body.modifiers.new("Bevel", 'BEVEL')
    bev.width = 0.035
    bev.segments = 3
    sol = body.modifiers.new("Shell", 'SOLIDIFY')
    sol.thickness = 0.05
    sol.offset = -1.0

    add_cylinder("Safa_Crystal_Base", 1.15, 0.50, (0, 0, 0.30), base_mat, master)

    # ---- liquid ----
    liquid_h = 2.70
    liquid_z0 = 0.55
    add_cylinder("Safa_Perfume_Liquid", 1.10, liquid_h, (0, 0, liquid_z0 + liquid_h / 2), liquid_mat, master)
    add_cylinder("Safa_Liquid_Meniscus", 1.10, 0.03, (0, 0, liquid_z0 + liquid_h), liquid_mat, master)
    add_cylinder("Safa_Dip_Tube", 0.035, 3.1, (0, -0.03, 2.25), glass_mat, master, verts=24)

    # ---- front logo ----
    decal = create_curved_label_patch("Safa_Front_Brand_Label", radius=1.214, height=1.65, center_z=2.05)
    decal.data.materials.append(decal_mat)
    decal.parent = master

    # ---- collar + nozzle ----
    add_cylinder("Safa_Neck_Collar", 0.46, 0.40, (0, 0, 3.80), gold_mat, master)
    add_cylinder("Safa_Atomizer_Nozzle", 0.30, 0.55, (0, 0, 4.25), gold_mat, master, verts=32)
    orifice = add_cylinder("Safa_Spray_Orifice", 0.038, 0.08, (0, -0.30, 4.38), dark_mat, master, verts=16)
    orifice.rotation_euler = (math.radians(90), 0, 0)

    # ---- spray mist ----
    spray = bpy.data.objects.new("Safa_Spray_Mist_Plume", None)
    spray.location = (0, -0.32, 4.38)
    spray.parent = master
    bpy.context.collection.objects.link(spray)

    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=0.04, radius2=0.75, depth=1.8, location=(0.45, -0.85, 0.25))
    cone = bpy.context.active_object
    cone.name = "Mist_Spray_Cone"
    cone.rotation_euler = (math.radians(-65), math.radians(15), math.radians(-25))
    cone.data.materials.append(mist_mat)
    cone.parent = spray
    shade_smooth(cone)

    droplets = [(0.2, -0.4, 0.05, 0.025), (0.4, -0.7, 0.15, 0.035), (0.6, -1.0, 0.22, 0.040),
                (0.8, -1.3, 0.32, 0.045), (0.3, -0.8, -0.05, 0.030), (0.5, -1.1, 0.10, 0.038),
                (0.7, -1.4, 0.18, 0.042), (0.9, -1.6, 0.28, 0.048), (0.35, -0.6, 0.20, 0.032),
                (0.55, -0.9, 0.28, 0.036), (0.75, -1.2, 0.35, 0.044), (1.05, -1.5, 0.40, 0.050)]
    for i, (dx, dy, dz, r) in enumerate(droplets):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=r, location=(dx, dy, dz))
        d = bpy.context.active_object
        d.name = f"Mist_Droplet_{i}"
        d.data.materials.append(mist_mat)
        d.parent = spray
        shade_smooth(d)

    for frame, s in ((1, 0.001), (34, 0.001), (36, 0.5), (45, 1.4), (56, 2.0), (58, 0.001), (END_FRAME, 0.001)):
        spray.scale = (s, s, s)
        key(spray, "scale", frame)

    # ---- crown ----
    crown = bpy.data.objects.new("Safa_Royal_Crown_Cap", None)
    crown.parent = master
    bpy.context.collection.objects.link(crown)

    add_cylinder("Crown_Base_Band", 0.54, 0.38, (0, 0, 3.85), gold_mat, crown, verts=48)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.56, minor_radius=0.05, location=(0, 0, 4.05))
    rim = bpy.context.active_object
    rim.name = "Crown_Scalloped_Rim"
    rim.data.materials.append(gold_mat)
    rim.parent = crown

    for i in range(12):
        th = (i / 12) * math.pi * 2
        create_crown_rib(f"Crown_Arch_{i}", th, gold_mat, crown)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.045,
                                             location=(math.cos(th) * 0.58, math.sin(th) * 0.58, 4.12))
        pearl = bpy.context.active_object
        pearl.name = f"Crown_Pearl_{i}"
        pearl.data.materials.append(gold_mat)
        pearl.parent = crown
        shade_smooth(pearl)

    add_cylinder("Crown_Finial_Base", 0.22, 0.25, (0, 0, 5.42), gold_mat, crown, verts=32)
    bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.14, radius2=0.0, depth=0.35, location=(0, 0, 5.68))
    jt = bpy.context.active_object
    jt.name = "Crown_Apex_Jewel"
    jt.data.materials.append(jewel_mat)
    jt.parent = crown
    bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.14, radius2=0.0, depth=0.18, location=(0, 0, 5.50))
    jb = bpy.context.active_object
    jb.name = "Crown_Apex_Jewel_Base"
    jb.rotation_euler = (math.radians(180), 0, 0)
    jb.data.materials.append(jewel_mat)
    jb.parent = crown

    for frame, z, rx in ((1, 0.0, 0.0), (35, 1.65, -5.5), (55, 1.65, -5.5), (85, 0.0, 0.0), (END_FRAME, 0.0, 0.0)):
        crown.location = (0, 0, z)
        crown.rotation_euler = (math.radians(rx), 0, 0)
        key(crown, "location", frame)
        key(crown, "rotation_euler", frame)

    # ---- roses (pushed outward so they don't crowd the base) ----
    create_rose("Rose_Blush_Left", (-2.05, -0.65, 0.40), 1.1,
                (math.radians(25), math.radians(-15), math.radians(40)), rose_core, rose_outer, leaf_mat)
    create_rose("Rose_Ivory_Right", (2.10, -0.55, 0.35), 1.05,
                (math.radians(20), math.radians(20), math.radians(-30)), ivory_core, ivory_outer, leaf_mat)

    floor_petals = [((-0.75, -1.6, 0.02), (0.05, 0.08, 0.6), 0.95, rose_outer),
                    ((0.65, -1.7, 0.02), (-0.06, 0.04, -0.8), 0.9, rose_core),
                    ((1.45, -1.2, 0.02), (0.04, -0.07, 1.2), 1.1, ivory_outer),
                    ((-1.35, -1.3, 0.02), (-0.03, 0.06, -1.4), 1.05, rose_outer),
                    ((0.08, -1.95, 0.02), (0.02, 0.05, 0.2), 0.85, rose_core)]
    for i, (loc, rot, sc, mat) in enumerate(floor_petals):
        p = create_single_petal_mesh(f"Floor_Petal_{i}", 0.45 * sc, 0.55 * sc, 0.1)
        p.location, p.rotation_euler = loc, rot
        p.data.materials.append(mat)
        p.parent = master

    air_petals = [((-1.5, -0.8, 3.2), (0.4, 0.3, 0.8), (0.15, -0.05, -0.25), rose_outer),
                  ((1.4, -0.7, 3.9), (-0.3, 0.5, -0.6), (-0.2, 0.08, -0.3), rose_core),
                  ((-0.8, -1.0, 4.6), (0.2, -0.4, 1.1), (0.1, 0.1, -0.2), ivory_outer),
                  ((1.6, 0.3, 2.5), (-0.5, 0.2, -0.9), (-0.12, -0.08, -0.2), rose_outer),
                  ((-1.7, 0.5, 2.2), (0.3, -0.5, 0.4), (0.18, 0.06, -0.22), rose_core)]
    for i, (loc, rot, drift, mat) in enumerate(air_petals):
        p = create_single_petal_mesh(f"Flowing_Petal_{i}", 0.42, 0.52, 0.14)
        p.data.materials.append(mat)
        p.parent = master
        p.location, p.rotation_euler = loc, rot
        key(p, "location", 1)
        key(p, "rotation_euler", 1)
        p.location = tuple(loc[k] + drift[k] for k in range(3))
        p.rotation_euler = (rot[0] + 0.35, rot[1] + 0.25, rot[2] + 0.45)
        key(p, "location", 45)
        key(p, "rotation_euler", 45)
        p.location, p.rotation_euler = loc, rot
        key(p, "location", END_FRAME)
        key(p, "rotation_euler", END_FRAME)

    # ---- preview lights + camera (not exported) ----
    def add_light(kind, loc, energy, rot=(0, 0, 0), size=None, color=(1, 0.97, 0.92)):
        bpy.ops.object.light_add(type=kind, location=loc)
        l = bpy.context.active_object
        l.data.energy = energy
        l.data.color = color
        l.rotation_euler = tuple(math.radians(a) for a in rot)
        if size:
            l.data.size = size
        return l

    add_light('AREA', (-3.8, -4.5, 4.5), 460, (52, 0, -38), 2.4)
    add_light('AREA', (4.2, 3.2, 4.2), 380, (-50, 0, 135), 2.0, (1, 0.88, 0.72))
    add_light('AREA', (0, -5.5, 2.5), 180, (68, 0, 0), 3.5)
    bpy.ops.object.camera_add(location=(0, -6.2, 2.8))
    cam = bpy.context.active_object
    cam.rotation_euler = (math.radians(82), 0, 0)
    cam.data.lens = 85
    scene.camera = cam

    export_glb()


def export_glb():
    lines = []

    def say(msg):
        print(msg)
        lines.append(msg)

    # 1. make sure the glTF exporter add-on is enabled
    try:
        bpy.ops.preferences.addon_enable(module='io_scene_gltf2')
    except Exception as e:
        say(f"addon_enable note: {e}")

    # 2. only pass options this Blender version actually has
    try:
        valid = set(bpy.ops.export_scene.gltf.get_rna_type().properties.keys())
    except Exception as e:
        valid = set()
        say(f"glTF exporter not found: {e}")

    wanted = dict(
        export_format='GLB',
        use_selection=False,
        export_apply=True,
        export_yup=True,
        export_materials='EXPORT',
        export_animations=True,
        export_lights=False,
        export_cameras=False,
        export_animation_mode='SCENE',
        export_anim_single_clip=True,
    )
    kwargs = {k: v for k, v in wanted.items() if k in valid}
    if 'export_animation_mode' in kwargs:
        kwargs.pop('export_anim_single_clip', None)
    dropped = sorted(set(wanted) - set(kwargs))
    if dropped:
        say("Skipped options this Blender does not have: " + ", ".join(dropped))

    # 3. export to every target
    ok_paths = []
    for path in EXPORT_TARGETS:
        try:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            bpy.ops.export_scene.gltf(filepath=path, **kwargs)
            if os.path.exists(path):
                say(f"OK  {path}  ({os.path.getsize(path) / 1024:.0f} KB)")
                ok_paths.append(path)
            else:
                say(f"FAILED (no file written): {path}")
        except Exception as e:
            say(f"FAILED {path}: {e}")

    if not any(os.path.exists(p) for p in DECAL_CANDIDATES):
        say("Logo PNG not found - label will be empty. Put safa-bottle-decal.png in public/images/")

    # 4. report where you can actually see it: popup + log file
    try:
        with open(os.path.expanduser("~/safa_export_log.txt"), "w") as f:
            f.write("\n".join(lines))
    except Exception:
        pass

    def draw(self, context):
        for l in (lines or ["No export attempted"]):
            self.layout.label(text=l[:110])
    try:
        bpy.context.window_manager.popup_menu(
            draw, title="Safa GLB export" + (" - DONE" if ok_paths else " - FAILED"),
            icon='CHECKMARK' if ok_paths else 'ERROR')
    except Exception:
        pass


if __name__ == "__main__":
    build_perfume()