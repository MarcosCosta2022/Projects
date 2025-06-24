import {CGFobject} from '../lib/CGF.js';
import {MyTriangle} from './MyTriangle.js';
import {MyParallelogram} from './MyParallelogram.js';
import {MyTriangleBig} from './MyTriangleBig.js';
import {MyDiamond} from './MyDiamond.js';

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
		this.initBuffers();
	}

    // Uses RGB values from 0 to 255
    changeColor(r, g, b, a = 1){
        var red = r/255;
        var green = g/255;
        var blue = b/255;

        this.scene.setAmbient(red, green, blue, a);
        this.scene.setDiffuse(0.0, 0.0, 0.0, 1.0);
        this.scene.setSpecular(0.0, 0.0, 0.0, 1.0);
    }

    displayDiamond(){
        var esca = [
            0.675, 0.0, 0.0, 0.0,
            0.0, 0.675, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0,
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
        
        this.changeColor(0, 255, 0); // green

        this.myDiamond.display();

        this.scene.setDefaultAppearance();

        this.scene.popMatrix();
    }

    // Purple Triangle
    displayTriangle1(){
        this.scene.pushMatrix();

        var esca = [
            0.45, 0.0, 0.0, 0.0,
            0.0, 0.45, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0,
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

        this.changeColor(153, 50, 204); // purple

        this.myTriangle.display();

        this.scene.setDefaultAppearance();

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

        this.changeColor(255, 165, 0); // orange

        this.myTriangle.display();

        this.scene.setDefaultAppearance();

        this.scene.popMatrix();
    }

    // Blue Triangle
    displayTriangle3(){
        this.scene.pushMatrix();

        var esca = [
            0.75, 0.0, 0.0, 0.0,
            0.0, 0.75, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0,
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
        
        this.changeColor(0, 100, 255); // blue

        this.myTriangleBig.display();

        this.scene.setDefaultAppearance();

        this.scene.popMatrix();
    }

    // Red Triangle
    displayTriangle4(){
        this.scene.pushMatrix();

        var esca = [
            0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0,
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

        this.changeColor(255, 0, 0); // red

        this.myTriangle.display();

        this.scene.setDefaultAppearance();

        this.scene.popMatrix();
    }

    // Pink Triangle
    displayTriangle5(){
        this.scene.pushMatrix();

        var esca = [
            0.75, 0.0, 0.0, 0.0,
            0.0, 0.75, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0,
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

        this.changeColor(255, 150, 203); // pink

        this.myTriangle.display();

        this.scene.setDefaultAppearance();

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

        this.changeColor(255, 255, 0); // yellow

        this.MyParallelogram.display();

        this.scene.setDefaultAppearance();

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
	
	initBuffers() {
		this.vertices = [
			-1, 1, 0,
            -1, -1, 0,
            1, -1, 0,
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
		];

		//The defined indices (and corresponding vertices)
		//will be read in groups of three to draw triangles
		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	}
}

