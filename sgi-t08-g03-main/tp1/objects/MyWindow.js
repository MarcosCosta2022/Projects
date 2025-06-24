import * as THREE from 'three';
import { MyApp } from '../MyApp.js';
import { MyCup } from './MyCup.js';

/**
 * This class represents a window with a frame and additional elements.
 */
class MyWindow extends THREE.Object3D {

    /**
     * 
     * @param {MyApp} app - The application object
     * @param {THREE.Material} frameMaterial - Material for the window frame
     * @param {THREE.Material} cupMaterial - Material for the cup exterior and base
     * @param {THREE.Material} cupInsideMaterial - Material for the cup interior
     */
    constructor(app, frameMaterial, cupMaterial, cupInsideMaterial) {
        super();
        this.app = app;
        this.frameMaterial = frameMaterial;
        this.cupMaterial = cupMaterial;
        this.cupInsideMaterial = cupInsideMaterial;

        this.parapeitoBaseHeight =0;

        // Call the method to create the window and its frame
        this.createWindow();
    }

    /**
     * Create the window and its frame.
     */
    createWindow() {
      
        const frameTopGeometry = new THREE.BoxGeometry(11.5, 0.5, 0.2);
        const frameSideGeometry = new THREE.BoxGeometry(0.5, 8.5, 0.2);
        const coverGeometry = new THREE.BoxGeometry(6, 8, 0.2);
        const parapeitoGeometry = new THREE.BoxGeometry(12, 0.5, 2);

       
        const frameTopMesh = new THREE.Mesh(frameTopGeometry, this.frameMaterial);
        const frameBottomMesh = new THREE.Mesh(frameTopGeometry, this.frameMaterial);
        const frameLeftMesh = new THREE.Mesh(frameSideGeometry, this.frameMaterial);
        const frameRightMesh = new THREE.Mesh(frameSideGeometry, this.frameMaterial);
        const coverLeftMesh = new THREE.Mesh(coverGeometry, this.frameMaterial);
        const coverRightMesh = new THREE.Mesh(coverGeometry, this.frameMaterial);
        const parapeitoMesh = new THREE.Mesh(parapeitoGeometry, this.frameMaterial);

       
        frameTopMesh.position.set(0, 4, -0.15);
        frameBottomMesh.position.set(0, -4, -0.15);
        frameLeftMesh.position.set(-6, 0, -0.15);
        frameRightMesh.position.set(6, 0, -0.15);
        coverLeftMesh.rotateY(Math.PI / 5);
        coverLeftMesh.position.set(8.5, 0, -2);
        coverRightMesh.position.set(-3, 0, -0.2);
        parapeitoMesh.position.set(0, -4.5, -0.2);

        this.parapeitoBaseHeight = -4.5+0.5/2;

       
        this.add(frameTopMesh);
        this.add(frameBottomMesh);
        this.add(frameLeftMesh);
        this.add(frameRightMesh);
        this.add(coverLeftMesh);
        this.add(coverRightMesh);
        this.add(parapeitoMesh);

        coverLeftMesh.castShadow = true;
        coverLeftMesh.receiveShadow = true;


        // Create the cup
        this.MyCup1 = new MyCup(this.app, this.cupMaterial, this.cupInsideMaterial);
        this.MyCup2 = new MyCup(this.app, this.cupMaterial, this.cupInsideMaterial);

        10, 14.9
        this.MyCup1.position.set(0,this.parapeitoBaseHeight+0.01,14-14.9);
        this.MyCup2.position.set(0.8,this.parapeitoBaseHeight+0.01,14.2-14.9);

        this.add(this.MyCup1);
        this.add(this.MyCup2);


    }
}

MyWindow.prototype.isGroup = true;

export { MyWindow };
