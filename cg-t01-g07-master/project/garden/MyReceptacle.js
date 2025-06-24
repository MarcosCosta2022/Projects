import {CGFobject} from '../../lib/CGF.js';
/**
* MyReceptacle class, representing the receptacle of the flower - a circle
* @constructor
 * @param scene - reference to MyScene object
 * @param radius - radius of the flower receptacle
 * @param texCenter - texture coordinates of the center of the receptacle
 * @param texRadius - radius of the texture circle
*/

export class MyReceptacle extends CGFobject {
	constructor(scene, radius, texCenter, texRadius) {
		super(scene);
		
        this.radius = radius;
        this.texCenter = texCenter;
        this.texRadius = texRadius;

		this.initBuffers();
	}

    initBuffers() {
        // create a pyramid with the given radius and color
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        var theta = 0;
        var thetaInc = (2 * Math.PI) / 12.0;

        let centerX = this.texCenter[0];
        let centerY = this.texCenter[1];

        // center of the base
        this.vertices.push(0, 0, 0);
        this.normals.push(0, 0, -1);
        this.texCoords.push(centerX, centerY); // center of the texture

        // vertices of the base
        var r = 0.5 * this.texRadius; // radius of the texture circle
        for (var i = 0; i < 12; i++) {
            this.vertices.push(this.radius * Math.cos(theta), this.radius * Math.sin(theta), 0);
            this.normals.push(0, 0, -1);
            // Adjust the texture coordinates
            var u = centerX + r * Math.cos(theta); // Center x
            var v = centerY + r * Math.sin(theta); // Center y
            this.texCoords.push(u, v);
            theta += thetaInc;
        }

        // indices of the base
        for (var i = 1; i < 12; i++) {
            this.indices.push(0, i, i + 1);
            this.indices.push(0, i + 1, i);
        }
        this.indices.push(0, 12, 1); // close the base
        this.indices.push(0, 1, 12);

        // vertices, normals, and indices of the sides
        for (var i = 1; i <= 13; i++) {
            // two vertices at the base
            var v1 = [this.vertices[3 * i], this.vertices[3 * i + 1], this.vertices[3 * i + 2]];
            var v2 = [this.vertices[3 * ((i % 12) + 1)], this.vertices[3 * ((i % 12) + 1) + 1], this.vertices[3 * ((i % 12) + 1) + 2]];
            // one vertex at the front
            var v3 = [0, 0, .6*this.radius];

            // push vertices
            this.vertices.push(...v1);
            this.vertices.push(...v2);
            this.vertices.push(...v3);

            // compute the normal
            var normal = [
                this.radius * (Math.cos(theta - thetaInc / 2) + Math.cos(theta + thetaInc / 2)),
                this.radius * (Math.sin(theta - thetaInc / 2) + Math.sin(theta + thetaInc / 2)),
                0
            ];
            var length = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
            normal = normal.map(n => n / length);

            // three normals
            this.normals.push(...normal);
            this.normals.push(...normal);
            this.normals.push(0, 0, 1);

            // three texture coordinates
            var u1 = this.texCoords[2 * i]; // same as the corresponding vertex of the base
            var v1 = this.texCoords[2 * i + 1]; // same as the corresponding vertex of the base
            var u2 = this.texCoords[2 * ((i % 12) + 1)]; // same as the corresponding vertex of the base
            var v2 = this.texCoords[2 * ((i % 12) + 1) + 1]; // same as the corresponding vertex of the base
            this.texCoords.push(u1, v1);
            this.texCoords.push(u2, v2);
            this.texCoords.push(centerX, centerY); // center of the texture

            // one triangle
            var base = 12 + 3 * (i - 1);
            this.indices.push(base, base + 1, base + 2);
            this.indices.push(base + 2, base + 1, base);

            theta += thetaInc;
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
		
}


