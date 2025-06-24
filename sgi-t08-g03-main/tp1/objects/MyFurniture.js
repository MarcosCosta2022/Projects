import * as THREE from 'three';
import { MyApp } from '../MyApp.js';

/**
 * This class represents a drawer
 */
class MyFurniture extends THREE.Object3D {

    /**
     * 
     * @param {MyApp} app - The application object
     * @param {{THREE.Material}} materialFront - Material for the front of the drawer
     * @param {{THREE.Material}} materialRest - Material for the rest of the drawer
     */
    constructor(app, materialFront, materialRest) {
        super();
        this.app = app;
        this.materialFront = materialFront;
        this.materialRest = materialRest;

       
        this.createFurniture();

        this.traverse(function(child){
            child.receiveShadow = true;
            child.castShadow = true;
        })
    }

    /**
     * Create the furniture mesh and apply rotation.
     */
    createFurniture() {
        const furnitureGeometry = new THREE.BoxGeometry(3, 5, 20);

        const materials = [
            this.materialRest,  
            this.materialFront,  //frente
            this.materialRest,  
            this.materialRest,  
            this.materialRest, 
            this.materialRest  
        ];
    
        
        const furnitureMesh = new THREE.Mesh(furnitureGeometry, materials);
        
        

        // Rotate the furniture by 90 degrees along the Y-axis
        furnitureMesh.rotation.y = Math.PI / 2;

        // Add the furniture mesh to this object
        this.add(furnitureMesh);
    }
}

MyFurniture.prototype.isGroup = true;

export { MyFurniture };
