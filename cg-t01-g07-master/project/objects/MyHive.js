import { CGFobject, CGFappearance, CGFtexture } from "../../lib/CGF.js";
import { MyParallelpiped } from "../geometric/MyParallelpiped.js";
import { MyPollen } from "./MyPollen.js";

/**
* MyHive class, representing a hive
* @constructor
 * @param scene - reference to MyScene object
 * 
*/

export class MyHive extends CGFobject {
    constructor(scene) {
        super(scene);

        this.scene = scene;
        this.parallelpiped = new MyParallelpiped(scene, 1, 1, 0.1);

        // Material for the box
        this.boxMaterial = new CGFappearance(this.scene);
        this.boxMaterial.setAmbient(0.33, 0.23, 0.08, 1);
        this.boxMaterial.setDiffuse(0.33, 0.23, 0.08, 1);
        this.boxMaterial.setSpecular(0.33, 0.23, 0.08, 1);
        this.boxMaterial.setShininess(10.0);
        this.boxMaterial.loadTexture("textures/lightWood.jpg");
        this.boxMaterial.setTextureWrap("REPEAT", "REPEAT");

        // Material for the handles
        this.handleFrontMaterial = new CGFappearance(this.scene);
        this.handleFrontMaterial.setAmbient(0.6, 0.4, 0.2, 1);
        this.handleFrontMaterial.setDiffuse(0.6, 0.4, 0.2, 1);
        this.handleFrontMaterial.setSpecular(0.6, 0.4, 0.2, 1);
        this.handleFrontMaterial.setShininess(10.0);
        this.handleFrontMaterial.loadTexture("textures/lightWood.jpg");
        this.handleFrontMaterial.setTextureWrap("REPEAT", "REPEAT");

        this.handleBackMaterial = new CGFappearance(this.scene);
        this.handleBackMaterial.setAmbient(0.35, 0.28, 0.12, 1);
        this.handleBackMaterial.setDiffuse(0.35, 0.28, 0.12, 1);
        this.handleBackMaterial.setSpecular(0.35, 0.28, 0.12, 1);
        this.handleBackMaterial.setShininess(10.0);
        this.handleBackMaterial.loadTexture("textures/lightWood.jpg");
        this.handleBackMaterial.setTextureWrap('REPEAT', 'REPEAT');

        // separators black material
        this.separatorMaterial = new CGFappearance(this.scene);
        this.separatorMaterial.setAmbient(0, 0, 0, 1);
        this.separatorMaterial.setDiffuse(0, 0, 0, 1);
        this.separatorMaterial.setSpecular(0, 0, 0, 1);
        this.separatorMaterial.setShininess(10.0);

        this.pollen = [];

        // temp
        for(let i = 0 ; i < 20; i++){
            console.log("pollen");
            this.pollen.push( new MyPollen(this.scene, 10,10) );
        }

        this.initBuffers();
    }

    addPollen(pollen) {
        this.pollen.push(pollen);
        console.log(this.pollen.length);
    }

    displayBottomSeparator() {
        this.scene.pushMatrix();
        this.scene.translate(0, 1.05, 0);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(5, 5.1, 0.5);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayMiddleSeparator() {
        this.scene.pushMatrix();
        this.scene.translate(0, 4.1, 0);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(5, 5.1, 0.5);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displaySeparators() {
        this.separatorMaterial.apply();
        this.displayBottomSeparator();
        this.displayMiddleSeparator();
    }

    displayFrontFaceBox() {
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 5);
        this.scene.scale(5, 3, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayBackFaceBox() {
        this.scene.pushMatrix();
        this.scene.scale(5, 3, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayRightFaceBox() {
        this.scene.pushMatrix();
        this.scene.translate(4.9, 0, 5);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.scale(5, 3, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayLeftFaceBox() {
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 5);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.scale(5, 3, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayBottomBox() {  
        this.boxMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, 1.05, 0);
        this.displayFrontFaceBox();
        this.displayBackFaceBox();
        this.displayLeftFaceBox();
        this.displayRightFaceBox();
        this.scene.popMatrix();
    }

    displayTopBox() {
        this.boxMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, 4.1, 0);
        this.scene.scale(1, 0.7, 1);
        this.displayFrontFaceBox();
        this.displayBackFaceBox();
        this.displayLeftFaceBox();
        this.displayRightFaceBox();
        this.scene.popMatrix();
    }

    displayFrontFaceLeg() {
        this.scene.pushMatrix();
        this.scene.translate(0, 0.5, 5);
        this.scene.scale(5, 0.5, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayBackFaceLeg() {
        this.scene.pushMatrix();
        this.scene.scale(5, 1, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayRightFaceLeg() {
        this.scene.pushMatrix();
        this.scene.translate(4.9, 0, 5);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.scale(5, 1, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayLeftFaceLeg() {
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 5);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.scale(5, 1, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayBottomFaceLeg() {
        this.scene.pushMatrix();
        this.scene.translate(0, 0.5, 0);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(5, 5.7, 1.5);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayLegs() {
        this.boxMaterial.apply();
        this.displayFrontFaceLeg();
        this.displayBackFaceLeg();
        this.displayRightFaceLeg();
        this.displayLeftFaceLeg();
        this.displayBottomFaceLeg();
    }

    displayFrontRectHandle() {
        this.handleFrontMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0.3);
        this.scene.scale(2, 0.8, 1.5);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayBackRectHandle() {
        this.handleBackMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, 0.3, 0);
        this.scene.scale(2, 0.5, 3);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayHandle() {
        this.displayFrontRectHandle();
        this.displayBackRectHandle();
    }

    displayBottomFrontHandle() {
        this.handleFrontMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(1.5, 2.5, 5.1);
        this.displayHandle();
        this.scene.popMatrix();
    }

    displayBottomRightHandle() {
        this.handleFrontMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(4.9, 2.5, 3.5);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.displayHandle();
        this.scene.popMatrix();
    }

    displayBottomLeftHandle() {
        this.handleFrontMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, 2.5, 1.5);
        this.scene.rotate(-Math.PI / 2, 0, 1, 0);
        this.displayHandle();
        this.scene.popMatrix();
    }

    displayBottomBackHandle() {
        this.handleBackMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(1.5, 2.5, 0);
        this.scene.scale(1, 1, -1);
        this.displayHandle();
        this.scene.popMatrix();
    }

    displayTopFrontHandle() {
        this.handleFrontMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(1.5, 5, 5.1);
        this.displayHandle();
        this.scene.popMatrix();
    }

    displayTopRightHandle() {
        this.handleFrontMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(4.9, 5, 3.5);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.displayHandle();
        this.scene.popMatrix();
    }

    displayTopLeftHandle() {
        this.handleFrontMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, 5, 1.5);
        this.scene.rotate(-Math.PI / 2, 0, 1, 0);
        this.displayHandle();
        this.scene.popMatrix();
    }

    displayTopBackHandle() {
        this.handleBackMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(1.5, 5, 0);
        this.scene.scale(1, 1, -1);
        this.displayHandle();
        this.scene.popMatrix();
    }

    displayHandles() {
        this.displayBottomFrontHandle();
        this.displayBottomRightHandle();
        this.displayBottomLeftHandle();
        this.displayBottomBackHandle();
        this.displayTopFrontHandle();
        this.displayTopRightHandle();
        this.displayTopLeftHandle();
        this.displayTopBackHandle();
    }

    displayTopFaceLid() {
        this.boxMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, 0.7, 0);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(5, 5, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayFrontFaceLid() {
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 5);
        this.scene.scale(5, 0.7, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayRightFaceLid() {
        this.scene.pushMatrix();
        this.scene.translate(4.9, 0, 5);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.scale(5, 0.7, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayLeftFaceLid() {
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 5);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.scale(5, 0.7, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayBackFaceLid() {
        this.scene.pushMatrix();
        this.scene.scale(5, 0.7, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayLid() {
        this.scene.pushMatrix();
        this.scene.translate(-Math.cos(Math.PI/3)*5, 0, 0);
        this.scene.rotate(Math.PI/3, 0, 0, 1);
        this.displayTopFaceLid();
        this.displayFrontFaceLid();
        this.displayRightFaceLid();
        this.displayLeftFaceLid();
        this.displayBackFaceLid();
        this.scene.popMatrix();
    }

    displayFirstRectTop() {
        this.scene.pushMatrix();
        this.scene.translate(0.1, 6.2, 0.15);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(4.8, .488, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displaySecondRectTop() {
        this.scene.pushMatrix();
        this.scene.translate(0.1, 6.2, 0.688); //0.15 + 0.488 + 0.05
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(4.8, 0.488, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayThirdRectTop() {
        this.scene.pushMatrix();
        this.scene.translate(0.1, 6.2, 1.225); //0.688 + 0.488 + 0.05
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(4.8, 0.488, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayFourthRectTop() {
        this.scene.pushMatrix();
        this.scene.translate(0.1, 6.2, 1.763); //1.225 + 0.488 + 0.05
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(4.8, 0.488, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayFifthRectTop() {
        this.scene.pushMatrix();
        this.scene.translate(0.1, 6.2, 2.3); //1.763 + 0.488 + 0.05
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(4.8, 0.488, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displaySixthRectTop() {
        this.scene.pushMatrix();
        this.scene.translate(0.1, 6.2, 2.838); //2.3 + 0.488 + 0.05
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(4.8, 0.488, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displaySeventhRectTop() {
        this.scene.pushMatrix();
        this.scene.translate(0.1, 6.2, 3.375); //2.838 + 0.488 + 0.05
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(4.8, 0.488, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayEighthRectTop() {
        this.scene.pushMatrix();
        this.scene.translate(0.1, 6.2, 3.913); //3.375 + 0.488 + 0.05
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(4.8, 0.488, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayNinthRectTop() {
        this.scene.pushMatrix();
        this.scene.translate(0.1, 6.2, 4.45); //3.913 + 0.488 + 0.05
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(4.8, 0.488, 1);
        this.parallelpiped.display();
        this.scene.popMatrix();
    }

    displayTop() {
        this.handleFrontMaterial.apply();
        this.displayFirstRectTop();
        this.displaySecondRectTop();
        this.displayThirdRectTop();
        this.displayFourthRectTop();
        this.displayFifthRectTop();
        this.displaySixthRectTop();
        this.displaySeventhRectTop();
        this.displayEighthRectTop();
        this.displayNinthRectTop();
    }

    displayPollen() {
        this.scene.pollenMaterial.apply();
        // display at most n*8 pollen
        const n = 8;
        let length = Math.min(this.pollen.length, n * 8);
        const margin = 0.6;
        const sideLength = 5;
        // calculate the space between each pollen based on the number of pollen and the margin
        const space = (sideLength - 2*margin) / (n - 1);
        for (let i = 0; i < length; i++) {
            // put it on a grid on top of the hive
            this.scene.pushMatrix();
            const x = margin + (i % n) * space;
            const z = margin + Math.floor(i / n) * space;
            this.scene.translate(x, 6.2, z);
            if (!this.pollen[i].rotation) this.pollen[i].rotation = Math.random() * 2 * Math.PI;
            this.scene.rotate(this.pollen[i].rotation, 0, 1, 0);
            if (!this.pollen[i].scale) this.pollen[i].scale = 0.1 + Math.random() * 0.2;
            this.scene.scale(this.pollen[i].scale, this.pollen[i].scale, this.pollen[i].scale);
            this.pollen[i].display();
            this.scene.popMatrix();
        }
    }

    display() {
        this.displayBottomBox();
        this.displayTopBox();
        this.displayLegs();
        this.displayHandles();
        this.displaySeparators();
        this.displayLid();
        this.displayTop();

        this.displayPollen();
    }
}