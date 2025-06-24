import * as THREE from 'three';
import { MyApp } from '../MyApp.js';
import { MyNurbsBuilder } from '../MyNurbsBuilder.js';

/**
 * This class contains a 3D axis representation
 */
class MyFlower extends THREE.Object3D {

    /**
     * 
     * @param {MyApp} app - The application object
     * @param {number} stemRadius - The radius of the stem
     * @param {number} stemHeight - The height of the stem
     * @param {number} stemTopXOffset - The x-offset of the top of the stem
     * @param {number} receptacleRadius - The radius of the receptacle
     * @param {number} receptacleAngleRotation - The angle of rotation for the receptacle
     * @param {number} petalLength - The length of the petals
     * @param {number} petalCount - The number of petals
     * @param {THREE.Material} petalMaterial - The material for the petals
     * @param {THREE.Material} stemMaterial - The material for the stem
     * @param {THREE.Material} receptacleMaterial - The material for the receptacle
     */
    constructor(app, stemRadius,stemHeight, stemTopXOffset, receptacleRadius, receptacleAngleRotation, petalLength, petalCount, petalMaterial,stemMaterial,receptacleMaterial) {
        super();
        this.app = app;
        this.type = 'Group';
        
        this.stemRadius = stemRadius;
        this.stemTopXOffset = stemTopXOffset;
        this.stemHeight = stemHeight;
        this.receptacleRadius = receptacleRadius;
        this.receptacleAngleRotation = receptacleAngleRotation;
        this.petalLength = petalLength;
        this.petalCount = petalCount;
        
        this.stemMaterial = stemMaterial;
        this.receptacleMaterial = receptacleMaterial;
        this.petalMaterial = petalMaterial;

        this.stem = null;
        this.receptacle = null; // group that includes the petals
        this.petals = [];

        if (this.app.builder != null){
            this.builder = this.app.builder;
        } else {
            this.builder = new MyNurbsBuilder();
        }
        this.samplesU = 10;
        this.samplesV = 10;

        this.create();

        this.traverse( function( child ) {
            child.castShadow = true;
            // child.receiveShadow = true; // only cast cause the flower has double Sided materials
        } );
    }

    /**
     * Create the flower
     */
    create() {
        this.createStem();
    }

    createStem(){

        // we uses a cubic bezier curve to create the stem
        const curve = new THREE.CubicBezierCurve3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, this.stemHeight/2, 0),
            new THREE.Vector3(0, this.stemHeight*2/3, 0),
            new THREE.Vector3(this.stemTopXOffset, this.stemHeight, 0)
        );

        this.tubularSegments = 15;
        this.radialSegments = 8;

        // Create a TubeGeometry based on the curve
        const geometry = new THREE.TubeGeometry(curve, this.tubularSegments, this.stemRadius, this.radialSegments, false);

        // Create a mesh with the tube geometry and material
        const tubeMesh = new THREE.Mesh(geometry, this.stemMaterial);

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

        var shapeStart = new THREE.Mesh( pointsStartGeom, this.stemMaterial);

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

        var shapeEnd = new THREE.Mesh( pointsEndGeom, this.stemMaterial);

        const group = new THREE.Group();
        group.add(shapeStart);
        group.add(shapeEnd);
        group.add(tubeMesh);

        this.stem = group;
        this.add(this.stem);

        this.createReceptacle();

        // move receptacle to the top of the stem
        this.receptacle.position.set(this.stemTopXOffset, this.stemHeight, 0);
        // rotate receptacle to match the stem
        this.receptacle.rotation.z = -this.receptacleAngleRotation;
        // add the receptacle to this
        this.add(this.receptacle);
    }

    createReceptacle(){
        const geometrySphere = new THREE.SphereGeometry(this.receptacleRadius, 16, 16);
        const sphereMesh = new THREE.Mesh(geometrySphere, this.receptacleMaterial);
        sphereMesh.scale.set(1, 0.4, 1);

        this.receptacle = new THREE.Group();
        this.receptacle.add(sphereMesh);

        // create the petals
        this.createPetals();
        this.petals.forEach(petal => {
            this.receptacle.add(petal);
        });
    }

    createPetals(){
        // each petal is a squaled rotated square
        const petalSize = 1;
        const petalAngle = Math.PI * 2 / this.petalCount;
        const e = -0.3;
        
        for(let i = 0; i <this.petalCount; i++){

            // create a NURB for the petal
            const controlPoints = [
                [
                    [-0.1, 0, 0, 1],
                    [-0.5, 0.5, 0, 1],
                    [-0.3, 0.7, 0, 1],
                    [-0.01, 1, 0, 1]
                ],
                [
                    [-0.1, 0, 0, 1],
                    [-0.5, 0.5, -0.4, 1],
                    [-0.3, 0.7, -0.1, 1],
                    [-0.01, 1, 0, 1]
                ],
                [
                    [-0.1, 0, 0, 1],
                    [-0.5, 0.5,-0.4, 1],
                    [-0.3, 0.7, -0.1, 1],
                    [-0.01, 1, 0, 1]
                ],
                [
                    [0.1, 0, 0, 1],
                    [0.5, 0.5, 0, 1],
                    [0.3, 0.7, 0, 1],
                    [0.01, 1, 0, 1]
                ]
            ];

            const orderU = 3;
            const orderV = 3;

            const surfaceData = this.builder.build(controlPoints, orderU, orderV, this.samplesU, this.samplesV, this.petalMaterial);
            const petalMesh = new THREE.Mesh(surfaceData, this.petalMaterial);
            petalMesh.scale.set(petalSize, 1.3 * petalSize, petalSize);
            petalMesh.rotation.x = Math.PI / 2;
            petalMesh.rotation.y = petalAngle * i;
            petalMesh.rotation.order = 'YXZ';
            petalMesh.position.set(
                Math.sin(petalAngle * i) * (this.receptacleRadius + e),
                0,
                Math.cos(petalAngle * i) * (this.receptacleRadius + e)
            );
            this.petals.push(petalMesh);
            /*
            // Create the square geometry for the petal
            //const geometry = new THREE.PlaneGeometry(this.petalLength, this.petalLength);
            //const squareMesh = new THREE.Mesh(geometry, this.petalMaterial);
            
            //squareMesh.rotation.z = Math.PI / 4;

            // Create a group to apply transformations in order
            const petalGroup = new THREE.Group();
            petalGroup.add(squareMesh);
            
            petalGroup.scale.set(petalSize, 2 * petalSize, petalSize);
            petalGroup.rotation.x = -Math.PI / 2;
            petalGroup.rotation.y = petalAngle*i;
            petalGroup.rotation.order = 'YXZ';

            petalGroup.position.set(
                Math.sin(petalAngle * i) * (this.receptacleRadius + e),
                0,
                Math.cos(petalAngle * i) * (this.receptacleRadius + e)
            );

            // Add the petal group to the petals array
            this.petals.push(petalGroup);
            */
           
        }

    }
}

MyFlower.prototype.isGroup = true;

export { MyFlower };