import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class MobiusRingController {
    constructor(scene) {
        this.scene = scene;
        this.mobiusRings = [];
        this.raycaster = new THREE.Raycaster();
        this.downVector = new THREE.Vector3(0, -1, 0);
    }

    loadMobiusRings(citySize) {
        const loader = new GLTFLoader();
        const maxRingHeight = 10; // Maximum allowed height for ring placement
        const verticalOffset = 1.0; // How high above ground to place rings

        loader.load(
            'static/glb/mobius.glb',
            (gltf) => {
                const mobiusModel = gltf.scene;
                
                // Get original size to calculate scale
                const box = new THREE.Box3().setFromObject(mobiusModel);
                const size = box.getSize(new THREE.Vector3());
                const scale = 1 / size.x; // Scale to make width = 1
                
                // Create instances
                for (let i = 0; i < 50; i++) {
                    const instance = mobiusModel.clone();
                    
                    // Scale uniformly to maintain proportions
                    instance.scale.set(scale, scale, scale);
                    
                    // Find valid position for ring
                    let validPosition = false;
                    let attempts = 0;
                    const maxAttempts = 10;
                    
                    while (!validPosition && attempts < maxAttempts) {
                        // Random position within city bounds
                        const x = (Math.random() - 0.5) * citySize.x;
                        const z = (Math.random() - 0.5) * citySize.z;
                        
                        // Start raycasting from high up
                        const rayStart = new THREE.Vector3(x, 100, z);
                        this.raycaster.set(rayStart, this.downVector);
                        
                        // Get all intersections with the scene
                        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
                        
                        if (intersects.length > 0) {
                            const groundHeight = intersects[0].point.y;
                            
                            // Check if ground height is acceptable
                            if (groundHeight <= maxRingHeight) {
                                instance.position.set(x, groundHeight + verticalOffset, z);
                                validPosition = true;
                            }
                        }
                        
                        attempts++;
                    }
                    
                    // If no valid position found after max attempts, place at default height
                    if (!validPosition) {
                        const x = (Math.random() - 0.5) * citySize.x;
                        const z = (Math.random() - 0.5) * citySize.z;
                        instance.position.set(x, verticalOffset, z);
                    }
                    
                    // Add random rotation speeds
                    instance.rotationSpeed = {
                        x: (Math.random() - 0.5) * 2, // Random speed between -1 and 1
                        y: (Math.random() - 0.5) * 2,
                        z: (Math.random() - 0.5) * 2
                    };
                    
                    this.scene.add(instance);
                    this.mobiusRings.push(instance);
                }
            },
            undefined,
            (error) => {
                console.error('Error loading mobius GLB:', error);
            }
        );
    }

    updateMobiusRings(deltaTime) {
        this.mobiusRings.forEach((ring) => {
            ring.rotation.x += ring.rotationSpeed.x * deltaTime;
            ring.rotation.y += ring.rotationSpeed.y * deltaTime;
            ring.rotation.z += ring.rotationSpeed.z * deltaTime;
        });
    }

    removeRing(ring) {
        const index = this.mobiusRings.indexOf(ring);
        if (index !== -1) {
            this.scene.remove(ring);
            this.mobiusRings.splice(index, 1);
            return true;
        }
        return false;
    }

    getRings() {
        return this.mobiusRings;
    }
}
