import * as THREE from 'three';
import { MyCollidableObject } from './MyCollidableObject.js';

/**
 *  This class contains the contents of our application
 */
class MyPowerUp extends MyCollidableObject {
    constructor(app,mesh = null) {
        super();
        this.app = app;
        this.radius = 10;
        this.type = 'life';

        if(mesh == null){
            this.init();
        }else{
            this.mesh = mesh;
            this.add(mesh);
        }

        this.pickedUp = false;
        super.init();
    }

    init() {
        // Shader uniforms
        const uniforms = {
            time: { value: 0 }, // Time uniform to animate pulsation
            baseRadius: { value: this.radius }, // Base radius for the object
        };

        // Inner sphere: glowing core
        const innerGeometry = new THREE.SphereGeometry(0.8 * this.radius, 32, 32);
        const innerMaterial = new THREE.MeshStandardMaterial({
            color: 0xffaa00, // Glowing core color
            emissive: 0xffaa00, // Emissive glow
            emissiveIntensity: 1.2,
            roughness: 0.2,
            metalness: 0.7,
        });
        const innerSphere = new THREE.Mesh(innerGeometry, innerMaterial);
        this.add(innerSphere);

        // Outer sphere: transparent shell
        const outerGeometry = new THREE.SphereGeometry(this.radius, 32, 32);
        const outerMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            transparent: true,
            vertexShader: `
                uniform float time;
                uniform float baseRadius;

                void main() {
                    float scale = 1.0 + 0.1 * sin(time * 2.0 * 3.14159);
                    vec3 scaledPosition = position * scale;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(scaledPosition, 1.0);
                }
            `,
            fragmentShader: `
                void main() {
                    gl_FragColor = vec4(0.0, 0.47, 1.0, 0.3); // Blue transparent shell
                }
            `,
        });
        const outerSphere = new THREE.Mesh(outerGeometry, outerMaterial);
        this.add(outerSphere);

        // Store uniforms for animation
        this.uniforms = uniforms;
    }

    update(deltaTime) {
        // Update the time uniform for pulsation
        this.uniforms.time.value += deltaTime;
    }
}

export { MyPowerUp };
