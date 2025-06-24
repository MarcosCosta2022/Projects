import * as THREE from 'three';

class MyTrackProgressionSystem {
    constructor(match) {
        this.match = match;
        this.checkpoints = [];
        this.currentCheckpoint = 0;
        this.lastValidCheckpoint = 0;
        this.isRaceComplete = false;

        this.wrongDirectionTimer = 0;
        this.wrongDirectionThreshold = 5;
        
        this.lastPosition = null;
        this.movementThreshold = 0.1;
        this.isCurrentlyWrong = false;  
        this.correctMovementNeeded = 5; 
        this.correctMovementAccumulator = 0; 
    }

    /**
     * Creates checkpoints evenly distributed along the track
     * @param {MyTrack} track - The track to extract checkpoints from
     * @param {number} numCheckpoints - Number of desired checkpoints
     */
    addCheckpointsFromTrack(track, numCheckpoints) {
        // Clear existing checkpoints
        this.checkpoints = [];
        
        const segments = track.meshSegments;
        const totalSegments = segments.length - 1; // -1 because last point connects to first
        
        // Calculate the segment interval to place checkpoints
        const segmentInterval = Math.floor(totalSegments / numCheckpoints);
        
        for (let i = 0; i < numCheckpoints; i++) {
            const segmentIndex = i * segmentInterval;
            
            // Get current and next segment points
            const point1 = segments[segmentIndex];
            const point2 = segments[segmentIndex + 1];
            
            // Calculate checkpoint position at segment
            const checkpointPos = new THREE.Vector3(
                (point1.x + point2.x) / 2,
                0,
                (point1.z + point2.z) / 2
            );

            // Calculate forward direction for this segment
            const forward = new THREE.Vector3(
                point2.x - point1.x,
                0,
                point2.z - point1.z
            ).normalize();

            // Create checkpoint object
            const checkpoint = {
                position: checkpointPos,
                forward: forward,
                radius: track.getWidth() / 2, // Use half the track width as checkpoint radius
                index: i
            };

            this.checkpoints.push(checkpoint);

            // Debug visualization of checkpoints (optional)
            if (this.match.app.debug) {
                this.createDebugCheckpoint(checkpoint);
            }
        }
    }

    /**
     * Creates a visual representation of a checkpoint for debugging
     * @param {Object} checkpoint 
     */
    createDebugCheckpoint(checkpoint) {
        // Create a circle geometry for the checkpoint
        const geometry = new THREE.RingGeometry(
            checkpoint.radius * 0.8, 
            checkpoint.radius, 
            32
        );
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00,
            side: THREE.DoubleSide 
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        // Position and rotate the checkpoint
        mesh.position.copy(checkpoint.position);
        mesh.rotation.x = -Math.PI / 2; // Lay flat
        mesh.position.y = 0.2; // Slightly above ground
        
        this.match.game.scene.add(mesh);
    }

    /**
     * Check if player is going in wrong direction
     * @param {THREE.Vector3} playerPosition 
     * @param {number} delta - Time since last frame
     * @returns {boolean}
     */
    isWrongDirection(playerPosition, delta) {
        if (this.checkpoints.length < 2) return false;

        // Initialize lastPosition if not set
        if (!this.lastPosition) {
            this.lastPosition = playerPosition.clone();
            return this.isCurrentlyWrong;
        }

        // Calculate movement vector
        const movement = new THREE.Vector3().subVectors(playerPosition, this.lastPosition);
        const movementSpeed = movement.length() / delta;

        // Only check direction if player is actually moving
        if (movementSpeed > this.movementThreshold) {
            const currentCP = this.checkpoints[this.currentCheckpoint];
            const nextCP = this.checkpoints[
                (this.currentCheckpoint + 1) % this.checkpoints.length
            ];

            // Vector from player to next checkpoint
            const toNextCheckpoint = new THREE.Vector3().subVectors(
                nextCP.position,
                playerPosition
            ).normalize();

            // Calculate dot product between movement direction and direction to next checkpoint
            const movementDirection = movement.normalize();
            const dotProduct = movementDirection.dot(toNextCheckpoint);

            if (!this.isCurrentlyWrong) {
                // Check if we should start warning
                if (dotProduct < -0.5) { // Moving significantly away
                    this.wrongDirectionTimer += delta;
                    if (this.wrongDirectionTimer >= this.wrongDirectionThreshold) {
                        this.isCurrentlyWrong = true;
                        this.correctMovementAccumulator = 0;
                    }
                } else {
                    this.wrongDirectionTimer = 0;
                }
            } else {
                // Already in wrong direction state, check for correction
                if (dotProduct > 0.3) { // Moving somewhat towards next checkpoint
                    this.correctMovementAccumulator += movement.length();
                    if (this.correctMovementAccumulator >= this.correctMovementNeeded) {
                        // Enough correct movement to clear the warning
                        this.isCurrentlyWrong = false;
                        this.wrongDirectionTimer = 0;
                        this.correctMovementAccumulator = 0;
                    }
                } else {
                    // Reset correction progress if moving wrong again
                    this.correctMovementAccumulator = 0;
                }
            }
        }

        this.lastPosition.copy(playerPosition);
        return this.isCurrentlyWrong;
    }

    /**
     * Update progression based on player position
     * @param {THREE.Vector3} playerPosition 
     * @param {number} delta - Time since last frame
     * @returns {Object} Status update
     */
    update(playerPosition, delta) {
        if (this.isRaceComplete) {
            return { 
                isComplete: true,
                isWrongWay: false,
                progress: 100,
                checkpoint: this.currentCheckpoint
            };
        }

        const wrongWay = this.isWrongDirection(playerPosition, delta);
        
        // Check if player has reached current checkpoint
        const currentCP = this.checkpoints[this.currentCheckpoint];
        const distToCheckpoint = playerPosition.distanceTo(currentCP.position);
        
        if (distToCheckpoint <= currentCP.radius) {
            this.lastValidCheckpoint = this.currentCheckpoint;
            this.currentCheckpoint = (this.currentCheckpoint + 1) % this.checkpoints.length;
            
            // Check if race is complete
            if (this.currentCheckpoint === 0 && 
                this.lastValidCheckpoint === this.checkpoints.length - 1) {
                this.isRaceComplete = true;
            }
        }

        // Calculate progress (0-100)
        const progress = (this.lastValidCheckpoint / this.checkpoints.length) * 100;

        return {
            isComplete: this.isRaceComplete,
            isWrongWay: wrongWay,
            progress: progress,
            checkpoint: this.currentCheckpoint
        };
    }

    /**
     * Reset the progression system
     */
    reset() {
        this.currentCheckpoint = 0;
        this.lastValidCheckpoint = 0;
        this.isRaceComplete = false;
        this.wrongDirectionTimer = 0;
        this.lastPosition = null;
        this.isCurrentlyWrong = false;
        this.correctMovementAccumulator = 0;
    }
}

export { MyTrackProgressionSystem };