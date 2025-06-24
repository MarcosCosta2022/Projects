import * as THREE from 'three';
import { MyApp } from '../MyApp.js';

/**
 * This class represents a painting with a frame.
 */
class MyPainting extends THREE.Object3D {

    /**
     * 
     * @param {MyApp} app 
     * @param {string} textureUrl 
     *  @param {THREE.Material} frameMaterial 
     * 
     */
    constructor(app, textureUrl,frameMaterial) {
        super();
        this.app = app;
        this.textureUrl = textureUrl;
        this.frameMaterial = frameMaterial;
      

        
        this.createPainting();
    }

    /**
     * Create the painting and its frame.
     */
    createPainting() {
      
        const paintingGeometry = new THREE.PlaneGeometry(5, 5);
        const frameGeometry = new THREE.BoxGeometry(7, 6.5, 0.2);

        const textureLoader = new THREE.TextureLoader();
        const paintingTexture = textureLoader.load('textures/' + this.textureUrl);
        
        const paintingMaterial = new THREE.MeshPhongMaterial({ map: paintingTexture });

        const paintingMesh = new THREE.Mesh(paintingGeometry, paintingMaterial);
        const frameMesh = new THREE.Mesh(frameGeometry, this.frameMaterial);

        frameMesh.position.set(0, 0, 0- 0.15);
        
        this.add(paintingMesh);
        this.add(frameMesh);
    }
}

MyPainting.prototype.isGroup = true;

export { MyPainting };
