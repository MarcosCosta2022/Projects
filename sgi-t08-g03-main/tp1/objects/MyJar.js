import * as THREE from 'three';
import { MyApp } from '../MyApp.js';

/**
 * This class contains a 3D axis representation
 */
class MyJar extends THREE.Object3D {

    /**
     * 
     * @param {MyApp} app the application object
     * @param {THREE.Material} material the material to use
     */
    constructor(app, material) {
        super();
        this.app = app;
        this.type = 'Group';
        
        if (this.app.builder != null){
            this.builder = this.app.builder;
        } else {
            this.builder = new MyNurbsBuilder();
        }
        this.material = material;

        this.leftPlaneMesh = null;
        this.rightPlaneMesh = null;
        this.baseMesh = null;

        this.samplesU = 20;
        this.samplesV = 20;

        this.midP1Height = 0.7;
        this.midP2Height = 0.9;
        this.topHeight = 1.5;

        this.bottomRadius = 0.3;
        this.midP1Radius = 1.1;    
        this.midP2Radius = -0.1;
        this.topRadius = 0.4;

        this.create();

        this.traverse( function( child ) {
            child.castShadow = true;
        } );
    }

    /**
     * Create the jar
     */
    create() {
        this.createWalls();
    }

    createWalls(){
        const midP1Height = this.midP1Height;
        const midP2Height = this.midP2Height;
        const topHeight = this.topHeight;

        const bottomRadius = this.bottomRadius;
        const midP1Radius = this.midP1Radius;
        const midP2Radius = this.midP2Radius;
        const topRadius = this.topRadius;

        const controlRatio = 4/3;

        const orderU = 3; 
        const orderV = 3; 
        let controlPointsLeft = [
            [
                [-bottomRadius, 0, 0, 1],       // Bottom (slightly narrower than the middle)
                [-midP1Radius, midP1Height, 0, 1],        // Widest point in the middle (X-axis)
                [-midP2Radius, midP2Height, 0, 1],        // Tapered mid-upper
                [-topRadius, topHeight, 0, 1]        // Narrow top
            ],
            [
                [-bottomRadius, 0, -bottomRadius*controlRatio, 1],       
                [-midP1Radius, midP1Height, -midP1Radius*4/3, 1],       
                [-midP2Radius, midP2Height, -midP2Radius*4/3, 1],        
                [-topRadius, topHeight, -topRadius*controlRatio, 1]        
            ],
            [
                [bottomRadius, 0, -bottomRadius*controlRatio, 1],       
                [midP1Radius, midP1Height, -midP1Radius*4/3, 1],        
                [midP2Radius, midP2Height, -midP2Radius*4/3, 1],       
                [topRadius, topHeight, -topRadius*controlRatio, 1]      
            ],
            [
                [bottomRadius, 0, 0, 1],
                [midP1Radius, midP1Height, 0, 1],
                [midP2Radius, midP2Height, 0, 1],
                [topRadius, topHeight, 0, 1]
            ]
        ];
        //Repeat for the other side
        let controlPointsRight = [
            [
                [-bottomRadius, 0, 0, 1],       // Bottom (slightly narrower than the middle)
                [-midP1Radius, midP1Height, 0, 1],        // Widest point in the middle (X-axis)
                [-midP2Radius, midP2Height, 0, 1],        // Tapered mid-upper
                [-topRadius, topHeight, 0, 1]        // Narrow top
            ],
            [
                [-bottomRadius, 0, bottomRadius*controlRatio, 1],      
                [-midP1Radius, midP1Height, midP1Radius*4/3, 1],        
                [-midP2Radius, midP2Height, midP2Radius*4/3, 1],        
                [-topRadius, topHeight, topRadius*controlRatio, 1]        
            ],
            [
                [bottomRadius, 0, bottomRadius*controlRatio, 1],       
                [midP1Radius, midP1Height, midP1Radius*4/3, 1],        
                [midP2Radius, midP2Height, midP2Radius*4/3, 1],        
                [topRadius, topHeight, topRadius*controlRatio, 1]        
            ],
            [
                [bottomRadius, 0, 0, 1],
                [midP1Radius, midP1Height, 0, 1],
                [midP2Radius, midP2Height, 0, 1],
                [topRadius, topHeight, 0, 1]
            ]
        ];
        
        this.surfaceDataRight = this.builder.build(controlPointsLeft, orderU, orderV, this.samplesU, this.samplesV, this.material);
        this.surfaceDataLeft = this.builder.build(controlPointsRight, orderU, orderV, this.samplesU, this.samplesV, this.material);
        
        const meshRight = new THREE.Mesh(this.surfaceDataRight, this.material);
        const meshLeft = new THREE.Mesh(this.surfaceDataLeft, this.material);
        
        this.add(meshRight);
        this.add(meshLeft);

        this.rightPlaneMesh = meshRight;
        this.leftPlaneMesh = meshLeft;

        this.createBase();
    }

    createBase(){
        const positionAttributeRight = this.surfaceDataRight.getAttribute('position');
        const positionAttributeLeft = this.surfaceDataLeft.getAttribute('position');
        const bottomPointsRight = [];
        const bottomPointsLeft = [];
        for (let i = 0; i < this.samplesU+1; i++) {
            const pointRight = new THREE.Vector3(
                positionAttributeRight.getX(i),
                positionAttributeRight.getY(i),
                positionAttributeRight.getZ(i)
            );
            bottomPointsRight.push(pointRight);

            const pointLeft = new THREE.Vector3(
                positionAttributeLeft.getX(i),
                positionAttributeLeft.getY(i),
                positionAttributeLeft.getZ(i)
            );
            bottomPointsLeft.push(pointLeft);
        }

        // reverse the left list
        bottomPointsLeft.reverse();
        // merge the two lists
        const bottomPoints = bottomPointsRight.concat(bottomPointsLeft); 

        // Create the base geometry
        const baseGeometry = new THREE.BufferGeometry();
        const centerPoint = new THREE.Vector3(0, 0, 0); // Center of the base

       
        const vertices = [];
        const uvs = [];

        // Add the center vertex 
        vertices.push(centerPoint.x, centerPoint.y, centerPoint.z);
        uvs.push(0.5, 0.5); 

        // Add surrounding points from bottomPoints array
        bottomPoints.forEach(point => {
            vertices.push(point.x, point.y, point.z);
            uvs.push((point.x + this.bottomRadius) / (2 * this.bottomRadius), (point.z + this.bottomRadius) / (2 * this.bottomRadius));
        });

        // Define faces (triangles) by connecting the center point with each pair of surrounding points
        const indices = [];
        for (let i = 1; i < bottomPoints.length; i++) {
            indices.push(0, i, i + 1);
        }
        indices.push(0, bottomPoints.length, 1);

        //Set up the geometry
        baseGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        baseGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        baseGeometry.setIndex(indices);
        baseGeometry.computeVertexNormals();

        //Create the mesh and add it to the scene
        const baseMesh = new THREE.Mesh(baseGeometry, this.material);

        this.add(baseMesh);
        this.baseMesh = baseMesh;
    }
}

MyJar.prototype.isGroup = true;

export { MyJar };