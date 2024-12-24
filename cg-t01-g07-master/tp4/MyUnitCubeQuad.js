import {CGFobject} from '../lib/CGF.js';
import {CGFappearance} from '../lib/CGF.js';
import { MyQuad } from './MyQuad.js';

/**
 * MyUnitCubeQuad
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyUnitCubeQuad extends CGFobject {
	constructor(scene, top, front, right, back, left, bottom) {
		super(scene);
        this.myQuad = new MyQuad(scene);

        this.top = top;
        this.front = front;
        this.right = right;
        this.back = back;
        this.left = left;
        this.bottom = bottom;

        this.material = new CGFappearance(scene);
        this.material.setAmbient(0.1, 0.1, 0.1, 1);
        this.material.setDiffuse(0.9, 0.9, 0.9, 1);
        this.material.setSpecular(0.1, 0.1, 0.1, 1);
        this.material.setShininess(10.0);
        this.material.setTextureWrap("REPEAT", "REPEAT");

		this.initBuffers();
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

        var rot = [
            Math.cos(Math.PI), 0.0, -Math.sin(Math.PI), 0.0,
            0.0, 1.0, 0.0, 0.0,
            Math.sin(Math.PI), 0.0, Math.cos(Math.PI), 0.0,
            0.0, 0.0, 0.0, 1.0
        ];

        this.scene.multMatrix(rot);

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
            Math.cos(-Math.PI/2), 0.0, -Math.sin(-Math.PI/2), 0.0,
            0.0, 1.0, 0.0, 0.0,
            Math.sin(-Math.PI/2), 0.0, Math.cos(-Math.PI/2), 0.0,
            0.0, 0.0, 0.0, 1.0
        ];
            
        this.scene.multMatrix(rot);

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
            Math.cos(Math.PI/2), 0.0, -Math.sin(Math.PI/2), 0.0,
            0.0, 1.0, 0.0, 0.0,
            Math.sin(Math.PI/2), 0.0, Math.cos(Math.PI/2), 0.0,
            0.0, 0.0, 0.0, 1.0
        ];
            
        this.scene.multMatrix(rot);

        this.myQuad.display();

        this.scene.setDefaultAppearance();

        this.scene.popMatrix();
    }

    setNearestFiltering(){
        this.scene.gl.texParameteri(
          this.scene.gl.TEXTURE_2D,
          this.scene.gl.TEXTURE_MAG_FILTER,
          this.scene.gl.NEAREST
        );
    }

    display(){
        
        this.material.setTexture(this.front);
        this.material.apply();
        this.setNearestFiltering();
        this.displayQuad1();

        this.material.setTexture(this.back);
        this.material.apply();
        this.setNearestFiltering();
        this.displayQuad2();

        this.material.setTexture(this.top);
        this.material.apply();     
        this.setNearestFiltering();   
        this.displayQuad3();
        
        this.material.setTexture(this.bottom);
        this.material.apply();
        this.setNearestFiltering();
        this.displayQuad4();
        
        this.material.setTexture(this.left);
        this.material.apply();
        this.setNearestFiltering();
        this.displayQuad5();
        
        this.material.setTexture(this.right);
        this.material.apply();
        this.setNearestFiltering();
        this.displayQuad6();
    }
	
}

