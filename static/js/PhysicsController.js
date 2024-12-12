import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MovementController } from './MovementController.js';

export class PhysicsController {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.plasmaBlasts = [];
        this.mobiusRings = [];
        this.score = 0;
        this.gravity = -9.8;
        this.velocity = new THREE.Vector3();
        this.plasmaSpeed = 30.0;
        this.plasmaLifetime = 2.0; // seconds
        
        this.movementController = new MovementController(camera);
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
                    instance.position.set(x, 1.8, z);
                    
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

    createPlasmaBlast() {
        const geometry = new THREE.SphereGeometry(0.2, 16, 16);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 2,
            transparent: true,
            opacity: 0.8
        });
        const plasma = new THREE.Mesh(geometry, material);
        
        // Set initial position at camera position
        plasma.position.copy(this.camera.position);
        
        // Get direction camera is facing
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        
        // Store velocity for this plasma blast
        plasma.velocity = direction.multiplyScalar(this.plasmaSpeed);
        plasma.timeCreated = Date.now();
        
        this.scene.add(plasma);
        this.plasmaBlasts.push(plasma);
    }

    onMouseClick(event) {
        if (event.button === 0) { // Left click
            this.createPlasmaBlast();
        }
    }

    onKeyDown(event) {
        this.movementController.onKeyDown(event);
    }

    onKeyUp(event) {
        this.movementController.onKeyUp(event);
    }

    updatePlasmaBlasts(deltaTime, collidableMeshes) {
        for (let i = this.plasmaBlasts.length - 1; i >= 0; i--) {
            const plasma = this.plasmaBlasts[i];
            
            // Move plasma
            plasma.position.add(plasma.velocity.clone().multiplyScalar(deltaTime));
            
            // Check lifetime
            const age = (Date.now() - plasma.timeCreated) / 1000; // Convert to seconds
            if (age > this.plasmaLifetime) {
                this.scene.remove(plasma);
                this.plasmaBlasts.splice(i, 1);
                continue;
            }

            // Check for collisions with objects
            const plasmaRaycaster = new THREE.Raycaster(
                plasma.position,
                plasma.velocity.clone().normalize(),
                0,
                0.5
            );
            const intersects = plasmaRaycaster.intersectObjects(collidableMeshes);
            if (intersects.length > 0) {
                // Check if the intersected object is a mobius ring
                const hitObject = intersects[0].object;
                const mobiusIndex = this.mobiusRings.findIndex(ring => ring === hitObject || ring.children.includes(hitObject));
                
                if (mobiusIndex !== -1) {
                    // Remove the mobius ring
                    const mobiusRing = this.mobiusRings[mobiusIndex];
                    this.scene.remove(mobiusRing);
                    this.score += 1;
                    this.mobiusRings.splice(mobiusIndex, 1);
                }

                // Remove the plasma blast
                this.scene.remove(plasma);
                this.plasmaBlasts.splice(i, 1);
            }
        }
    }

    updateMobiusRings(deltaTime) {
        this.mobiusRings.forEach((ring) => {
            ring.rotation.x += ring.rotationSpeed.x * deltaTime;
            ring.rotation.y += ring.rotationSpeed.y * deltaTime;
            ring.rotation.z += ring.rotationSpeed.z * deltaTime;
        });
    }

    update(deltaTime) {
        if (!this.camera || !this.scene) return;

        const collidableMeshes = [];
        this.scene.traverse(object => {
            if (object.isMesh && object !== this.camera) {
                collidableMeshes.push(object);
            }
        });

        this.updateMobiusRings(deltaTime);
        this.movementController.update(deltaTime, collidableMeshes);
        this.updatePlasmaBlasts(deltaTime, collidableMeshes);
    }
}
