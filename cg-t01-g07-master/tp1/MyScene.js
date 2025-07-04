import { CGFscene, CGFcamera, CGFaxis } from "../lib/CGF.js";
import { MyDiamond } from "./MyDiamond.js";
import { MyTriangle } from "./MyTriangle.js";
import { MyParallelogram } from "./MyParallelogram.js";
import { MyTriangleSmall } from "./MyTriangleSmall.js";
import { MyTriangleBig } from "./MyTriangleBig.js";

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
        this.diamond = new MyDiamond(this);
        this.triangle = new MyTriangle(this);
        this.parallelogram = new MyParallelogram(this);
        this.myTriangleSmall = new MyTriangleSmall(this);
        this.myTriangleBig = new MyTriangleBig(this);

        //Objects connected to MyInterface
        this.displayAxis = true;
        this.displayDiamond = true;
        this.displayTriangle = true;
        this.displayParallelogram = true;
        this.displayMyTriangleSmall = true;
        this.displayMyTriangleBig = true;
        this.scaleFactor = 1;
    }

    initLights() {
        this.lights[0].setPosition(15, 2, 5, 1);
        this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
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
        this.setDiffuse(0.8, 0.4, 0.2, 1.0);
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

        if (this.displayDiamond) this.diamond.display();

        if (this.displayTriangle) this.triangle.display();

        if (this.displayParallelogram) this.parallelogram.display();

        if (this.displayMyTriangleSmall) this.myTriangleSmall.display();

        if (this.displayMyTriangleBig) this.myTriangleBig.display();
        
        // ---- END Primitive drawing section
    }
}
