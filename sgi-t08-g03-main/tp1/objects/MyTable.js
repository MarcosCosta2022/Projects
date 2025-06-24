import * as THREE from 'three';
import { MyApp } from '../MyApp.js';

/**
 * This class contains a 3D axis representation
 */
class MyTable extends THREE.Object3D {

    /**
     * 
     * @param {MyApp} app the application object
     * @param {number} tableHeight the height of the table
     * @param {number} tableWidth the width of the table
     * @param {number} tableDepth the depth of the table
     * @param {number} tableMargin the margin of the table
     * @param {number} tableTopThickness the thickness of the table top
     * @param {number} legsBottomRadius the radius of the bottom of the legs
     * @param {number} legsTopRadius the radius of the top of the legs
     * @param {THREE.Material} tableMaterial the material of the table
     * @param {THREE.Material} legMaterial the material of the legs
     */
    constructor(app, tableHeight, tableWidth, tableDepth, tableMargin, tableTopThickness, legsBottomRadius, legsTopRadius , tableMaterial, legMaterial) {
        super();
        this.app = app;
        this.type = 'Group';
        
        this.tableHeight = tableHeight;
        this.tableWidth = tableWidth;
        this.tableDepth = tableDepth;
        this.tableMargin = tableMargin;
        this.tableTopThickness = tableTopThickness;
        this.legsBottomRadius = legsBottomRadius;
        this.legsTopRadius = legsTopRadius;

        this.tableMaterial = tableMaterial;
        if (this.tableMaterial == null){
            this.tableMaterial = new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x222222, shininess: 50 } );
        }
        this.legMaterial = legMaterial;

        this.tableTopHeight = this.tableHeight + this.tableTopThickness/2; // for other items to use as reference

        this.create();
    }

    /**
     * Create the table
     */
    create() {

        let tableHeight = this.tableHeight;
        let tableWidth = this.tableWidth;
        let tableDepth = this.tableDepth;
        let tableMargin = this.tableMargin;
        let tableTopThickness = this.tableTopThickness;
        let legsBottomRadius = this.legsBottomRadius;
        let legsTopRadius = this.legsTopRadius;

        // start with 4 cilinders as legs, the small changes to the radius are to make it seem older or used
        let leg1 = new THREE.CylinderGeometry( legsTopRadius-0.02, legsBottomRadius+0.01, tableHeight, 64 ,64);
        let leg1Mesh = new THREE.Mesh( leg1, this.legMaterial );
        leg1Mesh.position.set( tableWidth/2 - tableMargin, tableHeight/2, tableDepth/2 - tableMargin );

        let leg2 = new THREE.CylinderGeometry( legsTopRadius-0.05, legsBottomRadius-0.01, tableHeight, 64 ,64);
        let leg2Mesh = new THREE.Mesh( leg2, this.legMaterial );
        leg2Mesh.position.set( -tableWidth/2 + tableMargin, tableHeight/2, tableDepth/2 - tableMargin );

        let leg3 = new THREE.CylinderGeometry( legsTopRadius-0.01, legsBottomRadius+0.02, tableHeight, 64 ,64);
        let leg3Mesh = new THREE.Mesh( leg3, this.legMaterial );
        leg3Mesh.position.set( tableWidth/2 - tableMargin, tableHeight/2, -tableDepth/2 + tableMargin );

        let leg4 = new THREE.CylinderGeometry( legsTopRadius+0.01, legsBottomRadius+0.05, tableHeight, 64 ,64);
        let leg4Mesh = new THREE.Mesh( leg4, this.legMaterial );
        leg4Mesh.position.set( -tableWidth/2 + tableMargin, tableHeight/2, -tableDepth/2 + tableMargin );

        // create the table top
        let tableTop = new THREE.BoxGeometry( tableWidth, tableTopThickness, tableDepth );
        let tableTopMesh = new THREE.Mesh( tableTop, this.tableMaterial );
        tableTopMesh.position.set( 0, tableHeight, 0 );

        // add all the parts to the table
        this.add(leg1Mesh);
        this.add(leg2Mesh);
        this.add(leg3Mesh);
        this.add(leg4Mesh);
        this.add(tableTopMesh);


        this.traverse( function( child ) {

            child.castShadow = true;
            child.receiveShadow = true;
        
        } );
    }
}

MyTable.prototype.isGroup = true;

export { MyTable };