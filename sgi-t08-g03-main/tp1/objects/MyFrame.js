import * as THREE from 'three';
import { MyApp } from '../MyApp.js';

/**
 * This class contains a 3D axis representation
 */
class MyFrame extends THREE.Object3D {

    /**
     * 
     * @param {MyApp} app - The application object
     * @param {number} width - The width of the frame
     * @param {number} height - The height of the frame
     * @param {number} thickness - The thickness of the frame
     * @param {THREE.Material} material - The material of the frame
     */
    constructor(app, width, height, thickness, material) {
        super();
        this.app = app;
        this.type = 'Group';
        
        this.width = width;
        this.height = height;
        this.thickness = thickness;
        this.material = material;

        this.create();
    }

    /**
     * Create the frame
     */
    create() {
        const width = this.width;
        const height = this.height;
        const thickness = this.thickness;
        // create 4 boxes to form the frame
        // top
        let top = new THREE.BoxGeometry(width, thickness, thickness);
        let topMesh = new THREE.Mesh(top, this.material);
        topMesh.position.set(0, height/2 + thickness/2, 0);

        // bottom
        let bottom = new THREE.BoxGeometry(width, thickness, thickness);
        let bottomMesh = new THREE.Mesh(bottom, this.material);
        bottomMesh.position.set(0, -height/2- thickness/2, 0);

        // left
        let left = new THREE.BoxGeometry(thickness, height + thickness*2, thickness);
        let leftMesh = new THREE.Mesh(left, this.material);
        leftMesh.position.set(-width/2 - thickness/2, 0, 0);

        // right
        let right = new THREE.BoxGeometry(thickness, height  + thickness*2, thickness);
        let rightMesh = new THREE.Mesh(right, this.material);
        rightMesh.position.set(width/2 + thickness/2, 0, 0);
        
        // combine the meshes
        this.add(topMesh);
        this.add(bottomMesh);
        this.add(leftMesh);
        this.add(rightMesh);
    }
}

MyFrame.prototype.isGroup = true;

export { MyFrame };