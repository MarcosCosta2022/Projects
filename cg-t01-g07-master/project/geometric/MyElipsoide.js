import {CGFobject, CGFappearance} from '../../lib/CGF.js';
import {MySphere} from './MySphere.js';

/**
* MyElipsoide class - Represents an elipsoide
*
* @constructor
* @param scene - reference to MyScene object
* @param slices - number of divisions around the Y axis
* @param stacks - number of divisions along the Y axis
* @param radiusX - radius of the elipsoide in the X axis
* @param radiusY - radius of the elipsoide in the Y axis
* @param radiusZ - radius of the elipsoide in the Z axis
*/

export class MyElipsoide extends CGFobject {
	constructor(scene, slices, stacks, radiusX, radiusY, radiusZ) {
        super(scene);

        this.slices = slices;
        this.stacks = stacks;
        this.radiusX = radiusX;
        this.radiusY = radiusY;
        this.radiusZ = radiusZ;

        this.sphere = new MySphere(this.scene, slices, stacks);

        this.initBuffers();
    }

    display(){

        this.scene.pushMatrix();
        this.scene.scale(this.radiusX, this.radiusY, this.radiusZ);
        this.sphere.display();
        this.scene.popMatrix();

    }
		
}


