import * as THREE from 'three';
import { MyApp } from '../MyApp.js';
import { MyNurbsBuilder } from '../MyNurbsBuilder.js';

/**
 * This class contains a 3D axis representation
 */
class MyNewspaper extends THREE.Object3D {

    /**
     * 
     * @param {MyApp} app the application object
     * @param {number}pagesCount the number of pages the newspaper has
     * @param {THREE.Material} rightPagesMaterial the material for the right pages
     * @param {THREE.Material} leftPagesMaterial the material for the left pages
     */
    constructor(app,pagesCount, rightPagesMaterial, leftPagesMaterial) {
        super();
        this.app = app;
        this.type = 'Group';
        
        this.pages =pagesCount;
        this.width = 750/ 750;
        this.length = 600/750;

        this.pageMeshes = [];

        if (this.app.builder != null){
            this.builder = this.app.builder;
        } else {
            this.builder = new MyNurbsBuilder();
        }
        this.samplesU = 30;
        this.samplesV = 30;

        this.rightPageMaterial = rightPagesMaterial;
        this.leftPageMaterial = leftPagesMaterial;

        this.create();
    }

    /**
     * Create the newspaper
     */
    create() {

        let controlPoints;
        let surfaceData;
        let mesh;
        let orderU = 1;
        let orderV = 1;

        for (let i = 0; i < this.pages; i++){

            let inc = i /this.pages/10;

            let rightPageCurvePoints = [ // degree 2
                [
                    [0,inc/3,0,1],
                    [(0.2+inc)*this.width,0.15+inc,0,1],
                    [(0.8-inc)*this.width,inc/2,0,1],
                ],
                [
                    [0,inc/3,this.length,1],
                    [(0.2+inc)*this.width,0.15+inc,this.length,1],
                    [(0.8-inc)*this.width,inc/2,this.length,1],
                ]
            ];

            controlPoints = rightPageCurvePoints;
            orderU = 1;
            orderV = 2;
            surfaceData = this.builder.build(controlPoints,
                orderU, orderV, this.samplesU,
                this.samplesV, this.rightPageMaterial);

            mesh = new THREE.Mesh(surfaceData, this.rightPageMaterial);

            if (i == this.pages-1){
                // only cast shadow on the last page
                mesh.castShadow = true;
            }else{
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }

            this.pageMeshes.push(mesh);
            this.add(mesh);

            let leftPageCurvePoints = [ // degree 3
                [
                    [0,inc/3,0,1],
                    [-0.2*this.width,0.2+inc*1.5,0,1],
                    [-(0.4+inc)*this.width,-0.1-inc/2,0,1],
                    [-(0.7-inc)*this.width,inc/2,0,1],
                ],
                [
                    [0,inc/3,this.length,1],
                    [-0.2*this.width,0.2+inc*1.5,this.length,1],
                    [-(0.4+inc)*this.width,-0.05-inc/2,this.length,1],
                    [-(0.7-inc)*this.width,inc/2,this.length,1],
                ]
            ];

            controlPoints = leftPageCurvePoints;
            orderU = 1;
            orderV = 3;
            surfaceData = this.builder.build(controlPoints,
                orderU, orderV, this.samplesU,
                this.samplesV, this.leftPageMaterial);

            mesh = new THREE.Mesh(surfaceData, this.leftPageMaterial);

            if (i == this.pages-1){
                // only cast shadow on the last page
                mesh.castShadow = true;
            }else{
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }

            this.pageMeshes.push(mesh);
            this.add(mesh);
        }
    }
}

MyNewspaper.prototype.isGroup = true;

export { MyNewspaper };

