import bpy
import math

# ----------------------------------------
# Parameters
# ----------------------------------------
s_segments = 256      # Number of segments along the length
t_segments = 1        # Just 1 segment across width -> 2 vertices per cross-section
strip_radius = 1.0
width = 0.4
name = "MobiusStrip"

# Remove existing objects
if bpy.data.objects.get(name):
    bpy.data.objects.remove(bpy.data.objects[name], do_unlink=True)
if bpy.data.meshes.get(name + "_Mesh"):
    bpy.data.meshes.remove(bpy.data.meshes[name + "_Mesh"], do_unlink=True)

# ----------------------------------------
# Generate Vertices
# ----------------------------------------
# Möbius strip parametric form:
# s in [0,4π], t in [-1,1] (2 points across)
# x(s, t) = (r + t*(width/2)*cos(s/2)) * cos(s)
# y(s, t) = (r + t*(width/2)*cos(s/2)) * sin(s)
# z(s, t) = (t*(width/2)*sin(s/2))

vertices = []
faces = []

for i in range(s_segments+1):
    s = 4.0 * math.pi * (i / s_segments)
    # We have only two values of t: -1 and 1
    for j in range(t_segments+1):
        t = -1.0 if j == 0 else 1.0
        x = (strip_radius + (t * (width/2.0)) * math.cos(s/2.0)) * math.cos(s)
        y = (strip_radius + (t * (width/2.0)) * math.cos(s/2.0)) * math.sin(s)
        z = (t * (width/2.0)) * math.sin(s/2.0)
        vertices.append((x, y, z))

# Create faces: 
# For each s segment, we have:
# (i,j)   (i+1,j)
#   +------+
#   |      |
#   +------+
# (i,j+1) (i+1,j+1)

# Since t_segments=1, each s segment forms one quad:
for i in range(s_segments):
    v1 = i*(t_segments+1) + 0
    v2 = (i+1)*(t_segments+1) + 0
    v3 = (i+1)*(t_segments+1) + 1
    v4 = i*(t_segments+1) + 1
    faces.append((v1, v2, v3, v4))

mesh = bpy.data.meshes.new(name + "_Mesh")
mesh.from_pydata(vertices, [], faces)
mesh.update()

obj = bpy.data.objects.new(name, mesh)
bpy.context.scene.collection.objects.link(obj)
bpy.context.view_layer.objects.active = obj
obj.select_set(True)

# ----------------------------------------
# Create Vertex Color Layer
# ----------------------------------------
color_layer = mesh.vertex_colors.new(name="Col")
color_data = color_layer.data

def hue_to_rgb(h):
    h = h % 1.0
    h6 = h * 6.0
    i = int(h6)
    f = h6 - i
    q = 1.0 - f
    if i == 0: r, g, b = 1.0, f, 0.0
    elif i == 1: r, g, b = q, 1.0, 0.0
    elif i == 2: r, g, b = 0.0, 1.0, f
    elif i == 3: r, g, b = 0.0, q, 1.0
    elif i == 4: r, g, b = f, 0.0, 1.0
    else:        r, g, b = 1.0, 0.0, q
    return (r, g, b, 1.0)

# Assign colors per face corner
# Each face has 4 corners, each corner corresponds to a loop in color_data.
# s runs from 0 to 4π. hue = s / (4π).
# At s=0, hue=0; at s=4π, hue=1 -> full cycle.
loop_index = 0
for i in range(s_segments):
    for quad_corner in range(4):
        # Determine s from the vertex index
        # The face corners correspond to vertices: v1, v2, v3, v4
        if quad_corner == 0:
            vert_index = i*(t_segments+1) + 0
        elif quad_corner == 1:
            vert_index = (i+1)*(t_segments+1) + 0
        elif quad_corner == 2:
            vert_index = (i+1)*(t_segments+1) + 1
        else:
            vert_index = i*(t_segments+1) + 1
        
        # Compute s for this vertex
        # vert_index // (t_segments+1) gives the s-segment index
        vert_s_i = vert_index // (t_segments+1)
        s_val = 4.0 * math.pi * (vert_s_i / s_segments)
        hue = s_val / (4.0 * math.pi)
        color_data[loop_index].color = hue_to_rgb(hue)
        loop_index += 1

# ----------------------------------------
# Create Material Using Vertex Colors
# ----------------------------------------
mat = bpy.data.materials.new(name + "_Material")
mat.use_nodes = True
nodes = mat.node_tree.nodes
links = mat.node_tree.links

# Clear default nodes
for node in nodes:
    nodes.remove(node)

# Create new nodes
output = nodes.new(type="ShaderNodeOutputMaterial")
output.location = (200, 0)

bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
bsdf.location = (0, 0)

vcol = nodes.new(type="ShaderNodeVertexColor")
vcol.location = (-200, 0)
vcol.layer_name = "Col"

links.new(vcol.outputs["Color"], bsdf.inputs["Base Color"])
links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])

obj.data.materials.append(mat)

print("Mobius strip created with a full 4π color gradient!")

