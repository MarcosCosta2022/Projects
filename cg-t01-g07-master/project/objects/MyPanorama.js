import {CGFobject,  CGFappearance} from '../../lib/CGF.js';
import {MySphere} from '../geometric/MySphere.js';

/**
* MyPanorama
* @constructor
* @param scene - Reference to MyScene object
* @param texture - Reference to the texture
*/
export class MyPanorama extends CGFobject {
	constructor(scene, texture) {
		super(scene);

        this.sphere = new MySphere(scene, 100, 50, true);

        this.texture = texture;

        this.material = new CGFappearance(scene);
        this.material.setAmbient(1, 1, 1, 1);
        this.material.setTexture(this.texture);
        this.material.setTextureWrap('REPEAT', 'REPEAT');
	}

    updateTexture(texture){
        this.texture = texture;
        this.material.setTexture(this.texture);
    }

	display(){
        this.scene.pushMatrix();
        this.scene.scale(200, 200, 200);
        this.material.apply();
        this.sphere.display();
        this.scene.popMatrix();
    }
}
