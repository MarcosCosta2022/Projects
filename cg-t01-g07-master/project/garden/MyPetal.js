import {CGFobject} from '../../lib/CGF.js';
/**
* MyPetal class, representing the petal of the flower - made up of 2 triangles to create a diamond shape
* @constructor
 * @param scene - reference to MyScene object
 * @param receptacleRadius - radius of the receptacle of the flower
 * @param rotAngle - angle of rotation of the petal
 * @param unionAngle - angle of union of the petal
 * @param texCoords - texture coordinates of the petal
 * 
*/

export class MyPetal extends CGFobject {
    constructor(scene, receptacleRadius, rotAngle, unionAngle, texCoords) {
            super(scene);

            this.receptacleRadius = receptacleRadius;
            this.rotAngle = rotAngle;
            this.unionAngle = unionAngle;
            this.texCoords = texCoords;

            this.initBuffers();
    }

    initBuffers() {

        let y = (Math.PI/2) - this.rotAngle;
        let x_increment = 1.4 * Math.sin(y);
        let z_increment = - 1.4 * Math.cos(y);

        let x = 1.4 * Math.cos(this.unionAngle);
        let z = 1.4 * Math.sin(this.unionAngle);

        this.vertices = [
            0, 0, 0,
            x, 0.7, z,
            x_increment + x, 0, z_increment + z,
            x, -0.7, z
        ];

        this.indices = [
            0, 1, 3,
            1, 2, 3,
            3, 1, 0,
            3, 2, 1
        ];

        this.primitiveType = this.scene.gl.TRIANGLES;

        this.initGLBuffers();
    }
}


