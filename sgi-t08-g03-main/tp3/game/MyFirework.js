import * as THREE from 'three';

class MyFirework {
    constructor(app, scene, location, scale = 30) {
        this.app = app;
        this.scene = scene;

        this.location = location; // Starting location of the firework
        this.scale = scale; // Scale of the firework
        this.gravity = -9.8;
        this.done = false;
        this.dest = [];
        this.geometry = null;
        this.points = null;
        this.velocities = []; // Store particle velocities
        this.timeStep = 0.016; // Approximate time step per frame (60 FPS)
        this.material = new THREE.PointsMaterial({
            size: 0.2 * this.scale, // Scale the particle size
            vertexColors: true,
            transparent: true,
            depthTest: false,
        });

        this.height = 10 * this.scale; // Launch height scales with the firework
        this.speed = 50; // Launch speed remains unchanged
        this.particleCount = 300; // Number of explosion particles

        this.launch();
    }

    /**
     * Launch the firework.
     */
    launch() {
        let baseColor = new THREE.Color();
        baseColor.setHSL(THREE.MathUtils.randFloat(0, 1), 1, 0.7);

        console.log(this.location);
        // Destination is a random point in the sky near the specified location
        let x = this.location.x + THREE.MathUtils.randFloat(-5, 5) * this.scale;
        let y = this.location.y + THREE.MathUtils.randFloat(this.height * 0.9, this.height * 1.1);
        let z = this.location.z + THREE.MathUtils.randFloat(-5, 5) * this.scale;
        this.dest = [x, y, z];

        // Set initial position at the given location
        const vertices = [this.location.x, this.location.y, this.location.z];
        const colors = [baseColor.r, baseColor.g, baseColor.b];

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);

        console.log("Firework launched from", this.location, "to", this.dest);
    }

    /**
     * Trigger explosion of the firework.
     * @param {Array} origin - The position of the explosion (x, y, z).
     */
    explode(origin) {
        console.log("Firework exploded at", origin);

        this.scene.remove(this.points);
        this.geometry.dispose();

        const vertices = [];
        const colors = [];
        const baseColor = new THREE.Color();
        baseColor.setHSL(THREE.MathUtils.randFloat(0, 1), 1, 0.7);

        this.velocities = [];

        for (let i = 0; i < this.particleCount; i++) {
            const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
            const phi = THREE.MathUtils.randFloat(0, Math.PI);
            const radius = THREE.MathUtils.randFloat(5, 10) * this.scale; // Scale explosion radius

            const x = origin[0];
            const y = origin[1];
            const z = origin[2];
            vertices.push(x, y, z);

            // Random initial velocity components
            const speed = THREE.MathUtils.randFloat(5, 15) * this.scale; // Scale explosion speed
            const vx = speed * Math.sin(phi) * Math.cos(theta);
            const vy = speed * Math.sin(phi) * Math.sin(theta);
            const vz = speed * Math.cos(phi);
            this.velocities.push({ x: vx, y: vy, z: vz });

            const particleColor = baseColor.clone();
            particleColor.offsetHSL(THREE.MathUtils.randFloat(-0.1, 0.1), 0, 0);
            colors.push(particleColor.r, particleColor.g, particleColor.b);
        }

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
    }

    /**
     * Reset the firework.
     */
    reset() {
        console.log("Firework reset");
        this.scene.remove(this.points);
        if (this.geometry) this.geometry.dispose();
        this.done = true;
    }

    /**
     * Update the firework's state on each frame.
     */
    update() {
        if (this.points && this.geometry) {
            const verticesAttribute = this.geometry.getAttribute('position');
            const vertices = verticesAttribute.array;

            if (vertices.length === 3) {
                vertices[0] += (this.dest[0] - vertices[0]) / this.speed;
                vertices[1] += (this.dest[1] - vertices[1]) / this.speed;
                vertices[2] += (this.dest[2] - vertices[2]) / this.speed;
                verticesAttribute.needsUpdate = true;

                if (Math.abs(vertices[1] - this.dest[1]) < 0.5 * this.scale) {
                    this.explode([vertices[0], vertices[1], vertices[2]]);
                }
            } else {
                for (let i = 0; i < this.particleCount; i++) {
                    const index = i * 3;

                    // Update position based on velocity
                    vertices[index] += this.velocities[i].x * this.timeStep;
                    vertices[index + 1] += this.velocities[i].y * this.timeStep;
                    vertices[index + 2] += this.velocities[i].z * this.timeStep;

                    this.velocities[i].y += this.gravity * this.timeStep;
                }

                verticesAttribute.needsUpdate = true;

                // Fade out particles
                this.material.opacity -= 0.01;
                this.material.needsUpdate = true;

                if (this.material.opacity <= 0) {
                    this.reset();
                }
            }
        }
    }
}

export { MyFirework };
