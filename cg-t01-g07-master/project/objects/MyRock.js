import {CGFobject} from '../../lib/CGF.js';

/**
* MySphere
* @constructor
* @param scene - Reference to MyScene object
* @param slices - number of divisions around the Y axis
* @param stacks - number of divisions along the Y axis
*/
export class MyRock extends CGFobject {
	constructor(scene, slices, stacks) {
		super(scene);

        this.slices = slices;
        this.stacks = stacks;
        this.initBuffers();
	}
	initBuffers() {

        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        // add vertices, indices, normals and texCoords here

        const delta_alpha = Math.PI / this.stacks /2;
		const delta_theta = (2 * Math.PI) / this.slices;

        const random_factor = 0.8;
        const min_distance = -0.2; // Define the minimum distance here
        const max_distance = 0.2; // Define the maximum distance here

        let firstPoint = [];
        let firstNormal = [];
        let pole = [];
        let poleNormal = [];

        for (let i = 0; i <= this.stacks*2; i++) {
            const alpha = i * delta_alpha;
            const cosAlpha = Math.cos(alpha);
            const sinAlpha = Math.sin(alpha);

            for (let j = 0; j <= this.slices; j++) {
                if ((i == 0 || i == 2 * this.stacks) && j == this.slices) break; // adds one less vertex in the poles to avoid duplicate vertices

                const theta = j * delta_theta;

                let x = Math.cos(theta) * sinAlpha;
                let y = cosAlpha;
                let z = Math.sin(theta) * sinAlpha;

                // Calculate a random distance within the defined limits
                let distance = min_distance + Math.random() * (max_distance - min_distance);
                distance *= 1 - Math.abs(y);
                const dx = distance * x;
                const dy = distance * y;
                const dz = distance * z;

                let nx = x + (Math.random() - 0.5) * random_factor;
                let ny = y + (Math.random() - 0.5) * random_factor;
                let nz = z + (Math.random() - 0.5) * random_factor;

                // Move the vertex along the direction of the normal by the random distance
                if ((i == 0 || i == 2 * this.stacks) && j > 0){
                    // they must be the same as the pole
                    x = pole[0];
                    y = pole[1];
                    z = pole[2];

                    nx = poleNormal[0];
                    ny = poleNormal[1];
                    nz = poleNormal[2];

                }else if(j == this.slices){
                    // they must be the same as the first point
                    x = firstPoint[0];
                    y = firstPoint[1];
                    z = firstPoint[2];

                    nx = firstNormal[0];
                    ny = firstNormal[1];
                    nz = firstNormal[2];

                }else{
                    x += dx;
                    y += dy;
                    z += dz;

                     // Normalize the normal
                    const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
                    nx /= length;
                    ny /= length;
                    nz /= length;
                }

                this.normals.push(nx, ny, nz);
                this.vertices.push(x, y, z);

                if (i == 0 || i == 2 * this.stacks){
                    // there is one less vertex in the poles
                    this.texCoords.push(1-(j / (this.slices-1)), i / (2 * this.stacks));
                }else{
                    this.texCoords.push(1-(j / this.slices), i / (2 * this.stacks));
                }

                if ((i == 0 || i == 2 * this.stacks) && j == 0){
                    pole = [x, y, z];
                    poleNormal = [nx, ny, nz];
                }else if (j == 0){
                    firstPoint = [x, y, z];
                    firstNormal = [nx, ny, nz];
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

