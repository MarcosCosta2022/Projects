import {CGFobject} from '../../lib/CGF.js';

/**
* MyParallelpiped class - Represents a parallelpiped
*
* @constructor
* @param scene - reference to MyScene object
* @param width - width of the parallelpiped
* @param height - height of the parallelpiped
* @param depth - depth of the parallelpiped
*/

export class MyParallelpiped extends CGFobject {
	constructor(scene, width, height, depth) {
        super(scene);

        this.width = width; // x
        this.height = height; // y
        this.depth = depth; // z

        this.initBuffers();
    }

    initBuffers(){
        this.vertices = [
            // xz plane
            0,0,0,
            this.width, 0, 0, 
            0,0,this.depth,
            this.width,0,this.depth,
            // yz plane
            0,0,0,
            0,this.height,0,
            0,0,this.depth,
            0,this.height,this.depth,
            // xy plane
            0,0,0,
            this.width,0,0,
            0,this.height,0,
            this.width,this.height,0,
            // xz plane with y = height
            0,this.height,0,
            this.width,this.height,0,
            0,this.height,this.depth,
            this.width,this.height,this.depth,
            // yz plane with x = width
            this.width,0,0,
            this.width,this.height,0,
            this.width,0,this.depth,
            this.width,this.height,this.depth,
            // xy plane with z = depth
            0,0,this.depth,
            this.width,0,this.depth,
            0,this.height,this.depth,
            this.width,this.height,this.depth

        ];
        this.indices = [
            // xz plane
            0,1,2,
            1,3,2,
            // yz plane
            4,6,5,
            5,6,7,
            // xy plane
            8,10,9,
            9,10,11,
            // xz plane with y = height
            12,14,13,
            13,14,15,
            // yz plane with x = width
            16,17,18,
            17,19,18,
            // xy plane with z = depth
            20,21,22,
            21,23,22
        ];  
        this.normals = [
            // xz plane
            0,-1,0,
            0,-1,0,
            0,-1,0,
            0,-1,0,
            // yz plane
            -1,0,0,
            -1,0,0,
            -1,0,0,
            -1,0,0,
            // xy plane
            0,0,-1,
            0,0,-1,
            0,0,-1,
            0,0,-1,
            // xz plane with y = height
            0,1,0,
            0,1,0,
            0,1,0,
            0,1,0,
            // yz plane with x = width
            1,0,0,
            1,0,0,
            1,0,0,
            1,0,0,
            // xy plane with z = depth
            0,0,1,
            0,0,1,
            0,0,1,
            0,0,1
        ];
        this.texCoords = [
            // xz plane
            0,0,
            this.width,0,
            0,this.depth,
            this.width,this.depth,
            // yz plane
            0,0,
            0,this.height,
            0,this.depth,
            0,this.height,
            // xy plane
            0,0,
            this.width,0,
            0,this.height,
            this.width,this.height,
            // xz plane with y = height
            0,0,
            this.width,0,
            0,this.depth,
            this.width,this.depth,
            // yz plane with x = width
            0,0,
            0,this.height,
            0,this.depth,
            0,this.height,
            // xy plane with z = depth
            0,0,
            this.width,0,
            0,this.height,
            this.width,this.height
        ];

        this.initGLBuffers();
    }
   
		
}


