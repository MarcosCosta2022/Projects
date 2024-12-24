import {CGFobject} from '../../lib/CGF.js';

/**
* MyCylinder - A cylinder with height 1
* @constructor
* @param scene - Reference to MyScene object
* @param slices - number of divisions around the Y axis
* @param topRadius - radius of the top of the cylinder
* @param bottomRadius - radius of the bottom of the cylinder
*/
export class MyCylinder extends CGFobject {
	constructor(scene, slices,stacks,topRadius, bottomRadius){
		super(scene);

        this.slices = slices;
        this.stacks = stacks;
        this.topRadius = topRadius;
        this.bottomRadius = bottomRadius;
        
        this.initBuffers();
	}
	initBuffers() {

        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords= [];

        const radiusInc = (this.bottomRadius - this.topRadius) / this.stacks;
        let radius = this.bottomRadius;

        const angleInc = 2 * Math.PI / this.slices;

        for(let stack = 0; stack <= this.stacks; stack++){
            let height = stack / this.stacks;
            for (let slice = 0; slice <= this.slices; slice++){
                let angle = slice * angleInc;

                let x = Math.cos(angle);
                let y = height;
                let z = Math.sin(angle);

                this.vertices.push(x* radius, y, z * radius);
                this.normals.push(x, 0, z);
                this.texCoords.push(slice / this.slices, stack / this.stacks);
            }
            radius -= radiusInc;
        }

        // generate indices

        for (let stack = 0; stack < this.stacks; stack++){
            const bottomLayer = stack * (this.slices +1);
            const topLayer = (stack + 1) * (this.slices + 1);
            for (let slice = 0; slice < this.slices; slice++){
                const topRight = topLayer + slice;
                const topLeft = topRight + 1;
                const bottomRight = bottomLayer + slice;
                const bottomLeft = bottomRight + 1;

                this.indices.push(topRight, topLeft, bottomRight);
                this.indices.push(bottomRight, topLeft, bottomLeft);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;

        this.initGLBuffers();
    }
}

