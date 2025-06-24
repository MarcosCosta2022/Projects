import * as THREE from 'three';
import { MyApp } from '../MyApp.js';
import { MyNurbsBuilder } from '../MyNurbsBuilder.js';

/**
 * This class represents a carpet on the floor.
 */
class MyCarpet extends THREE.Object3D {

    /**
     * 
     * @param {MyApp} app - The application object
     * @param {THREE.Material} carpetMaterial - Material for the carpet
     */
    constructor(app, carpetMaterial) {
        super();
        this.app = app;
        this.carpetMaterial = carpetMaterial;

    
        this.builder = new MyNurbsBuilder();
        
        this.samplesU = 50;
        this.samplesV = 50;

        this.width = 13;
        this.length = 14;

        // Create the carpet mesh
        this.createCarpet();
    }   

    /**
     * Create and position the carpet.
     */
    createCarpet() {
        let controlPoints =  [];
        let surfaceData;
        let orderU = 10;
        let orderV = 10;
        
        for(let i = 0; i <= orderU; i++){ // subdivide the carpet in orderU x orderV patches
            let curvePoints = [];
            for(let j = 0; j <= orderV; j++){
                curvePoints.push(
                    [
                        this.length/2 - this.length * i/orderU,
                        0,
                        -this.width/2 + this.width * j/orderV,
                        1
                    ]
                );
            }
            controlPoints.push(curvePoints);
        } 

        // Create a fold in the corner
        const mapXOffset = [
            -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1,
            -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        ];

        const mapYOffset = [
            0, 0, 6, -8, 4, 0, 0, 0, 0, 0, 3,
            0, 6, -8, 4, 0, 0, 0, 0, 0, 0, 0,
            6, -8, 4, 0, 0, 0, 0, 0, 0, 0, 0,
            -8, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            4, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
            0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0,
            -1, 0, 0, 0, 0, 0, 0, 0, 0, -1,-1,
            3, -2, 0, 0, 4, 4, 4, 0, -2, 3, 2,
            -1, 3, -2, -2, -2, -2, -2, -2, 3,0, 0,
            0, 0, 2,2, 2, 2, 2, 2, 2, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        ];

        const mapZOffset = [
            1, 1, 0, 0, 0, 0, 0, 0, 0, 6, -1,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            1, 1, 1, 1, 1, 1, -1, -1, -1, -1, 1
        ];


        // apply offsets

        const offsetScale = 0.2;
        for(let i = 0; i < controlPoints.length; i++){
            for(let j = 0; j < controlPoints[i].length; j++){
                controlPoints[i][j][0] += mapXOffset[i*(orderV+1) + j]*offsetScale;
                controlPoints[i][j][1] += mapYOffset[i*(orderV+1) + j]*offsetScale;
                controlPoints[i][j][2] += mapZOffset[i*(orderV+1) + j]*offsetScale;
            }
        }


        surfaceData = this.builder.build(controlPoints,
            orderU, orderV, this.samplesU,
            this.samplesV, this.carpetMaterial);

        const carpetMesh = new THREE.Mesh(surfaceData, this.carpetMaterial);

        this.add(carpetMesh);

        carpetMesh.receiveShadow = true;
        carpetMesh.castShadow = true;
    }
}

MyCarpet.prototype.isGroup = true;

export { MyCarpet };
