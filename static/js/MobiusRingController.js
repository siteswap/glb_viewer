import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class MobiusRingController {
    constructor(scene) {
        this.scene = scene;
        this.mobiusRings = [];
    }

    loadMobiusRings(citySize) {
        const loader = new GLTFLoader();
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
                    
                    // Random position within city bounds
                    const x = (Math.random() - 0.5) * citySize.x;
                    const z = (Math.random() - 0.5) * citySize.z;
                    const verticalOffset = 1.0
                    instance.position.set(x, verticalOffset, z);
                    
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
