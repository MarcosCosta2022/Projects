import { CGFobject, CGFappearance, CGFtexture, CGFshader } from "../../lib/CGF.js";

/**
 * MyGrass class, representing a glass leave made up of triangles
 * @constructor
 * @param scene - reference to MyScene object
 *
 */

export class MyGrass extends CGFobject {
    constructor(scene) {
        super(scene);

        this.scene = scene;

        let rotation_angle_degrees = Math.random() * 15 + 5; // random angle between 5 and 20 degrees
        this.rotation_angle = rotation_angle_degrees * Math.PI / 180; // degrees to radians

        let increment_degrees = 10;
        this.increment_radians = increment_degrees * (Math.PI / 180); // degrees to radians

        this.middle_parallelogram_trans_y = -((1/4)-((1/4)*Math.cos(this.rotation_angle)));
        this.top_parallelogram_trans_y = -((1/4)-((1/4)*Math.cos(this.rotation_angle))) - ((1/4)-((1/4)*Math.cos(this.rotation_angle + this.increment_radians)));
        this.triangle_trans_y = -((1/4)-((1/4)*Math.cos(this.rotation_angle))) - ((1/4)-((1/4)*Math.cos(this.rotation_angle + this.increment_radians))) - ((1/4)-((1/4)*Math.cos(this.rotation_angle + 2*this.increment_radians)));
        this.top_trans_y = -((1/4)-((1/4)*Math.cos(this.rotation_angle))) - ((1/4)-((1/4)*Math.cos(this.rotation_angle + this.increment_radians))) - ((1/4)-((1/4)*Math.cos(this.rotation_angle + 2*this.increment_radians))) - ((1/4)-((1/4)*Math.cos(this.rotation_angle + 3*this.increment_radians)));
        
        
        this.middle_parallelogram_trans_z = - (1/4) * Math.sin(this.rotation_angle);
        this.top_parallelogram_trans_z = - (1/4) * Math.sin(this.rotation_angle) - (1/4) * Math.sin(this.rotation_angle + this.increment_radians);
        this.triangle_trans_z = - (1/4) * Math.sin(this.rotation_angle) - (1/4) * Math.sin(this.rotation_angle + this.increment_radians) - (1/4) * Math.sin(this.rotation_angle + 2*this.increment_radians);
        this.top_trans_z = - (1/4) * Math.sin(this.rotation_angle) - (1/4) * Math.sin(this.rotation_angle + this.increment_radians) - (1/4) * Math.sin(this.rotation_angle + 2*this.increment_radians) - (1/4) * Math.sin(this.rotation_angle + 3*this.increment_radians);

        this.initBuffers();
    }

    initBuffers() {

        // triangle
        this.vertices = [
            0.0375, 3/4 - this.triangle_trans_y, this.triangle_trans_z,  // bottom left
			0.025 + 0.0375, 3/4 - this.triangle_trans_y, this.triangle_trans_z,  // bottom right
			0.0125 + 0.0375, 1 - this.top_trans_y, this.top_trans_z,  // top
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
			2, 1, 0
		];

        // top parallelogram
        this.vertices2 = [
            0.025, 2/4 - this.top_parallelogram_trans_y, this.top_parallelogram_trans_z,  // bottom left 
            0.025 + 0.05, 2/4 - this.top_parallelogram_trans_y, this.top_parallelogram_trans_z,  // bottom right
            0.0375, 3/4 - this.triangle_trans_y, this.triangle_trans_z,  // top left
            0.025 + 0.0375, 3/4 - this.triangle_trans_y, this.triangle_trans_z  // top right
        ];

        this.indices2 = [
            0, 1, 2,
            1, 3, 2,
            2, 1, 0,
            1, 2, 3,
            0, 2, 1,
            3, 1, 2,
            0, 1, 2,
            1, 3, 2
        ];

        //middle parallelogram
        this.vertices3 = [
            0.0125, 1/4 - this.middle_parallelogram_trans_y, this.middle_parallelogram_trans_z,  // bottom left 
            0.0125 + 0.075, 1/4 - this.middle_parallelogram_trans_y, this.middle_parallelogram_trans_z,  // bottom right
            0.025, 2/4 - this.top_parallelogram_trans_y, this.top_parallelogram_trans_z,  // top left
            0.025 + 0.05, 2/4 - this.top_parallelogram_trans_y, this.top_parallelogram_trans_z  // top right
        ];

        this.indices3 = [
            0, 1, 2,
            1, 3, 2,
            2, 1, 0,
            1, 2, 3,
            0, 2, 1,
            3, 1, 2,
            0, 1, 2,
            1, 3, 2
        ];

        // bottom parallelogram
        this.vertices4 = [
            0, 0, 0,  // bottom left 
            0.1, 0, 0,  // bottom right
            0.0125, 1/4 - this.middle_parallelogram_trans_y, this.middle_parallelogram_trans_z,  // top left
            0.0125 + 0.075, 1/4 - this.middle_parallelogram_trans_y, this.middle_parallelogram_trans_z  // top right
        ];

        this.indices4 = [
            0, 1, 2,
            1, 3, 2,
            2, 1, 0,
            1, 2, 3,
            0, 2, 1,
            3, 1, 2,
            0, 1, 2,
            1, 3, 2
        ];


        for (let i = 0; i < this.indices2.length; i++) {
            this.indices2[i] += 3;
            this.indices3[i] += 7;
            this.indices4[i] += 11;
        }


        this.vertices = this.vertices.concat(this.vertices2);
        this.vertices = this.vertices.concat(this.vertices3);
        this.vertices = this.vertices.concat(this.vertices4);

        this.indices = this.indices.concat(this.indices2);
        this.indices = this.indices.concat(this.indices3);
        this.indices = this.indices.concat(this.indices4);

        // triangle
        this.texCoords = [
            0.462, 0.35 + 0.093,  // bottom left
            0.627, 0.35 + 0.093,  // bottom right
            0.545, 0.35,  // top
        ];

        // top parallelogram
        this.texCoords2 = [
            0.462, 0.35 + 0.093,  // bottom left
            0.627, 0.35 + 0.093,  // bottom right
            0.462, 0.35 + 2 * 0.093,  // top left
            0.627, 0.35 + 2 * 0.093,  // top right
        ];

        // middle parallelogram
        this.texCoords3 = [
            0.462, 0.35 + 2 * 0.093,  // bottom left
            0.627, 0.35 + 2 * 0.093,  // bottom right
            0.462, 0.35 + 3 * 0.093,  // top left
            0.627, 0.35 + 3 * 0.093,  // top right
        ];

        // bottom parallelogram
        this.texCoords4 = [
            0.462, 0.722,  // bottom left
            0.627, 0.722,  // bottom right
            0.462, 0.35 + 3 * 0.093,  // top left
            0.627, 0.35 + 3 * 0.093,  // top right
        ];

        this.texCoords = this.texCoords.concat(this.texCoords2);
        this.texCoords = this.texCoords.concat(this.texCoords3);
        this.texCoords = this.texCoords.concat(this.texCoords4);

		//The defined indices (and corresponding vertices)
		//will be read in groups of three to draw triangles
		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
    }

}
