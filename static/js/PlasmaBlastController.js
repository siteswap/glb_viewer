import * as THREE from 'three';

export class PlasmaBlastController {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.plasmaSpeed = 30.0;
        this.plasmaLifetime = 2.0; // seconds
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
        return plasma;
    }
}
