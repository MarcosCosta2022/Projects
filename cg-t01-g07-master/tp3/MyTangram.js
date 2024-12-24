import {CGFobject} from '../lib/CGF.js';
import {MyTriangle} from './MyTriangle.js';
import {MyParallelogram} from './MyParallelogram.js';
import {MyTriangleBig} from './MyTriangleBig.js';
import {MyDiamond} from './MyDiamond.js';
import { CGFappearance } from '../lib/CGF.js';

/**
 * MyTangram
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyTangram extends CGFobject {
	constructor(scene) {
		super(scene);
        this.myDiamond = new MyDiamond(scene);
        this.myTriangle = new MyTriangle(scene);
        this.myTriangleBig = new MyTriangleBig(scene);
        this.MyParallelogram = new MyParallelogram(scene);

        this.myDiamondMaterial = this.createMaterial(0,255,0);
        this.myTriangle1Material = this.createMaterial(153, 50, 204);
        this.myTriangle2Material = this.createMaterial(255, 165, 0);
        this.myTriangle3Material = this.createMaterial(0, 100, 255);
        this.myTriangle4Material = this.createMaterial(255, 0, 0);
        this.myTriangle5Material = this.createMaterial(255, 150, 203);
        this.myParallelogramMaterial = this.createMaterial(255, 255, 0);

		this.initBuffers();
	}

    createMaterial(r, g, b){
        var red = r / 255;
        var green = g / 255;
        var blue = b / 255;

        var material = new CGFappearance(this.scene);
        // high specular power
        material.setAmbient(red, green, blue, 1.0);
        material.setDiffuse(red, green, blue, 1.0);
        material.setSpecular(1, 1, 1, 1.0);
        
        material.setShininess(10.0);
        return material;
    }

    displayDiamond(){
        var esca = [
            0.675, 0.0, 0.0, 0.0,
            0.0, 0.675, 0.0, 0.0,
            0.0, 0.0, 1, 0.0,
            0.0, 0.0, 0.0, 1.0            
        ];

        var tran = [
            1.0, 0.0, 0.0, 0.3375,
            0.0, 1.0, 0.0, -1.3375,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ];

        var transformation = this.multiplyMatrices(tran,esca);
        transformation = this.transposeMatrix(transformation);

        this.scene.pushMatrix();

        this.scene.multMatrix(transformation);
        
        this.scene.materials[4].apply();
        this.myDiamond.display();

        this.scene.popMatrix();
    }

    // Purple Triangle
    displayTriangle1(){
        this.scene.pushMatrix();

        var esca = [
            0.45, 0.0, 0.0, 0.0,
            0.0, 0.45, 0.0, 0.0,
            0.0, 0.0, 1, 0.0,
            0.0, 0.0, 0.0, 1.0
        ];

        var tran = [
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.575, -2.25, 0.0, 1.0
        ];

        this.scene.multMatrix(tran); // figured the transformations must also be reversed here
        this.scene.multMatrix(esca);

        this.myTriangle1Material.apply();
        this.myTriangle.display();

        this.scene.popMatrix();
    }

    // Orange Triangle
    displayTriangle2(){
        this.scene.pushMatrix();

        var esca = [
            1, 0.0, 0.0, 0.0,
            0.0, -1.0, 0.0, 0.0,
            0.0, 0.0, 1, 0.0,
            0.0, 0.0, 0.0, 1.0
        ];

        this.scene.multMatrix(esca);
        
        var tran = [
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 1.0, 0.0, 1.0
        ];

        this.scene.multMatrix(tran);

        this.myTriangle2Material.apply();
        this.myTriangle.display();

        this.scene.popMatrix();
    }

    // Blue Triangle
    displayTriangle3(){
        this.scene.pushMatrix();

        var esca = [
            0.75, 0.0, 0.0, 0.0,
            0.0, 0.75, 0.0, 0.0,
            0.0, 0.0, 1, 0.0,
            0.0, 0.0, 0.0, 1.0
        ];

        this.scene.multMatrix(esca);

        var tran = [
            1.0, 0.0, 0.0, 0.0, 
            0.0, 1.0, 0.0, 0.0, 
            0.0, 0.0, 1.0, 0.0, 
            0.65, 0.0, 0.0, 1.0,
        ];

        this.scene.multMatrix(tran);

        this.myTriangle3Material.apply();
        this.myTriangleBig.display();

        this.scene.popMatrix();
    }

    // Red Triangle
    displayTriangle4(){
        this.scene.pushMatrix();

        var esca = [
            0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 1, 0.0,
            0.0, 0.0, 0.0, 1.0
        ];

        this.scene.multMatrix(esca);

        var tran = [
            -1.0, 0.0, 0.0, 0.0, // horizontal flip
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 4.0, 0.0, 1.0
        ];

        this.scene.multMatrix(tran);

        this.myTriangle4Material.apply();
        this.myTriangle.display();

        this.scene.popMatrix();
    }

    // Pink Triangle
    displayTriangle5(){
        this.scene.pushMatrix();

        var esca = [
            0.75, 0.0, 0.0, 0.0,
            0.0, 0.75, 0.0, 0.0,
            0.0, 0.0, 1, 0.0,
            0.0, 0.0, 0.0, 1.0
        ];

        this.scene.multMatrix(esca);

        var tran = [
            1.0, 0.0, 0.0, 0.0,
            0.0, -1.0, 0.0, 0.0, // vertical flip
            0.0, 0.0, 1.0, 0.0,
            0.0, 2.65, 0.0, 1.0
        ];

        this.scene.multMatrix(tran);

        this.myTriangle5Material.apply();
        this.myTriangle.display();

        this.scene.popMatrix();
    }

    displayParallelogram(){
        this.scene.pushMatrix();

        var esca = [
            -0.7, 0.0, 0.0, 0.0,
            0.0, 0.7, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ];

        var rot = [
            Math.cos(Math.PI/4), Math.sin(Math.PI/4), 0.0, 0.0,
            -Math.sin(Math.PI/4), Math.cos(Math.PI/4), 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ];

        var tran = [
            1.0, 0.0, 0.0, -1.0,
            0.0, 1.0, 0.0, -2.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ];

        var transformation = this.multiplyMatrices(rot, esca);
        transformation = this.multiplyMatrices(tran, transformation);

        var transpose = this.transposeMatrix(transformation);

        this.scene.multMatrix(transpose);

        
        this.myParallelogramMaterial.apply();
        this.MyParallelogram.display();

        this.scene.popMatrix();
    }

    multiplyMatrices(matrix1, matrix2){
        var result = [];
        for (var i = 0; i < 4; i++){
            for (var j = 0; j < 4; j++){
                result[i*4 + j] = 0;
                for (var k = 0; k < 4; k++){
                    result[i*4 + j] += matrix1[i*4 + k] * matrix2[k*4 + j];
                }
            }
        }
        return result;
    }

    transposeMatrix(matrix){
        var result = [];
        for (var i = 0; i < 4; i++){
            for (var j = 0; j < 4; j++){
                result[i*4 + j] = matrix[j*4 + i];
            }
        }
        return result;
    }

    display(){

        this.displayDiamond();

        this.displayTriangle1();

        this.displayTriangle2();

        this.displayTriangle3();

        this.displayTriangle4();

        this.displayTriangle5();

        this.displayParallelogram();

    }

    enableNormalViz(){
        this.myDiamond.enableNormalViz();
        this.MyParallelogram.enableNormalViz();
        this.myTriangle.enableNormalViz();
        this.myTriangleBig.enableNormalViz();
    }

    disableNormalViz(){
        this.myDiamond.disableNormalViz();
        this.MyParallelogram.disableNormalViz();
        this.myTriangle.disableNormalViz();
        this.myTriangleBig.disableNormalViz();
    }

    
    /**
     * Called when user interacts with GUI to change object's complexity.
     * @param {integer} complexity - changes number of nDivs
     */
    updateBuffers(complexity){
    }
}

