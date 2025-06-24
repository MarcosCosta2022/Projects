import * as THREE from 'three';
import { MyApp } from '../MyApp.js';

/**
 * This class contains a 3D axis representation
 */
class MyChair extends THREE.Object3D {

    /**
     * 
     * @param {MyApp} app the application object
     * @param {THREE.Material} chairMaterial the material of the chair
     * @param {THREE.Material} chairBackMaterial the material of the chair back
     * @param {THREE.Material} chairLegMaterial the material of the chair legs
     */
    constructor(app, chairMaterial, chairBackMaterial, chairLegMaterial) { 
        super();
        this.app = app;
        this.type = 'Group';

        this.chairMaterial = chairMaterial;
        this.chairBackMaterial = chairBackMaterial;
        this.chairLegMaterial = chairLegMaterial;

        this.create();
    }

    /**
     * Create the chair
     */
    create() {
      
        //create leg of chair
        const legRadius = 0.15;
        const legHeight = 2;

        let leg = new THREE.CylinderGeometry(legRadius,legRadius,legHeight, 64 ,64);
        let seat = new THREE.BoxGeometry(2,0.2,2);
        let back = new THREE.BoxGeometry(0.3,2.5,0.18);
        let horizontalBack = new THREE.BoxGeometry(2,0.3,0.25);
    
        //create meshes
        const leg1Mesh = new THREE.Mesh( leg, this.chairLegMaterial );
        const leg2Mesh = new THREE.Mesh( leg, this.chairLegMaterial );
        const leg3Mesh = new THREE.Mesh( leg, this.chairLegMaterial );
        const leg4Mesh = new THREE.Mesh( leg, this.chairLegMaterial );
        const chairBoxMesh = new THREE.Mesh( seat, this.chairMaterial );
        const chairBackLeftMesh = new THREE.Mesh( back, this.chairBackMaterial );
        const chairBackRigthMesh = new THREE.Mesh( back, this.chairBackMaterial );
        const chairHorizontalBackMesh = new THREE.Mesh( horizontalBack, this.chairBackMaterial );
        const chairHorizontalBackMesh2 = new THREE.Mesh( horizontalBack, this.chairBackMaterial );

        // Set the chair position
        leg1Mesh.position.set(-0.8, legHeight/2, -0.85);
        leg2Mesh.position.set(0.8, legHeight/2, -0.85);
        leg3Mesh.position.set(-0.8, legHeight/2, +0.85);
        leg4Mesh.position.set(0.8, legHeight/2, +0.85);

        //sligthly rotate leg to be more realistic
        leg1Mesh.rotateX(Math.PI/30);
        leg2Mesh.rotateX(Math.PI/30);
        leg3Mesh.rotateX(-Math.PI/30);
        leg4Mesh.rotateX(-Math.PI/30);
        leg1Mesh.rotateZ(-Math.PI/30);
        leg2Mesh.rotateZ(Math.PI/30);
        leg3Mesh.rotateZ(-Math.PI/30);
        leg4Mesh.rotateZ(Math.PI/30);

        chairBackLeftMesh.rotateZ(Math.PI/30);
        chairBackLeftMesh.rotateY(Math.PI/2);

        chairBackRigthMesh.rotateZ(Math.PI/30);
        chairBackRigthMesh.rotateY(Math.PI/2);
    
        chairHorizontalBackMesh.rotateY(Math.PI/2);
        chairHorizontalBackMesh2.rotateY(Math.PI/2);
        
        chairBoxMesh.position.set(0, legHeight, 0);
        chairBackLeftMesh.position.set(-1, legHeight+ 1.25, -0.8);
        chairBackRigthMesh.position.set(-1, legHeight+ 1.25, 0.8);
        chairHorizontalBackMesh.position.set(-1.125, legHeight + 2.5, 0);
        chairHorizontalBackMesh2.position.set(-1.05,legHeight + 1.5, 0);
        
        // Add the chair to the scene

        this.add(leg1Mesh);
        this.add(leg2Mesh);
        this.add(leg3Mesh);
        this.add(leg4Mesh);
        this.add(chairBoxMesh);
        this.add(chairBackLeftMesh);
        this.add(chairBackRigthMesh);
        this.add(chairHorizontalBackMesh);
        this.add(chairHorizontalBackMesh2);

        this.scale.set(1.5, 1.5, 1.5);

        this.traverse( function( child ) {

            child.castShadow = true;
            child.receiveShadow = true;
        
        } );
    }
}

MyChair.prototype.isGroup = true;

export { MyChair };