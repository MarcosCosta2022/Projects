import * as THREE from 'three';
import { MyFirework } from './MyFirework.js'; // Import the firework class

class MyFireworkFactory {
    constructor(app, scene, location) {
        this.app = app;
        this.scene = scene;
        this.location = location
        this.fireworks = []; // List of active fireworks
    }

    /**
     * Update the state of all fireworks.
     */
    update() {
        // Add new fireworks with a 5% probability
        if (Math.random() < 0.05) {
            this.fireworks.push(new MyFirework(this.app, this.scene,this.location)); // Create a new firework
            console.log('Firework added');
        }

        // Update each firework
        for (let i = this.fireworks.length - 1; i >= 0; i--) { // Iterate backwards to handle removals
            const firework = this.fireworks[i];

            if (firework.done) {
                // If the firework is done, remove it
                this.fireworks.splice(i, 1);
                console.log('Firework removed');
                continue;
            }

            // Update the firework
            firework.update();
        }
    }
}

export { MyFireworkFactory };
