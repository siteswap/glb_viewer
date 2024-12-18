from PIL import Image
import os

def create_gradient(filename, start_color, end_color, size=(512, 512)):
    image = Image.new('RGB', size)
    pixels = image.load()
    
    for y in range(size[1]):
        r = int(start_color[0] + (end_color[0] - start_color[0]) * (y / size[1]))
        g = int(start_color[1] + (end_color[1] - start_color[1]) * (y / size[1]))
        b = int(start_color[2] + (end_color[2] - start_color[2]) * (y / size[1]))
        
        for x in range(size[0]):
            pixels[x, y] = (r, g, b)
    
    image.save(filename)

def create_skybox():
    # Create skybox directory if it doesn't exist
    skybox_dir = 'static/textures/skybox'
    if not os.path.exists(skybox_dir):
        os.makedirs(skybox_dir)

    # Sky blue to darker blue for sides
    create_gradient(f'{skybox_dir}/px.jpg', (135, 206, 235), (25, 25, 112))  # Right
    create_gradient(f'{skybox_dir}/nx.jpg', (135, 206, 235), (25, 25, 112))  # Left
    create_gradient(f'{skybox_dir}/pz.jpg', (135, 206, 235), (25, 25, 112))  # Front
    create_gradient(f'{skybox_dir}/nz.jpg', (135, 206, 235), (25, 25, 112))  # Back
    
    # Lighter blue for top
    create_gradient(f'{skybox_dir}/py.jpg', (135, 206, 235), (135, 206, 235))  # Top
    
    # Darker blue for bottom
    create_gradient(f'{skybox_dir}/ny.jpg', (25, 25, 112), (25, 25, 112))  # Bottom

if __name__ == '__main__':
    create_skybox()
