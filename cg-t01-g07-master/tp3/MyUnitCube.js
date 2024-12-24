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
            // front vertices
			0.5, 0.5, 0.5,	// a (0)
			-0.5, 0.5, 0.5,	// b (1)
			-0.5, -0.5, 0.5, // c (2)
			0.5, -0.5, 0.5, // d (3)
			// left face
			-0.5, 0.5, 0.5,	// b (1)
			-0.5, 0.5, -0.5,	// f (5)
			-0.5, -0.5, -0.5, // g (6)
			-0.5, -0.5, 0.5, // c (2)
			// right face
			0.5, 0.5, -0.5,	// e (4)
			0.5, 0.5, 0.5,	// a (0)
			0.5, -0.5, 0.5, // d (3)
			0.5, -0.5, -0.5, // h (7)
			// upper face
			0.5, 0.5, -0.5,	// e (4)
			-0.5, 0.5, -0.5,	 // f (5)
			-0.5, 0.5, 0.5,	// b (1)
			0.5, 0.5, 0.5,	// a (0)
			// bottom face
			0.5, -0.5, 0.5, // d (3)
			-0.5, -0.5, 0.5, // c (2)
			-0.5, -0.5, -0.5, // g (6)
			0.5, -0.5, -0.5, // h (7)
            // back vertices
			0.5, 0.5, -0.5,	// e (4)
			-0.5, 0.5, -0.5,	// f (5)
			-0.5, -0.5, -0.5, // g (6)
			0.5, -0.5, -0.5, // h (7)
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2, // front face
            0, 2, 3,
			4, 5, 6, // left face
			4, 6, 7,
			8, 9, 10, // right face
			8, 10, 11,
			12, 13, 14, // upper face
			12, 14, 15,
			16, 17, 18, // bottom face
			16, 18, 19,
			20, 22, 21, // back face
			20, 23, 22
		];




		this.normals = [];


		for (var i = 0; i < 4; i++) {
			this.normals.push(0, 0, 1);
		}
		for (var i = 0; i < 4; i++) {
			this.normals.push(-1, 0, 0);
		}
		for (var i = 0; i < 4; i++) {
			this.normals.push(1, 0, 0);
		}
		for (var i = 0; i < 4; i++) {
			this.normals.push(0, 1, 0);
		}
		for (var i = 0; i < 4; i++) {
			this.normals.push(0, -1, 0);
		}
		for (var i = 0; i < 4; i++) {
			this.normals.push(0, 0, -1);
		}

		//The defined indices (and corresponding vertices)
		//will be read in groups of three to draw triangles
		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	}


	/**
     * Called when user interacts with GUI to change object's complexity.
     * @param {integer} complexity - changes number of nDivs
     */
    updateBuffers(complexity){

		this.initNormalVizBuffers();
    }
}

