import {CGFobject} from '../lib/CGF.js';
/**
 
MyDiamond
@constructor
@param scene - Reference to MyScene object
*/
export class MyDiamond extends CGFobject {
    constructor(scene) {
        super(scene);
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [
            -1,0,0, // left
            0,1,0, // up
            1,0,0, // right
            0,-1,0, // down
            -1,0,0,
            0,1,0,
            1,0,0,
            0,-1,0
        ];

        //Counter-clockwise reference of vertices
        this.indices = [
            0,3,1,
            1,3,2,
            0,1,3,
            1,2,3
        ];

		this.normals = [];

        for (var i = 0; i < 4; i++) {
            this.normals.push(0, 0, 1);
        }

        for (var i = 0; i < 4; i++) {
            this.normals.push(0, 0, -1);
        }

        //The defined indices (and corresponding vertices)
        //will be read in groups of three to draw triangles
        this.primitiveType = this.scene.gl.TRIANGLES;

        this.initGLBuffers();
        
    }
}