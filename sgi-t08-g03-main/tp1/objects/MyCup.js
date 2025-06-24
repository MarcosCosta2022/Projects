import * as THREE from 'three';
import { MyApp } from '../MyApp.js';

/**
 * This class represents a cup with an exterior, interior, and base.
 */
class MyCup extends THREE.Object3D {

    /**
     * 
     * @param {MyApp} app - The application object
     * @param {THREE.Material} cupMaterial - Material for the cup exterior and base
     */
    constructor(app, cupMaterial) {
        super();

        this.app = app;
        this.cupMaterial = cupMaterial;
        
        this.createCup();
    }

    /**
     * Create the cup and its parts.
     */
    createCup() {
        const scale = 0.5;
        const cupHeight = 1.5 * scale;
        const cupBottomRadius = 0.4 * scale;
        const cupTopRadius = 0.5 * scale;

        // Exterior of the cup
        const cupGeometry = new THREE.CylinderGeometry(cupTopRadius, cupBottomRadius, cupHeight, 64, 64, true);
        this.cupWallMesh = new THREE.Mesh(cupGeometry, this.cupMaterial);
        this.cupWallMesh.position.set(0, cupHeight / 2, 0);

        // Cup base
        const cupBaseGeometry = new THREE.CircleGeometry(cupBottomRadius, 64);
        this.cupBaseMesh = new THREE.Mesh(cupBaseGeometry, this.cupMaterial);
        this.cupBaseMesh.rotation.x = -Math.PI / 2;
        this.cupBaseMesh.position.set(0, 0.01, 0);

      
        this.add(this.cupWallMesh);
        this.add(this.cupBaseMesh);

        this.traverse( function( child ) {

            child.castShadow = true;
            child.receiveShadow = true;
        
        } );
    }
}

MyCup.prototype.isGroup = true;

export { MyCup };
