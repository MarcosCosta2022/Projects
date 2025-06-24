import * as THREE from 'three';
import { MyApp } from '../MyApp.js';

/**
 * This class contains a 3D axis representation
 */
class MyPlate extends THREE.Object3D {

    /**
     * 
     * @param {MyApp} app the application object
     * @param {number} bottomRadius the radius of the bottom of the plate
     * @param {number} baseTopRadius the radius of the top of the base of the plate
     * @param {number} topInnerRadius the inner radius of the top of the plate
     * @param {number} topOuterRadius the outer radius of the top of the plate
     * @param {number} height the height of the plate
     * @param {number} baseHeight the height of the base of the plate
     * @param {number} radialSegments the number of radial segments for the geometries
     * @param {number} heightSegments the number of  height segments for the geometries
     * @param {THREE.Material} plateMaterial the material for the plate
     */
     
    constructor(app, bottomRadius, baseTopRadius, topInnerRadius, topOuterRadius, height, baseHeight, radialSegments, heightSegments,plateMaterial) {
        super();
        this.app = app;
        this.type = 'Group';
        
        this.bottomRadius = bottomRadius;
        this.baseTopRadius = baseTopRadius;
        this.topInnerRadius = topInnerRadius;
        this.topOuterRadius = topOuterRadius;
        this.height = height;
        this.baseHeight = baseHeight;
        this.radialSegments = radialSegments;
        this.heightSegments = heightSegments;
        this.plateMaterial = plateMaterial;

        this.base = null;
        this.wall = null;
        this.edge = null;

        this.create();

        this.traverse( function( child ) {
            child.castShadow = true;
            child.receiveShadow = true;
        } );
    }

    /**
     * Create the plate
     */
    create() {
        // create a cylinder for the base
        let base = new THREE.CylinderGeometry( this.baseTopRadius, this.bottomRadius, this.baseHeight, this.radialSegments, this.heightSegments );
        this.base = new THREE.Mesh( base, this.plateMaterial );
        this.base.position.set( 0, this.baseHeight/2, 0 );

        // create a cylinder for the "wall" of the plate
        let wall = new THREE.CylinderGeometry( this.topInnerRadius, this.baseTopRadius, this.height, this.radialSegments, this.heightSegments, true );
        this.wall = new THREE.Mesh( wall, this.plateMaterial );
        this.wall.position.set( 0, this.baseHeight + this.height/2, 0 );

        // create the edege of the plate
        // height = 0.01 // low so its closer to a ring
        const edgeHeight = 0.01;
        let edge = new THREE.CylinderGeometry( this.topOuterRadius,this.topInnerRadius, 0.01, this.radialSegments, this.heightSegments, true);
        this.edge = new THREE.Mesh( edge, this.plateMaterial );
        this.edge.position.set( 0, this.baseHeight + this.height + edgeHeight/2, 0 );

        this.add(this.base);
        this.add(this.wall);
        this.add(this.edge);
    }

    placeOnTop(object) {
        object.position.set(this.position.x, this.position.y + this.baseHeight+0.01, this.position.z);
    }

    centerOfThePlate(){
        return {x: this.position.x, y: this.baseHeight*this.scale.y + this.position.y, z: this.position.z};
    }

    getBaseHeigth(){
        return this.baseHeight * this.scale.y;
    }
}

MyPlate.prototype.isGroup = true;

export { MyPlate };