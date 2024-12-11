import * as THREE from 'three';

export class PhysicsController {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.moveSpeed = 5.0;
        this.verticalOffset = 1.8;
        this.gravity = -9.8;
        this.velocity = new THREE.Vector3();
        
        this.groundRaycaster = new THREE.Raycaster();
        this.groundRaycaster.ray.direction.set(0, -1, 0);
        
        this.collisionRaycasters = [];
        const rayDirections = [
            new THREE.Vector3(1, 0, 0),  // Positive x-axis (right)
            new THREE.Vector3(-1, 0, 0), // Negative x-axis (left)
            new THREE.Vector3(0, 0, 1),  // Positive z-axis (forward)
            new THREE.Vector3(0, 0, -1), // Negative z-axis (backward) 
        ];
        
        rayDirections.forEach(direction => {
            const raycaster = new THREE.Raycaster();
            raycaster.ray.direction.copy(direction);
            this.collisionRaycasters.push(raycaster);
        });
        
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        // Plasma blast properties
        this.plasmaBlasts = [];
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
        this.plasmaBlasts.push(plasma);
    }

    onMouseClick(event) {
        if (event.button === 0) { // Left click
            this.createPlasmaBlast();
        }
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveForward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.moveBackward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.moveLeft = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveRight = true;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveForward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.moveBackward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.moveLeft = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveRight = false;
                break;
        }
    }

    update(deltaTime) {
        if (!this.camera || !this.scene) return;

        this.groundRaycaster.ray.origin.copy(this.camera.position);
        
        const collidableMeshes = [];
        this.scene.traverse(object => {
            if (object.isMesh && object !== this.camera) {
                collidableMeshes.push(object);
            }
        });
        
        const groundIntersects = this.groundRaycaster.intersectObjects(collidableMeshes);
        if (groundIntersects.length > 0) {
            const groundPoint = groundIntersects[0].point;
            const targetY = groundPoint.y + this.verticalOffset;
            this.camera.position.y += (targetY - this.camera.position.y) * 0.1;
        }
        
        const moveDirection = new THREE.Vector3();
        
        if (this.moveForward) moveDirection.z -= 1;
        if (this.moveBackward) moveDirection.z += 1;
        if (this.moveLeft) moveDirection.x -= 1;
        if (this.moveRight) moveDirection.x += 1;
        
        moveDirection.normalize();
        moveDirection.applyQuaternion(this.camera.quaternion);
        
        let canMove = true;
        const collisionDistance = 0.5;
        
        this.collisionRaycasters.forEach(raycaster => {
            raycaster.ray.origin.copy(this.camera.position);
            const intersects = raycaster.intersectObjects(collidableMeshes);
            
            if (intersects.length > 0 && intersects[0].distance < collisionDistance) {
                if (moveDirection.dot(raycaster.ray.direction) > 0) {
                    canMove = false;
                }
            }
        });
        
        if (canMove) {
            moveDirection.multiplyScalar(this.moveSpeed * deltaTime);
            this.camera.position.add(moveDirection);
        }

        // Update plasma blasts
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

            // Optional: Check for collisions with objects
            const plasmaRaycaster = new THREE.Raycaster(
                plasma.position,
                plasma.velocity.clone().normalize(),
                0,
                0.5
            );
            const intersects = plasmaRaycaster.intersectObjects(collidableMeshes);
            if (intersects.length > 0) {
                this.scene.remove(plasma);
                this.plasmaBlasts.splice(i, 1);
            }
        }
    }
}
