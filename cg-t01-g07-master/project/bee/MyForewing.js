import {CGFobject} from '../../lib/CGF.js';
/**
* MyForeWing - represents the fore wing of a bee
* @constructor
 * @param scene - Reference to MyScene object
*/
export class MyForewing extends CGFobject {
	constructor(scene) {
		super(scene);
		this.initBuffers();
	}
	initBuffers() {
        const verticesCoords=[
            14,134,
            14,123,
            45,93,
            73,60,
            106,27,
            124,16,
            143,13,
            152,18,
            153,35,
            147,57,
            134,83,
            98,93,
            62,115,
            14,134,
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
            1,0,12,
            2,1,12,
            2,12,11,
            3,2,11,
            3,11,10,
            4,3,10,
            4,10,9,
            5,4,9,
            5,9,8,
            6,5,8,
            6,8,7,
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


