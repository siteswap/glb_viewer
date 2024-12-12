import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MovementController } from './MovementController.js';
import { MobiusRingController } from './MobiusRingController.js';

export class PhysicsController {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.plasmaBlasts = [];
        this.score = 0;
        this.gravity = -9.8;

        this.plasmaSpeed = 30.0;
        this.plasmaLifetime = 2.0; // seconds
        
        this.movementController = new MovementController(camera);
        this.mobiusRingController = new MobiusRingController(scene);
    }

    loadMobiusRings(citySize) {
        this.mobiusRingController.loadMobiusRings(citySize);
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
                const mobiusRings = this.mobiusRingController.getRings();
                const mobiusRing = mobiusRings.find(ring => ring === hitObject || ring.children.includes(hitObject));
                
                if (mobiusRing) {
                    // Remove the mobius ring
                    if (this.mobiusRingController.removeRing(mobiusRing)) {
                        this.score += 1;
                    }
                }

                // Remove the plasma blast
                this.scene.remove(plasma);
                this.plasmaBlasts.splice(i, 1);
            }
        }
    }

    update(deltaTime) {
        if (!this.camera || !this.scene) return;

        const collidableMeshes = [];
        this.scene.traverse(object => {
            if (object.isMesh && object !== this.camera) {
                collidableMeshes.push(object);
            }
        });

        this.mobiusRingController.updateMobiusRings(deltaTime);
        this.movementController.update(deltaTime, collidableMeshes);
        this.updatePlasmaBlasts(deltaTime, collidableMeshes);
    }
}
