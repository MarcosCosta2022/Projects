import {CGFobject} from '../../lib/CGF.js';
/**
* MyHindWing - represents the hind wing of a bee
* @constructor
 * @param scene - Reference to MyScene object
*/
export class MyHindWing extends CGFobject {
	constructor(scene) {
		super(scene);
		this.initBuffers();
	}
	initBuffers() {

        const verticesCoords=[
            15,130,
            63,128,
            89,125,
            104,126,
            125,134,
            125,142,
            117,152,
            84,163,
            62,159,
            58,162,
            44,161,
            29,152,
            17,143,
            13,139,
        ];

        const centerCoords = [15,130];
        const width = 170;
        const height = 182;
        const ratio = 100; // ratio between the real measures and the ones in the texture

        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        for(let side = -1; side < 2; side+=2){
            for (let i = 0; i < verticesCoords.length; i+=2){
                const x = (centerCoords[1]-verticesCoords[i+1]) / ratio;
                const z = (verticesCoords[i]-centerCoords[0]) / ratio;
                this.vertices.push(x,0,z)

                const tx = verticesCoords[i] / width;
                const tz = verticesCoords[i+1] / height;
                this.texCoords.push(tx,tz);

                this.normals.push(0,side,0);
            }
        }

        const frontFaceIndices =[
            0,13,12,
            0,12,11,
            1,0,11,
            1,11,10,
            1,10,9,
            1,9,8,
            1,8,7,
            1,7,6,
            2,1,6,
            2,6,5,
            3,2,5,
            3,5,4,
        ];

        this.indices = [...frontFaceIndices];

        const numberOfVertices = this.vertices.length/6;
        // add back face indices
        for (let i = 0; i < frontFaceIndices.length; i+=3){
            const a = frontFaceIndices[i] + numberOfVertices;
            const b = frontFaceIndices[i+1] + numberOfVertices;
            const c = frontFaceIndices[i+2] + numberOfVertices;
            this.indices.push(a,c,b);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}
}


