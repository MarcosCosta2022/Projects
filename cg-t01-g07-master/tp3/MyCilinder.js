import {CGFobject} from '../lib/CGF.js';
/**
 * MyCilinder
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyCilinder extends CGFobject {
	constructor(scene, slices, stacks) {
		super(scene);
        this.slices = slices;
        this.stacks = stacks;
		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [];
        this.normals = [];

        var sliceAngle = 2*Math.PI/this.slices;

        for (var slice = 0; slice < this.slices; slice++) {
            for (var stack = 0; stack < this.stacks+1; stack++){
                this.vertices.push(Math.cos(slice*sliceAngle), Math.sin(slice*sliceAngle), stack/this.stacks);
                this.normals.push(Math.cos(slice*sliceAngle), Math.sin(slice*sliceAngle), 0);
            }
        }

        this.indices = [];

        for (var slice = 0; slice < this.slices; slice++) { 
            for (var stack = 0; stack < this.stacks; stack++){
                var baseVertice = slice*(this.stacks+1);
                var nextSlice = (slice + 1) % this.slices;
                var nextBaseVertice = nextSlice*(this.stacks+1);
                this.indices.push(baseVertice + stack, nextBaseVertice + stack, baseVertice + stack + 1);
                this.indices.push(baseVertice + stack + 1, nextBaseVertice + stack, nextBaseVertice + stack + 1);
            }
        }

		//The defined indices (and corresponding vertices)
		//will be read in groups of three to draw triangles
		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	}
}



