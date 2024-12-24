import {CGFobject} from '../../lib/CGF.js';
/**
 * MyStem class, representing a stem of a flower - made up of a cilinder
 * @constructor
 * @param scene - Reference to MyScene object
 * @param radius - Radius of the stem
 * @param size - Height of the stem
 */
export class MyStem extends CGFobject {
    constructor(scene, radius, size) {
        super(scene);
        this.radius = radius;
        this.size = size;
        this.slices = 30; // number of slices
        this.stacks = 1; // number of stacks
        this.initBuffers();
    }
    
    initBuffers() {
        this.vertices = [];
        this.normals = [];
        this.texCoords = [];

        var sliceAngle = 2*Math.PI/this.slices;
        var uMin = 0.485, uMax = 0.514, vMin = 0.521, vMax = 0.9; // texture coordinates

        for (var slice = 0; slice < this.slices; slice++) {
            for (var stack = 0; stack < this.stacks+1; stack++){
                this.vertices.push(this.radius * Math.cos(slice*sliceAngle), stack * this.size, this.radius * Math.sin(slice*sliceAngle));
                this.normals.push(Math.cos(slice*sliceAngle), 0, Math.sin(slice*sliceAngle));
                // Calculate texture coordinates
                var u = uMin + (uMax - uMin) * slice / this.slices;
                var v = vMin + (vMax - vMin) * stack / this.stacks;
                this.texCoords.push(u, v);
            }
        }

        this.indices = [];

        for (var slice = 0; slice < this.slices; slice++) { 
            for (var stack = 0; stack < this.stacks; stack++){
                var baseVertice = slice*(this.stacks+1);
                var nextSlice = (slice + 1) % this.slices;
                var nextBaseVertice = nextSlice*(this.stacks+1);
                this.indices.push(baseVertice + stack, baseVertice + stack + 1, nextBaseVertice + stack); // reverse the order
                this.indices.push(baseVertice + stack + 1, nextBaseVertice + stack + 1, nextBaseVertice + stack); // reverse the order
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;

        this.initGLBuffers();
    }
}
