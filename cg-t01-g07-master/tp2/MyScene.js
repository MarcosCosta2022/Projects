import { CGFscene, CGFcamera, CGFaxis } from "../lib/CGF.js";
import { MyTangram } from "./MyTangram.js";
import { MyUnitCube } from "./MyUnitCube.js";
import { MyUnitCubeQuad } from "./MyUnitCubeQuad.js";

/**
 * MyScene
 * @constructor
 */
export class MyScene extends CGFscene {
    constructor() {
        super();
    }

    init(application) {
        super.init(application);
        
        this.initCameras();
        this.initLights();

        //Background color
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);  //black

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        //Initialize scene objects
        this.axis = new CGFaxis(this);
        this.myTangram = new MyTangram(this);
        this.myUnitCube = new MyUnitCube(this);
        this.myUnitCubeQuad = new MyUnitCubeQuad(this);

        //Objects connected to MyInterface
        this.displayAxis = true;
        this.displayTangram = true;
        this.displayCube = true;
        this.displayUnitCubeQuad = true;
        this.scaleFactor = 1;
    }

    initLights() {
        this.lights[0].setPosition(15, 2, 5, 1);
        this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);

        this.lights[0].setAmbient(0.8, 0.8, 0.8, 1);

        this.lights[0].enable();
        this.lights[0].update();
    }

    initCameras() {
        this.camera = new CGFcamera(
            0.4,  //angle that we see - field of view
            0.1,  // min distance for rendering objects (everyithing in a dist shorter than 0.1 isn't going to be displayed)
            500,  // max distance
            vec3.fromValues(15, 15, 15),  //camera is positioned at 15,15,15
            vec3.fromValues(0, 0, 0)  //camera is looking at the center
        );
    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }
    
    display() {
        // ---- BEGIN Background, camera and axis setup
        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();
        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        // Draw axis
        if (this.displayAxis) this.axis.display();

        this.setDefaultAppearance();

        var sca = [
          this.scaleFactor,
          0.0,
          0.0,
          0.0,
          0.0,
          this.scaleFactor,
          0.0,
          0.0,
          0.0,
          0.0,
          this.scaleFactor,
          0.0,
          0.0,
          0.0,
          0.0,
          1.0,
        ];

        this.multMatrix(sca);

        // ---- BEGIN Primitive drawing section

        // placing diamond in the right position
        this.pushMatrix();
        
        // around the x axis
        var tran = [
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            2.5, 0.0, 3.5, 1.0
        ]

        var rot = [
            1, 0.0, 0.0, 0.0,
            0.0, Math.cos(-Math.PI / 2), Math.sin(-Math.PI / 2), 0.0,
            0.0, -Math.sin(-Math.PI / 2), Math.cos(-Math.PI / 2), 0.0,
            0.0, 0.0, 0.0, 1.0
        ]

        this.multMatrix(tran);
        this.multMatrix(rot);
        

        this.pushMatrix();

        var esc = [
            5, 0.0, 0.0, 0.0,
            0.0, 7, 0.0, 0.0,
            0.0, 0.0, 1, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]

        var tran = [
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, -0.51, 1.0
        ]

        this.multMatrix(tran);
        this.multMatrix(esc);

        this.setAmbient(0.2, 0.2, 0.2, 1.0); // color for the base
        this.setDiffuse(0.2, 0.2, 0.2, 1.0);
        this.setSpecular(0.2, 0.2, 0.2, 1.0);

        if(this.displayCube) this.myUnitCube.display();
        if(this.displayUnitCubeQuad) this.myUnitCubeQuad.display();

        this.popMatrix();

        this.myTangram.display();

        this.popMatrix();
        
        // ---- END Primitive drawing section
    }
}
