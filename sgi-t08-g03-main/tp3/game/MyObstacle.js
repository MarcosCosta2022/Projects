import * as THREE from 'three';
import { MyCollidableObject } from './MyCollidableObject.js';

/**
 *  This class contains the contents of our application
 */
class MyObstacle extends MyCollidableObject {
    constructor(app, group = null) {
        super();
        this.app = app;
        this.height = 5;
        this.radius = 1;
        this.pulsatingMeshes = [];
        
        if(group === null) {
            this.material = new THREE.MeshPhongMaterial({
                color: 0xff0000
            });
            this.createDefaultObject();
        } else {
            this.createPulsatingGroup(group);
        }

        

        super.init();
    }

    createDefaultObject() {
        // Shader uniforms
        const uniforms = {
            time: { value: 0 },
            baseRadius: { value: this.radius },
        };

        const cylinderGeometry = new THREE.CylinderGeometry(
            this.radius, 
            this.radius, 
            this.height, 
            32
        );
        const cylinderMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: `
                uniform float time;
                uniform float baseRadius;

                void main() {
                    float scale = 1.0 + 0.06 * sin(time * 2.0 * 3.14159);
                    vec3 scaledPosition = position;
                    scaledPosition.x *= scale;
                    scaledPosition.z *= scale;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(scaledPosition, 1.0);
                }
            `,
            fragmentShader: `
                void main() {
                    gl_FragColor = vec4(0.8, 0.0, 0.0, 1.0);
                }
            `,
        });
        const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinder.position.set(0, this.height / 2, 0);
        this.add(cylinder);
        this.uniforms = [uniforms];
    }

    createPulsatingGroup(originalGroup) {
        // Create a new group to hold the pulsating meshes
        const pulsatingGroup = new THREE.Group();
        this.uniforms = [];

        // Recursive function to process all meshes in the group
        const processObject = (object, parent) => {
            if (object instanceof THREE.Mesh) {
                // Create uniforms for this specific mesh
                const uniforms = {
                    time: { value: 0 },
                    baseScale: { value: 1.0 },
                };
                this.uniforms.push(uniforms);

                // Create pulsating material
                const pulsatingMaterial = new THREE.ShaderMaterial({
                    uniforms: uniforms,
                    vertexShader: `
                        uniform float time;
                        uniform float baseScale;

                        void main() {
                            float scale = baseScale + 0.06 * sin(time * 2.0 * 3.14159);
                            vec3 scaledPosition = position * scale;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(scaledPosition, 1.0);
                        }
                    `,
                    fragmentShader: `
                        void main() {
                            gl_FragColor = vec4(0.8, 0.0, 0.0, 1.0);
                        }
                    `,
                });

                // Create new mesh with pulsating material
                const pulsatingMesh = new THREE.Mesh(
                    object.geometry.clone(),
                    pulsatingMaterial
                );

                // Copy transforms
                pulsatingMesh.position.copy(object.position);
                pulsatingMesh.rotation.copy(object.rotation);
                pulsatingMesh.scale.copy(object.scale);
                pulsatingMesh.matrixAutoUpdate = object.matrixAutoUpdate;
                pulsatingMesh.matrix.copy(object.matrix);

                // Add to parent
                parent.add(pulsatingMesh);
            } else if (object instanceof THREE.Group) {
                // Create a new group with the same transforms
                const newGroup = new THREE.Group();
                newGroup.position.copy(object.position);
                newGroup.rotation.copy(object.rotation);
                newGroup.scale.copy(object.scale);
                newGroup.matrixAutoUpdate = object.matrixAutoUpdate;
                newGroup.matrix.copy(object.matrix);
                
                // Process all children
                object.children.forEach(child => {
                    processObject(child, newGroup);
                });

                parent.add(newGroup);
            }
        };

        // Process the entire group structure
        processObject(originalGroup, pulsatingGroup);

        // Add the processed group to this object
        this.add(pulsatingGroup);
    }

    update(deltaTime) {
        // Update all uniforms
        if (this.uniforms) {
            this.uniforms.forEach(uniform => {
                uniform.time.value += deltaTime;
            });
        }
    }
}

export { MyObstacle };