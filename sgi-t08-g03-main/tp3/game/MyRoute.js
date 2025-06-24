
import * as THREE from 'three';
class MyRoute {
    constructor(app, keyFrames, duration = 0) {
        this.app = app;
        this.keyFrames = keyFrames;
        this.duration = duration;
    }

    // Method to get modified keyframes with an offset
    getOffsetKeyFrames(startingPoint) {
        if (!this.keyFrames || this.keyFrames.length === 0) return null;

        // Calculate offset from first keyframe to starting point
        const firstKeyFramePosition = new THREE.Vector3().fromArray(this.keyFrames[0].position);
        
        const offset = new THREE.Vector3().subVectors(startingPoint, firstKeyFramePosition);

        // Create modified values with offset
        const positions = [];
        const rotations = [];
        const times = [];

        for (let i = 0; i < this.keyFrames.length; i++) {
            const kf = this.keyFrames[i];
            const basePosition = new THREE.Vector3().fromArray(kf.position);
        
            const finalPosition = basePosition.clone().add(offset);
            
            positions.push(finalPosition.x, finalPosition.y, finalPosition.z);
            rotations.push(kf.rotationY * Math.PI / 180); // Convert to radians
            times.push(kf.time);
        }

        return { positions, rotations, times };
    }
}

export {MyRoute};