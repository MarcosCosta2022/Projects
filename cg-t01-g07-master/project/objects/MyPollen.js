import {CGFobject} from '../../lib/CGF.js';

/**
* MyPollen
* @constructor
* @param scene - Reference to MyScene object
* @param slices - number of divisions around the Y axis
* @param stacks - number of divisions along the Y axis
* @param northScale - scale factor for the north pole
* @param southScale - scale factor for the south pole
*/
export class MyPollen extends CGFobject {
	constructor(scene, slices, stacks) {
		super(scene);

        this.slices = slices;
        this.stacks = stacks;
        this.northScale = Math.random() + 0.5;
        this.southScale = Math.random() + 0.5;

        this.initBuffers();
	}
	initBuffers() {

        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        // add vertices, indices, normals and texCoords here

        const delta_alpha = Math.PI / this.stacks / 2;
		const delta_theta = (2 * Math.PI) / this.slices;

		for (let i = 0; i <= this.stacks*2; i++) {
			const alpha = i * delta_alpha;
			var cosAlpha = Math.cos(alpha);
			var sinAlpha = Math.sin(alpha);

            if (i < this.stacks){
                cosAlpha *= this.northScale;
            }else{
                cosAlpha *= this.southScale;
            }

			for (let j = 0; j <= this.slices; j++) {
                if ((i == 0 || i == 2 * this.stacks) && j == this.slices) break; // adds one less vertex in the poles to avoid duplicate vertices
                

                const theta = j * delta_theta;
				const x = Math.cos(theta) * sinAlpha;
				const y = cosAlpha;
				const z = Math.sin(theta) * sinAlpha;

				this.vertices.push(x, y, z);
				
                this.normals.push(x, y, z);

                if (i == 0 || i == 2 * this.stacks){
                    // there is one less vertex in the poles
                    this.texCoords.push(1-(j / (this.slices-1)), i / (2 * this.stacks));
                }else{
                    this.texCoords.push(1-(j / this.slices), i / (2 * this.stacks));
                }
			}
		}


        // add indices for top stack
        // top stack is made of one triangle for each slice so the top stack has one less vertex
        for (let i = 0; i < this.slices; i++) {
            this.indices.push(i, this.slices + i + 1, this.slices + i); 
        }

		for (let i = 1; i < this.stacks*2-1; i++) {
			for (let j = 0; j < this.slices; j++) {
				const first = (i-1) * (this.slices + 1)+this.slices + j;
				const second = first + this.slices + 1;
                this.indices.push(first, first + 1, second);
                this.indices.push(second, first + 1, second + 1);
			}
		}

        // add indices for bottom stack

        const lastStack = this.vertices.length / 3 - this.slices;
        const secondLastStack = lastStack - this.slices - 1;
        for (let i = 0; i < this.slices; i++) {
            this.indices.push(lastStack+i, secondLastStack+i, secondLastStack+i+1);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}

