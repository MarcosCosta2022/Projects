import { CGFobject, CGFappearance } from "../../lib/CGF.js";
import { MyReceptacle } from "./MyReceptacle.js";
import { MyPetal } from "./MyPetal.js";
import { MyStem } from "./MyStem.js";
import { MyPollen } from '../objects/MyPollen.js';

/**
* MyFlower class, representing a flower
* @constructor
 * @param scene - reference to MyScene object
 * @param topRotAngle - top rotation angle of the flower
 * @param externalRadius - external radius of the flower (around the petals)
 * @param petalsNum - number of petals of the flower
 * @param petalsColor - color of the flower petals
 * @param petalsRotAngles - rotation angles of the petals
 * @param petalsUnionAngles - union angles of the petals
 * @param petalsTexture - texture of the flower petals
 * @param petalsTexCoords - texture coordinates of the flower petals
 * @param receptacleRadius - radius of the flower receptacle
 * @param receptacleColor - color of the flower receptacle
 * @param receptacleTexture - texture of the flower receptacle
 * @param receptacleTexCenter - center coordinates of circular texture of the flower receptacle
 * @param receptacleTexRadius - radius of circular texture of the flower receptacle
 * @param stemRadius - radius of the flower stem
 * @param stemColor - color of the flower stem
 * @param stemSize - number of stems of the flower
 * @param stemTexture - texture of the flower stem
 * @param leavesTexture - texture of the flower leaves
 * @param leavesTexCoords - texture coordinates of the flower leaves
 * 
*/

export class MyFlower extends CGFobject {
	constructor(scene, topRotAngle, externalRadius, petalsNum, petalsColor, petalsRotAngles, petalsUnionAngles, petalsTexture, petalsTexCoords, receptacleRadius, receptacleColor, receptacleTexture, receptacleTexCenter, receptacleTexRadius, stemRadius, stemColor, stemSize, stemTexture, leavesTexture, leavesTexCoords) {
		super(scene);

        this.topRotAngle = topRotAngle;
		
        this.externalRadius = externalRadius;

        this.petalsNum = petalsNum;
        this.petalsColor = petalsColor;
        this.petalsRotAngles = petalsRotAngles;
        this.petalsUnionAngles = petalsUnionAngles;
        this.petalsTexCoords = petalsTexCoords;

        this.petals = [];
        for (let i = 0; i < this.petalsNum; i++) {
            let petal = new MyPetal(this.scene, this.receptacleRadius, this.petalsRotAngles[i], this.petalsUnionAngles[i], this.petalsTexCoords);
            this.petals.push(petal);
        }

        this.innerPetals = [];
        for (let i = 0; i <= this.petalsNum; i++) {
            let petal = new MyPetal(this.scene, this.receptacleRadius, .6*this.petalsRotAngles[i], 1.2*this.petalsUnionAngles[i], this.petalsTexCoords);
            this.innerPetals.push(petal);
        }

        this.receptacleRadius = receptacleRadius;
        this.receptacleColor = receptacleColor;
        this.receptacleTexCenter = receptacleTexCenter;
        this.receptacleTexRadius = receptacleTexRadius;
        this.receptacle = new MyReceptacle(this.scene, receptacleRadius, receptacleTexCenter, receptacleTexRadius);

        this.stemRadius = stemRadius;
        this.stemColor = stemColor;

        // Generate an array of random stem sizes from 2 to 3
        this.stems = Array.from({ length: stemSize }, () => Math.random() + 2);

        // Calculate the translation of the stems in the z and y axis
        let angleDegree;
        if (Math.random() < 0.5) {
            angleDegree = Math.random() * 25 - 40; // Generate a random angle between -40 and -15 degrees
            if (topRotAngle > -30 * (Math.PI / 180) && topRotAngle < -20 * (Math.PI / 180)) {
                this.topRotAngle -= 30 * (Math.PI / 180);
            }
        } else {
            angleDegree = Math.random() * 25 + 15; // Generate a random angle between 15 and 40 degrees
        }
        let angle = angleDegree * Math.PI / 180;
        let decreaseDegree = - angleDegree / (this.stems.length - 1);
        let decrease = (decreaseDegree * Math.PI) / 180;
        let stemTrans_z = [];
        let stemTrans_y = [];
        for (let i = 0; i < this.stems.length; i++) {
            stemTrans_z.push(this.stems[i] * Math.sin(angle));
            stemTrans_y.push(-(0.03 + this.stems[i] - (this.stems[i]*Math.cos(angle))));
            angle = angle+decrease;
        }

        this.stemsObjects = [];
        this.leafStemObjects = [];
        let sumSizes = 0;
        let i = 0;
        angle = (angleDegree * Math.PI) / 180;

        for (i; i < this.stems.length; i++) {
            let stem = new MyStem(this.scene, this.stemRadius - (.01 * (this.stems.length-i)), this.stems[i]);
            stem.size = this.stems[i];
            stem.height = sumSizes;
            stem.angle = angle;
            angle = angle+decrease;
            
            // this.trans = soma das stemTrans restantes
            stem.trans_z = stemTrans_z.slice(i + 1).reduce((a, b) => a + b, 0);
            stem.trans_y = stemTrans_y.slice(i + 1).reduce((a, b) => a + b, 0);
            if (i == 0) {
                stem.finalTrans_z = stemTrans_z[0];
                stem.finalTrans_y = stemTrans_y[0]; 
            }
                            
            this.stemsObjects.push(stem);

            // If this is not the last stem, add a new leaf stem
            if ((i != 0)) {
                let leafStemSize = 2 + Math.random(); // Random size between 2 and 3
                let leafStemRadius = 0.07 + Math.random() * (0.1 - 0.07); // Random radius between 0.07 and 0.1 
                let leafStem = new MyStem(this.scene, leafStemRadius, leafStemSize);
                
                // Generate a random angle either between 30 and 50 degrees or between 290 and 320 degrees
                let angleDegrees;
                if (Math.random() < 0.5) {
                    angleDegrees = 30 + Math.random() * (50 - 30);
                } else {
                    angleDegrees = 290 + Math.random() * (320 - 290);
                }
                // Convert the angle to radians
                leafStem.rotationAngle = angleDegrees * (Math.PI / 180);

                leafStem.size = leafStemSize;
                leafStem.height = sumSizes;

                this.leafStemObjects.push(leafStem);
            }
            sumSizes += this.stems[i];
        }

        this.leavesTexCoords = leavesTexCoords;
        this.leaves = [];
        for (let i = 1; i < this.stems.length; i++) {
            // angle between 10 and 25 degrees to radians
            let rotAngle = 10 + Math.random() * 15;
            rotAngle = rotAngle * Math.PI / 180;
            // angle between 20 and 40 degrees to radians
            let unionAngle = 20 + Math.random() * 20;
            unionAngle = unionAngle * Math.PI / 180;
            let leaf = new MyPetal(this.scene, this.receptacleRadius, rotAngle, unionAngle, this.leavesTexCoords);
            let angleDegrees = -30 - Math.random() * 30; // Generate a random angle between -30 and -60 degrees
            leaf.rotationAngle = angleDegrees * (Math.PI / 180);
            leaf.scaleFactor = 0.5 + Math.random() * 0.5; // Generate a random scale between 0.5 and 1
            this.leaves.push(leaf);
        }

        // calculate random scales for YY for each hemisphere
        this.pollen = new MyPollen(this.scene, 10, 10);
        // random scale between 0.3 and 0.5
        this.pollen.scale = 0.1 + Math.random() * 0.15;
        // random rotation between 0 and 2PI
        this.pollen.rotation = Math.random() * 2 * Math.PI;

        this.receptacleMaterial = new CGFappearance(this.scene);
        this.receptacleMaterial.setAmbient(receptacleColor[0], receptacleColor[1], receptacleColor[2],1);
        this.receptacleMaterial.setDiffuse(receptacleColor[0], receptacleColor[1], receptacleColor[2], 1);
        this.receptacleMaterial.setSpecular(receptacleColor[0], receptacleColor[1], receptacleColor[2], 1);
        this.receptacleMaterial.setShininess(10.0);
        this.receptacleMaterial.setTexture(receptacleTexture);
        this.receptacleMaterial.setTextureWrap('REPEAT', 'REPEAT');

        // Generate a random angle between 0 and 30 degrees for the first petal
        this.firstAngle = Math.random() * (Math.PI / 6); // Math.PI / 6 is 30 degrees in radians

        this.petalsMaterial = new CGFappearance(this.scene);
        this.petalsMaterial.setAmbient(petalsColor[0], petalsColor[1], petalsColor[2], petalsColor[3]); 
        this.petalsMaterial.setDiffuse(petalsColor[0], petalsColor[1], petalsColor[2], petalsColor[3]);
        this.petalsMaterial.setSpecular(petalsColor[0], petalsColor[1], petalsColor[2], petalsColor[3]);
        this.petalsMaterial.setShininess(10.0);
        this.petalsMaterial.setTexture(petalsTexture);
        this.petalsMaterial.setTextureWrap('REPEAT', 'REPEAT');

        this.leavesMaterial = new CGFappearance(this.scene);
        this.leavesMaterial.setAmbient(stemColor[0], stemColor[1], stemColor[2], stemColor[3]);
        this.leavesMaterial.setDiffuse(stemColor[0], stemColor[1], stemColor[2], stemColor[3]);
        this.leavesMaterial.setSpecular(stemColor[0], stemColor[1], stemColor[2], stemColor[3]);
        this.leavesMaterial.setShininess(10.0);
        this.leavesMaterial.setTexture(leavesTexture);
        this.leavesMaterial.setTextureWrap('REPEAT', 'REPEAT');

        this.stemMaterial = new CGFappearance(this.scene);
        this.stemMaterial.setAmbient(stemColor[0], stemColor[1], stemColor[2], stemColor[3]);
        this.stemMaterial.setDiffuse(stemColor[0], stemColor[1], stemColor[2], stemColor[3]);
        this.stemMaterial.setSpecular(stemColor[0], stemColor[1], stemColor[2], stemColor[3]);
        this.stemMaterial.setShininess(10.0);
        this.stemMaterial.setTexture(stemTexture);
        this.stemMaterial.setTextureWrap('REPEAT', 'REPEAT');

        
        this.centerCoords = this.calculateCenterCoords();
		this.initBuffers();
	}

    getReceptacleInclination(){
        return this.topRotAngle;
    }

    calculateCenterCoords() {

        let sumSizes = this.stems.reduce((a, b) => a + b, 0);

        let x = 0;
        let y = this.stemsObjects[0].trans_y + this.stemsObjects[0].finalTrans_y + sumSizes;
        let z = this.stemsObjects[0].trans_z + this.stemsObjects[0].finalTrans_z;

        // Calculate the current total size of the flower
        const currentSize = 2 * this.receptacleRadius + 2 * (2.8 + 0.78 * this.receptacleRadius);

        // Calculate the scaling factor
        const scaleFactor = this.externalRadius / currentSize;

        x *= scaleFactor;
        y *= scaleFactor;
        z *= scaleFactor;

        // The final position of the center of the receptacle
        return { x, y, z };
    }

    removePollen(){
        if (!this.pollen) return;
        let temp = this.pollen;
        this.pollen = null;
        return temp;
    }
    

    updateCenterByTransl(x,y,z){
        this.centerCoords.x += x;
        this.centerCoords.y += y;
        this.centerCoords.z += z;
    }

    updateCenterByScale(x,y,z){
        this.centerCoords.x *= x;
        this.centerCoords.y *= y;
        this.centerCoords.z *= z;
    }

    display() {
        // Calculate the current total size of the flower
        const currentSize = 2 * this.receptacleRadius + 2 * (2.8 + 0.78 * this.receptacleRadius);

        // Calculate the scaling factor
        const scaleFactor = this.externalRadius / currentSize;

        // Apply the scaling factor to the flower
        this.scene.pushMatrix();
        this.scene.scale(scaleFactor, scaleFactor, scaleFactor);

        // Translate the flower up by the sum of the stem sizes
        let sumSizes = this.stems.reduce((a, b) => a + b, 0);
        this.scene.translate(0, sumSizes + this.receptacleRadius, 0);

        // Rotate the flower by topRotAngle
        this.scene.pushMatrix(); 
        this.scene.translate(0, -this.receptacleRadius, 0);
        this.scene.translate(0, this.stemsObjects[0].trans_y + this.stemsObjects[0].finalTrans_y, this.stemsObjects[0].trans_z + this.stemsObjects[0].finalTrans_z); // translate to the end of the stem
        this.scene.rotate(this.topRotAngle, 1, 0, 0);
        
        // Display the receptacle
        this.receptacleMaterial.apply();
        this.receptacle.display();

        // Display the pollen
        if (this.pollen){
            this.scene.pollenMaterial.apply();
            this.scene.pushMatrix();
            
            this.scene.rotate(this.pollen.rotation, 0, 0, 1);
            this.scene.translate(0, 0, 0.6 * this.receptacleRadius); // translate to the appex of the receptacle
            this.scene.scale(this.pollen.scale, this.pollen.scale, this.pollen.scale);
            this.scene.translate(0, 0, 0.9);
            this.pollen.display();
            this.scene.popMatrix();
        }

        // Display the petals
        this.petalsMaterial.apply();
        
        let baseVertex = 0.78 * this.receptacleRadius;

        for (let i = 0; i < this.petalsNum; i++) {
            this.scene.pushMatrix();
            let angle = this.firstAngle + ((2 * Math.PI) / this.petalsNum) * i;
            this.scene.rotate(angle, 0, 0, 1);
            this.scene.translate(baseVertex, 0, 0);
            this.petals[i].display();
            this.scene.popMatrix();
        }

        // Display the inner petals
        for (let i = 0; i <= this.petalsNum; i++) {
            this.scene.pushMatrix();
            let angle = ((2 * Math.PI) / this.petalsNum) * i;
            this.scene.scale(0.65, 0.65, 0.65);
            this.scene.rotate(angle, 0, 0, 1);
            this.scene.translate(baseVertex, 0, 0.2);
            this.innerPetals[i].display();
            this.scene.popMatrix();
        }

        this.scene.popMatrix();

        // Display the stem

        this.stemMaterial.apply();

        for (let i = 0; i < this.stemsObjects.length; i++) {
            this.scene.pushMatrix(); 
            this.scene.translate(0, - this.stemsObjects[i].height - this.stemsObjects[i].size - this.receptacleRadius, 0);
            this.scene.translate(0, this.stemsObjects[i].trans_y, this.stemsObjects[i].trans_z);
            this.scene.rotate(this.stemsObjects[i].angle, 1, 0, 0);
            this.stemsObjects[i].display();
            this.scene.popMatrix();
        }

        // Display the leaf stems
        for (let i = 0; i < this.leafStemObjects.length; i++) {
            this.scene.pushMatrix();
            this.scene.translate(0, - this.leafStemObjects[i].height - this.receptacleRadius, 0);
            this.scene.translate(0, this.stemsObjects[i].trans_y, this.stemsObjects[i].trans_z);
            this.scene.rotate(this.leafStemObjects[i].rotationAngle, 0, 0, 1);
            this.leafStemObjects[i].display();
            this.scene.popMatrix();
        }

        this.leavesMaterial.apply();

        // Display the leaves
        for (let i = 0; i < this.leaves.length; i++) {
            this.scene.pushMatrix();
            
            //translate to the end of the stem
            this.scene.translate(0, -this.leafStemObjects[i].height - this.receptacleRadius, 0);
            this.scene.translate(0, this.stemsObjects[i].trans_y, this.stemsObjects[i].trans_z);
            if (this.leafStemObjects[i].rotationAngle < Math.PI) {
                this.scene.scale(-1, 1, 1);
                this.scene.translate(Math.sin(this.leafStemObjects[i].rotationAngle)*this.leafStemObjects[i].size, Math.cos(this.leafStemObjects[i].rotationAngle)*this.leafStemObjects[i].size, 0);
            }
            else {
                this.scene.translate(-Math.sin(this.leafStemObjects[i].rotationAngle)*this.leafStemObjects[i].size, Math.cos(this.leafStemObjects[i].rotationAngle)*this.leafStemObjects[i].size, 0);
            }
            this.scene.rotate(this.leaves[i].rotationAngle, 1, 0, 0);
            this.scene.scale(this.leaves[i].scaleFactor, this.leaves[i].scaleFactor, this.leaves[i].scaleFactor);
            this.leaves[i].display();
            this.scene.popMatrix();
        }

        this.scene.popMatrix();
    }
		
}


