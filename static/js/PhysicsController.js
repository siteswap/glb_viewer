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
    }

    loadMobiusRings(citySize) {
        this.mobiusRingController.loadMobiusRings(citySize);
    }

    onMouseClick(event) {
        if (event.button === 0) { // Left click
            this.plasmaBlastController.createPlasmaBlast();
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
            const mobiusRing = this.isMobiusRing(collision)
            if (mobiusRing) {
                if (this.mobiusRingController.removeRing(mobiusRing)) {
                    this.score += 1;
                }
            }
        }
    }
}
