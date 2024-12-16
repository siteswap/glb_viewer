import { MovementController } from './MovementController.js';
import { MobiusRingController } from './MobiusRingController.js';
import { PlasmaBlastController } from './PlasmaBlastController.js';

export class PhysicsController {
    constructor(camera, scene, movementController) {
        this.camera = camera;
        this.scene = scene;
        this.score = 0;
      
        this.movementController = movementController;
        this.mobiusRingController = new MobiusRingController(scene); // scene to add/remove
        this.plasmaBlastController = new PlasmaBlastController(camera, scene); // camera to get direction, scene to add/remove
    }

    loadMobiusRings(citySize) {
        this.mobiusRingController.loadMobiusRings(citySize);
    }

    onMouseClick(event) {
        if (event.button === 0) { // Left click
            this.plasmaBlastController.tryShoot();
        }
    }

    toggleContinuousFire() {
        this.plasmaBlastController.toggleContinuousFire();
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
        
        const collisions = this.plasmaBlastController.updatePlasmaBlasts(deltaTime, collidableMeshes);
        
        // Handle collisions
        for (const collision of collisions) {
            const mobiusRing = this.mobiusRingController.isMobiusRing(collision)
            if (mobiusRing) {
                if (this.mobiusRingController.removeRing(mobiusRing)) {
                    this.score += 1;
                }
            }
        }
    }
}
