import * as THREE from 'three';
import { MyApp } from '../MyApp.js';

/**
 * This class contains a 3D axis representation
 */
class MySpring extends THREE.Object3D {

    /**
     * 
     * @param {MyApp} app the application object
     * @param {number} slices the number of slices of the spring
     * @param {number} levels the number of levels of the spring
     * @param {number} height the height of the spring
     * @param {number} radius the radius of the spring
     * @param {number} tubeRadius the radius of the tube
     * @param {THREE.Material} material the material of the spring
     */
    constructor(app, slices, levels, height, radius,tubeRadius,material) {
        super();
        this.app = app;
        this.type = 'Group';
        
        // spring variables
        this.springSlices = slices;
        this.springlevels = levels;
        this.springHeight = height;
        this.springRadius = radius;
        this.springRes = 30*this.springlevels;
        
        this.springMaterial = material;
        
        this.tubeRadius =tubeRadius; // Adjust this value for the desired radius
        this.radialSegments = 50; // Number of segments around the tube's circumference
        this.tubularSegments = this.springRes; // Number of segments along the tube

        this.updatedReflec = false;

        this.create();
    }

    /**
     * Create the spring
     */
    create() {
        const levelHeight = this.springHeight/this.springlevels;
        const sliceSize = Math.PI * 2 / this.springSlices;
        const heightIncrement = levelHeight / this.springSlices;
        let curvepoints = [];
        for(let level = 0; level < this.springlevels; level++){
            for (let np = 0; np< this.springSlices; np++){
                let point = new THREE.Vector3(
                    Math.cos(sliceSize*np)*this.springRadius, 
                    level * levelHeight + np * heightIncrement, 
                    Math.sin(sliceSize*np)*this.springRadius);
                curvepoints.push(point);
            }
        }

        const curve = new THREE.CatmullRomCurve3(curvepoints);

        // Create a TubeGeometry based on the curve
        const geometry = new THREE.TubeGeometry(curve, this.tubularSegments, this.tubeRadius, this.radialSegments, false);

        // Create a mesh with the tube geometry and material
        const tubeMesh = new THREE.Mesh(geometry, this.springMaterial);
        this.add(tubeMesh);

        this.createCaps(curve,geometry);


        this.traverse( function( child ) {
            child.castShadow = true;
            child.receiveShadow = true;
        } );
    }

    createCaps(curve,geometry){
        // add caps to the tube
        var p = geometry.attributes.position;
        var startPoints = [];
        startPoints.push(curve.getPoint(0));
        for(let i = 0; i <= this.radialSegments; i++){
            startPoints.push(new THREE.Vector3().fromBufferAttribute(p, i));
        }

        var pointsStartGeom = new THREE.BufferGeometry().setFromPoints(startPoints);
        var psgPos = pointsStartGeom.attributes.position;
        var indexStart = [];
        for (let i = 1; i < psgPos.count - 1; i++){
            indexStart.push(0, i, i+1);
        }
        pointsStartGeom.setIndex(indexStart);
        pointsStartGeom.computeVertexNormals();  // Compute normals for correct lighting

        var shapeStart = new THREE.Mesh( pointsStartGeom, this.springMaterial);
        this.app.scene.add(shapeStart);

        var endPoints = [];
        endPoints.push(curve.getPoint(1));
        for (let i = (this.radialSegments + 1) * this.tubularSegments; i < p.count; i++){
            endPoints.push(new THREE.Vector3().fromBufferAttribute(p, i));
        }

        var pointsEndGeom = new THREE.BufferGeometry().setFromPoints(endPoints);
        var pegPos = pointsEndGeom.attributes.position;
        var indexEnd = [];
        for (let i = 1; i < pegPos.count - 1; i++){
            indexEnd.push(0, i+1, i);
        }
        pointsEndGeom.setIndex(indexEnd);
        pointsEndGeom.computeVertexNormals();  // Compute normals for correct lighting

        var shapeEnd = new THREE.Mesh( pointsEndGeom, this.springMaterial);

        this.add(shapeStart);
        this.add(shapeEnd);
    }

    getHeightLaying(){
        return (this.springRadius + this.tubeRadius) *2 * this.scale.z;
    }
}

MySpring.prototype.isGroup = true;

export { MySpring };