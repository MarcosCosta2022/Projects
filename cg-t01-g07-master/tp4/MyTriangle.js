import {CGFobject} from '../lib/CGF.js';
/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyTriangle extends CGFobject {
	constructor(scene) {
		super(scene);
		this.initBuffers();

		this.possibleTextures = {
			"orange" : [ 1,0, 
						 0.5,0.5, 
						 1,1],
			"purple" : [
						0,0,
						0.25,0.25,
						0,0.5],
			"pink" : [
						0,0.5,
						0,1,
						0.5,1],
			"red" : [
						0.5,0.5,
						0.25,0.75,
						0.75,0.75],
		}
	}
	
	initBuffers() {
		this.vertices = [
			-1, 1, 0, // Left top
            -1, -1, 0, // Left bottom
            1, -1, 0, // Right bottom
			-1, 1, 0,
            -1, -1, 0,
            1, -1, 0,
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
			1, 0, 2,
			0,2,1,
			1,2,0
		];

		this.normals = [];

		for (var i = 0; i < 3; i++) {
			this.normals.push(0, 0, 1);
		}

		for (var i = 0; i < 3; i++) {
			this.normals.push(0, 0, -1);
		}
		

		//The defined indices (and corresponding vertices)
		//will be read in groups of three to draw triangles
		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	}

	updateTexCoords(color){
		this.texCoords = [...this.possibleTextures[color]];
		this.updateTexCoordsGLBuffers();
	}

}

