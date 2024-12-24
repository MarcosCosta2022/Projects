import {CGFobject} from '../lib/CGF.js';
/**
 * MyUnitCube
 * @constructor
 * @param scene - Reference to MyScene object
 */

export class MyUnitCube extends CGFobject {
	constructor(scene) {
		super(scene);
		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [
            // upper vertices
			0.5, 0.5, 0.5,	// a (0)
			-0.5, 0.5, 0.5,	// b (1)
			-0.5, -0.5, 0.5, // c (2)
			0.5, -0.5, 0.5, // d (3)
            // lower vertices
            0.5, 0.5, -0.5,	// e (4)
			-0.5, 0.5, -0.5,	 // f (5)
			-0.5, -0.5, -0.5, // g (6)
			0.5, -0.5, -0.5   //h (7)
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
            0, 2, 3,
            0, 4, 1,
            1, 4, 5,
            0, 3, 7,
            0, 7, 4,
            1, 5, 6,
            1, 6, 2,
            3, 6, 7,
            3, 2, 6,
            4, 7, 6,
            4, 6, 5
		];

		//The defined indices (and corresponding vertices)
		//will be read in groups of three to draw triangles
		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	}
}

