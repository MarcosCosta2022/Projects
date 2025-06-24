

import * as THREE from 'three';

class MyEnemy {
    constructor(match, balloon, route) {
        this.match = match;
        this.balloon = balloon; // balloon mesh
        this.route = route; // route containing keyFrames info
        
        this.mixer = null; // Animation mixer for controlling the balloon's movement
        this.mixerPause = true;
        this.animationClip = null;
        this.animationAction = null;

        this.laps = 0;

        this.init(); // Initialize the animation setup
    }

    init() {
       // Set up animation with a default starting position
        this.setupAnimation(new THREE.Vector3());
    }

    // Sets up the animation for the balloon based on keyframes from the route.
    setupAnimation(startingPoint = null) {
        if (!this.balloon || !this.route) return;

        // Reset and clear any existing animation mixer
        if (this.mixer) {
            this.mixer.stopAllAction();
            this.mixer.uncacheRoot(this.balloon);
            this.mixer = null;
        }

        // Use the provided starting point or the balloon's current position
        if(startingPoint === null){
            startingPoint = this.balloon.position.clone();
        }

        console.log(this.route)
        const keyFrames = this.route.getOffsetKeyFrames(startingPoint);
        console.log("Keyframes");
        console.log(keyFrames);
        if (!keyFrames) return;

        // Create position and rotation keyframe tracks for animation

        const positionKF = new THREE.VectorKeyframeTrack(
            '.position',
            keyFrames.times,
            keyFrames.positions,
            THREE.InterpolateSmooth
        );

        const rotationKF = new THREE.NumberKeyframeTrack(
            '.rotation[y]',
            keyFrames.times,
            keyFrames.rotations,
            THREE.InterpolateLinear
        );

         // Calculate animation duration from the keyframes
        const duration =Math.max(...keyFrames.times);

        // Create the animation clip and attach it to the mixer
        this.animationClip = new THREE.AnimationClip(
            'animation',
            duration,
            [positionKF, rotationKF]
        );

          // Event listener to increment laps when the animation loops
        this.mixer = new THREE.AnimationMixer(this.balloon);
        this.mixer.addEventListener('loop', () => {
            this.incrementLaps();
        });

         // Configure and start the animation action
        this.animationAction = this.mixer.clipAction(this.animationClip);
        this.animationAction.setLoop(THREE.LoopRepeat);
        this.animationAction.enabled = true;
        this.animationAction.play();
        this.mixer.timeScale = 0;

        this.balloon.position.copy(startingPoint);
    }

    start() {
        this.mixerPause = false;
    }

    pause() {
        this.mixerPause = true;
    }

    incrementLaps(){
        this.laps += 1;
        if(this.laps >= this.match.objectiveLaps){
            this.match.gameOver("Autonomous");
        }
    }
    //* Updates the animation frame based on the time delta.
    update(delta) {
        if (!this.mixer) return;

        // Update mixer timeScale based on pause state
        this.mixer.timeScale = this.mixerPause ? 0 : 1;

        if (!this.mixerPause && delta > 0) {
            this.mixer.update(delta);
            this.balloon.updateVolumes();
        }
    }
    // Cleans up and destroys the enemy object and its animation resources.
    destroy() {
        if (this.mixer) {
            this.mixer.removeEventListener('loop');
            this.mixer.stopAllAction();
            this.mixer.uncacheRoot(this.balloon);
        }
        this.mixer = null;
        this.animationClip = null;
        this.animationAction = null;
    }
}

export { MyEnemy };