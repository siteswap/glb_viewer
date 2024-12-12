import * as THREE from 'three';

export class PlasmaBlastController {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.plasmaSpeed = 30.0;
        this.plasmaLifetime = 2.0; // seconds
        this.plasmaBlasts = [];
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
        return plasma;
    }

    updatePlasmaBlasts(deltaTime, collidableMeshes) {
        const collisions = [];

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
}
