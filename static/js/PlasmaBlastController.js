import * as THREE from 'three';

export class PlasmaBlastController {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.plasmaSpeed = 30.0;
        this.plasmaLifetime = 2.0; // seconds
        this.plasmaBlasts = [];
        this.blastColor = 0x00ff00;

        // Shooting rate limit (2 shots per second = 200ms between shots)
        this.lastShotTime = 0;
        this.shootingCooldown = 2000; // milliseconds
        
        // Continuous fire mode
        this.continuousFireEnabled = false;
        this.blastRadius = 0.2;
        this.collisionDistance = 1.0; // Destroy anything with collisionDistance of center
    }

    onShootButtonHeld() {
        // Only process continuous shooting if continuous fire is disabled
        // When continuous fire is enabled, shooting is handled in update()
        if (!this.continuousFireEnabled) {
            this.tryShoot();
        }
    }

    tryShoot() {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime >= this.shootingCooldown) {
            this.createPlasmaBlast();
            this.lastShotTime = currentTime;
        }
    }

    createPlasmaBlast() {
        const geometry = new THREE.SphereGeometry(this.blastRadius, 16, 16);
        const material = new THREE.MeshPhongMaterial({
            color: this.blastColor,
            emissive: this.blastColor,
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
        const mobiusRings = collidableMeshes.filter(mesh => mesh.parent && mesh.parent.rotationSpeed); // Filter for Mobius rings

        // Handle continuous fire mode
        if (this.continuousFireEnabled) {
            this.tryShoot();
        }

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

            // Check for collisions with Mobius rings based on distance to center
            for (const ring of mobiusRings) {  // TODO - is this expensive?
                const ringCenter = ring.parent.position;
                const distance = plasma.position.distanceTo(ringCenter);
                
                if (distance <= this.collisionDistance) {
                    // Add collision information
                    collisions.push(ring.parent);

                    // Remove the plasma blast
                    this.scene.remove(plasma);
                    this.plasmaBlasts.splice(i, 1);
                }
            }
        }

        return collisions;
    }

    toggleContinuousFire() {
        this.continuousFireEnabled = !this.continuousFireEnabled;
    }
}
