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
	}
	
	initBuffers() {
		this.vertices = [
			-1, 1, 0,
            -1, -1, 0,
            1, -1, 0,
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
}

