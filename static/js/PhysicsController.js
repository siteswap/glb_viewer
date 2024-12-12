import * as THREE from 'three';
import { MovementController } from './MovementController.js';
import { MobiusRingController } from './MobiusRingController.js';
import { PlasmaBlastController } from './PlasmaBlastController.js';

export class PhysicsController {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.plasmaBlasts = [];
        this.score = 0;
        this.gravity = -9.8;
        
        this.movementController = new MovementController(camera);
        this.mobiusRingController = new MobiusRingController(scene);
        this.plasmaBlastController = new PlasmaBlastController(camera, scene);
    }

    loadMobiusRings(citySize) {
        this.mobiusRingController.loadMobiusRings(citySize);
    }

    onMouseClick(event) {
        if (event.button === 0) { // Left click
            const plasma = this.plasmaBlastController.createPlasmaBlast();
            this.plasmaBlasts.push(plasma);
        }
    }

    onKeyDown(event) {
        this.movementController.onKeyDown(event);
    }

    onKeyUp(event) {
        this.movementController.onKeyUp(event);
    }

    isMobiusRing(object) {
        const mobiusRings = this.mobiusRingController.getRings();
        return mobiusRings.find(ring => ring === object || ring.children.includes(object));
    }

    updatePlasmaBlasts(deltaTime, collidableMeshes) {
        const collisions = [];

        for (let i = this.plasmaBlasts.length - 1; i >= 0; i--) {
            const plasma = this.plasmaBlasts[i];
            
            // Move plasma
            plasma.position.add(plasma.velocity.clone().multiplyScalar(deltaTime));
            
            // Check lifetime
            const age = (Date.now() - plasma.timeCreated) / 1000; // Convert to seconds
            if (age > this.plasmaBlastController.plasmaLifetime) {
                this.scene.remove(plasma);
                this.plasmaBlasts.splice(i, 1);
                continue;
            }

            // Get a Raycaster to check for collisions
            const plasmaRaycaster = new THREE.Raycaster(
                plasma.position,
                plasma.velocity.clone().normalize(),
                0,
                0.5
            );

            // Check for collisions with objects
            const intersects = plasmaRaycaster.intersectObjects(collidableMeshes);
            if (intersects.length > 0) {
                const hitObject = intersects[0].object;
                
                // Add collision information
                collisions.push(hitObject);

                // Remove the plasma blast
                this.scene.remove(plasma);
                this.plasmaBlasts.splice(i, 1);
            }
        }

        return collisions;
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
        
        const collisions = this.updatePlasmaBlasts(deltaTime, collidableMeshes);
        
        // Handle collisions
        for (const collision of collisions) {
            const mobiusRing = this.isMobiusRing(collision)
            if (mobiusRing) {
                if (this.mobiusRingController.removeRing(mobiusRing)) {
                    this.score += 1;
                }
            }
        }
    }
}
