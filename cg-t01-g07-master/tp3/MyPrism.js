import {CGFobject} from '../lib/CGF.js';
/**
 * MyPrism
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyPrism extends CGFobject {
	constructor(scene, slices, stacks) {
		super(scene);
        this.slices = slices;
        this.stacks = stacks;
		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [];

        var sliceAngle = 2*Math.PI/this.slices;

        for (var slice = 0; slice < this.slices; slice++) {
            for (var stack = 0; stack < this.stacks+1; stack++){
                this.vertices.push(Math.cos(slice*sliceAngle), Math.sin(slice*sliceAngle), stack/this.stacks);
                this.vertices.push(Math.cos((slice+1)*sliceAngle), Math.sin((slice+1)*sliceAngle), stack/this.stacks);
            }
        }

        this.indices = [];

        for (var slice = 0; slice < this.slices; slice++) { 
            // 4 vertices per slice
            for (var stack = 0; stack < this.stacks; stack++){
                var baseVertice = slice*(this.stacks+1)*2;
                this.indices.push(baseVertice + stack*2, baseVertice + stack*2 + 1, baseVertice + stack*2 + 2);
                this.indices.push(baseVertice + stack*2 + 1, baseVertice + stack*2 + 3, baseVertice + stack*2 + 2);
            }
        }

        this.normals = [];
        
        for (var slice = 0; slice < this.slices; slice++) {
            for (var stack = 0; stack < this.stacks+1; stack++){
                this.normals.push(Math.cos((slice+0.5)*sliceAngle), Math.sin((slice+0.5)*sliceAngle), 0);
                this.normals.push(Math.cos((slice+0.5)*sliceAngle), Math.sin((slice+0.5)*sliceAngle), 0);
            }
        }

		//The defined indices (and corresponding vertices)
		//will be read in groups of three to draw triangles
		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	}
}



