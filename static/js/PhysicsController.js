import { MovementController } from './MovementController.js';
import { MobiusRingController } from './MobiusRingController.js';
import { PlasmaBlastController } from './PlasmaBlastController.js';

export class PhysicsController {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.score = 0;
       
        // No direct dependencies between these modules. PhysicsController manages all interactions.
        this.movementController = new MovementController(camera);
        this.mobiusRingController = new MobiusRingController(scene); // scene to add/remove
        this.plasmaBlastController = new PlasmaBlastController(camera, scene); // camera to get direction, scene to add/remove

        // Shooting rate limit (5 shots per second = 200ms between shots)
        this.lastShotTime = 0;
        this.shootingCooldown = 200; // milliseconds
        
        // Continuous fire mode
        this.continuousFireEnabled = false;
    }

    loadMobiusRings(citySize) {
        this.mobiusRingController.loadMobiusRings(citySize);
    }

    onMouseClick(event) {
        if (event.button === 0) { // Left click
            this.tryShoot();
        }
    }

    onShootButtonHeld() {
        // Only process continuous shooting if continuous fire is disabled
        // When continuous fire is enabled, shooting is handled in update()
        if (!this.continuousFireEnabled) {
            this.tryShoot();
        }
    }

    toggleContinuousFire() {
        this.continuousFireEnabled = !this.continuousFireEnabled;
    }

    tryShoot() {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime >= this.shootingCooldown) {
            this.plasmaBlastController.createPlasmaBlast();
            this.lastShotTime = currentTime;
        }
    }

    onKeyDown(event) {
        this.movementController.onKeyDown(event);
    }

    onKeyUp(event) {
        this.movementController.onKeyUp(event);
    }

    onCyclingPower(watts) {
        this.movementController.onCyclingPower(watts);
    }

    isMobiusRing(object) {
        const mobiusRings = this.mobiusRingController.getRings();
        return mobiusRings.find(ring => ring === object || ring.children.includes(object));
    }

    update(deltaTime) {
        if (!this.camera || !this.scene) return;

        const collidableMeshes = [];
        this.scene.traverse(object => {
            if (object.isMesh && object !== this.camera) {
                collidableMeshes.push(object);
            }
        });

        // Handle continuous fire mode
        if (this.continuousFireEnabled) {
            this.tryShoot();
        }

        this.mobiusRingController.updateMobiusRings(deltaTime);
        this.movementController.update(deltaTime, collidableMeshes);
        
        const collisions = this.plasmaBlastController.updatePlasmaBlasts(deltaTime, collidableMeshes);
        
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
