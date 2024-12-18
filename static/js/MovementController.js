import * as THREE from 'three';

export class MovementController {
    constructor(camera) {
        this.camera = camera;
        this.moveSpeed = 2.0; // meters per second
        this.speedMultiplier = 1.0;
        this.verticalOffset = 1.0;
        this.rotationAngle = Math.PI / 90; // Amount to rotate per frame when held
        
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

        // Touchscreen buttons
        this.turnLeft = false;
        this.turnRight = false;

        // Flying mode
        this.flyingMode = false;
        this.verticalSpeed = 0;
        this.watts = 0;
    }

    setTurnLeft(bool) {
        this.turnLeft = bool;
    }

    setTurnRight(bool) {
        this.turnRight = bool;
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
            case 'KeyJ':
                this.onCyclingPower(this.watts + 10);
                break;
            case 'KeyK':
                this.onCyclingPower(this.watts - 10);
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

    onCyclingPower(watts) {
        this.watts = watts;
        this.moveForward = watts > 5;
        this.moveSpeed = watts / 80;  // For realistic bike speeds, the divisor would be more like 20.
        this.verticalSpeed = (watts - 200) / 80;
    }

    updateRotation() {
        if (this.turnLeft) {
            this.camera.rotation.y += this.rotationAngle;
        }
        if (this.turnRight) {
            this.camera.rotation.y -= this.rotationAngle;
        }
    }

    update(deltaTime, collidableMeshes) {
        this.groundRaycaster.ray.origin.copy(this.camera.position);
        
        const groundIntersects = this.groundRaycaster.intersectObjects(collidableMeshes);
        if (groundIntersects.length > 0) {
            const groundPoint = groundIntersects[0].point;
            const targetY = groundPoint.y + this.verticalOffset;
            let defaultVerticalSpeed = targetY - this.camera.position.y;
            if (this.flyingMode) {
                defaultVerticalSpeed = Math.max(this.verticalSpeed, defaultVerticalSpeed);
            }
            this.camera.position.y += defaultVerticalSpeed * deltaTime;
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
            moveDirection.multiplyScalar(this.moveSpeed * this.speedMultiplier * deltaTime);
            this.camera.position.add(moveDirection);
        }

        // Update rotation
        this.updateRotation();
    }
}
