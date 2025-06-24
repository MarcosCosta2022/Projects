import {CGFobject} from '../lib/CGF.js';
import { MyQuad } from './MyQuad.js';

/**
 * MyUnitCubeQuad
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyUnitCubeQuad extends CGFobject {
	constructor(scene) {
		super(scene);
        this.myQuad = new MyQuad(scene);
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

    // Front face
    displayQuad1(){
        
        this.scene.pushMatrix();

        //push quad 0.5 to the front
        var tran = [
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.5, 1.0
        ];

        this.scene.multMatrix(tran);

        this.changeColor(165, 70, 42); // brown

        this.myQuad.display();

        this.scene.setDefaultAppearance();

        this.scene.popMatrix();
    }

    // Back face
    displayQuad2(){
        
        this.scene.pushMatrix();

        //push quad 0.5 to the back
        var tran = [
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, -0.5, 1.0
        ];

        this.scene.multMatrix(tran);

        this.changeColor(165, 70, 42); // brown

        this.myQuad.display();

        this.scene.setDefaultAppearance();

        this.scene.popMatrix();
    }

    // Top face
    displayQuad3(){
        
        this.scene.pushMatrix();

        //push quad 0.5 to the top
        var tran = [
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.5, 0.0, 1.0
        ];

        this.scene.multMatrix(tran);

        //rotate to make horizontal
        var rot = [
            1.0, 0.0, 0.0, 0.0,
            0.0, Math.cos(-Math.PI/2), Math.sin(-Math.PI/2), 0.0,
            0.0, -Math.sin(-Math.PI/2), Math.cos(-Math.PI/2), 0.0,
            0.0, 0.0, 0.0, 1.0
        ];
            
        this.scene.multMatrix(rot);

        this.changeColor(165, 70, 42); // brown

        this.myQuad.display();

        this.scene.setDefaultAppearance();

        this.scene.popMatrix();
    }

    // Display the bottom face
    displayQuad4(){
        
        this.scene.pushMatrix();

        var tran = [
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, -0.5, 0.0, 1.0
        ];

        this.scene.multMatrix(tran);

        //rotate to make horizontal
        var rot = [
            1.0, 0.0, 0.0, 0.0,
            0.0, Math.cos(Math.PI/2), Math.sin(Math.PI/2), 0.0,
            0.0, -Math.sin(Math.PI/2), Math.cos(Math.PI/2), 0.0,
            0.0, 0.0, 0.0, 1.0
        ];
            
        this.scene.multMatrix(rot);

        this.changeColor(165, 70, 42); // brown

        this.myQuad.display();

        this.scene.setDefaultAppearance();

        this.scene.popMatrix();
    }

    // Display the left face
    displayQuad5(){
        
        this.scene.pushMatrix();

        var tran = [
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            -0.5, 0.0, 0.0, 1.0
        ];

        this.scene.multMatrix(tran);

        var rot = [
            Math.cos(Math.PI/2), 0.0, -Math.sin(Math.PI/2), 0.0,
            0.0, 1.0, 0.0, 0.0,
            Math.sin(Math.PI/2), 0.0, Math.cos(Math.PI/2), 0.0,
            0.0, 0.0, 0.0, 1.0
        ];
            
        this.scene.multMatrix(rot);

        this.changeColor(165, 70, 42); // brown

        this.myQuad.display();

        this.scene.setDefaultAppearance();

        this.scene.popMatrix();
    }

    // Display the right face
    displayQuad6(){
        
        this.scene.pushMatrix();

        //push quad 0.5 to the right
        var tran = [
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.5, 0.0, 0.0, 1.0
        ];

        this.scene.multMatrix(tran);

        var rot = [
            Math.cos(-Math.PI/2), 0.0, -Math.sin(-Math.PI/2), 0.0,
            0.0, 1.0, 0.0, 0.0,
            Math.sin(-Math.PI/2), 0.0, Math.cos(-Math.PI/2), 0.0,
            0.0, 0.0, 0.0, 1.0
        ];
            
        this.scene.multMatrix(rot);

        this.changeColor(165, 70, 42); // brown

        this.myQuad.display();

        this.scene.setDefaultAppearance();

        this.scene.popMatrix();
    }

    display(){
        
        this.displayQuad1();

        this.displayQuad2();
        
        this.displayQuad3();
        
        this.displayQuad4();
        
        this.displayQuad5();
        
        this.displayQuad6();
    }
	
}

