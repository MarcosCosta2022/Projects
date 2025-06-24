import * as THREE from 'three';

/**
 * This class represents a flame, which can be attached to a candle.
 */
class MyFlame extends THREE.Object3D {

    /**
     * 
     * @param {MyApp} app - The application object
     * @param {THREE.Material} flameMaterial - Material for the flame
     * @param {number} height - Height at which the flame should be placed
     * @param {number} x - X position offset for the flame
     * @param {number} z - Z position offset for the flame
     */
    constructor(app, flameMaterial, height = 1, x = 0, z = 0) {
        super();
        this.app = app;
        this.flameMaterial = flameMaterial;
        this.height = height;
        this.x = x;
        this.z = z;

      
        this.createFlame();
    }

    /**
     * Create the flame geometry consisting of two cones and a cylinder.
     */
    createFlame() {
        let scale = 0.9;
        let flameRadius = 0.1 * scale;
        let bottomConeHeight = 0.1 * scale;
        let cylinderHeight = 0.05 * scale;
        let topConeHeight = 0.3 * scale;

        // Bottom cone (flipped)
        const bottomConeGeometry = new THREE.ConeGeometry(flameRadius, bottomConeHeight, 64);
        this.bottomConeMesh = new THREE.Mesh(bottomConeGeometry, this.flameMaterial);
        this.bottomConeMesh.position.set(this.x, this.height + bottomConeHeight / 2, this.z);
        this.bottomConeMesh.rotation.x = Math.PI;
        this.add(this.bottomConeMesh);

        // Middle cylinder
        const cylinderGeometry = new THREE.CylinderGeometry(flameRadius, flameRadius, cylinderHeight, 64, 64);
        this.cylinderMesh = new THREE.Mesh(cylinderGeometry, this.flameMaterial);
        this.cylinderMesh.position.set(this.x, this.height + bottomConeHeight + cylinderHeight / 2, this.z);
        this.add(this.cylinderMesh);

        // Top cone
        const topConeGeometry = new THREE.ConeGeometry(flameRadius, topConeHeight, 64);
        this.topConeMesh = new THREE.Mesh(topConeGeometry, this.flameMaterial);
        this.topConeMesh.position.set(this.x, this.height + bottomConeHeight + cylinderHeight + topConeHeight / 2, this.z);
        this.add(this.topConeMesh);
    }
}

MyFlame.prototype.isGroup = true;

export { MyFlame };
