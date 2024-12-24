import {CGFobject, CGFappearance, CGFtexture} from '../../lib/CGF.js';
import {MySphere} from '../geometric/MySphere.js';
import { MyElipsoide } from '../geometric/MyElipsoide.js';
import { MyCylinder } from '../geometric/MyCylinder.js';
import { MyParallelpiped } from '../geometric/MyParallelpiped.js';
import { MyHindWing } from './MyHindWing.js';
import { MyForewing } from './MyForewing.js';
import { MyPollen } from '../objects/MyPollen.js';

/**
* MyBee class, representing a bee
*
* @constructor
* @param scene - reference to MyScene object
* @param x - x position of the bee
* @param y - y position of the bee
* @param z - z position of the bee
* @param ori - orientation of the bee - angle from the yy axis
* @param vel - velocity vector of the bee
*/

export class MyBee extends CGFobject {
	constructor(scene, x=0, y=0, z=0, ori=0, vel=[0,0,0]){
        super(scene);

        this.x = x;
        this.y = y;
        this.z = z;
        this.ori = ori;
        this.vel = vel;

        // ============== temporary ==============
        this.sphereForLimitBox = new MySphere(this.scene, 16, 8);
        this.sphreMaterial = new CGFappearance(this.scene);
        // red
        this.sphreMaterial.setAmbient(1, 0, 0, 1);
        this.sphreMaterial.setDiffuse(1, 0, 0, 1);
        this.sphreMaterial.setSpecular(1, 0, 0, 1);
        this.initBuffers();
        // ============== temporary ==============

        this.torax = new MyElipsoide(this.scene, 16, 8, 1.2, 1.2,1.1);
        this.head = new MyElipsoide(this.scene, 16, 8, 0.6,1,0.7);
        this.eye = new MyElipsoide(this.scene, 16, 8, 0.3,0.55,0.3);
        this.abdomen = new MyElipsoide(this.scene, 16, 8, 0.9,2,1);
        this.hindWing = new MyHindWing(this.scene);
        this.foreWing = new MyForewing(this.scene);
        this.cylinder = new MyCylinder(this.scene, 15,1, 1, 1);
        this.sphere = new MySphere(this.scene, 16, 8);

        this.toraxTexture = new CGFtexture(this.scene, 'textures/bee/torax.jpg');
        this.abdomenTexture = new CGFtexture(this.scene, 'textures/bee/abdomen.jpg');
        this.headTexture = new CGFtexture(this.scene, 'textures/bee/head.png');
        this.wingsTexture = new CGFtexture(this.scene, 'textures/bee/wings.jpg');
        this.legTexture = new CGFtexture(this.scene, 'textures/bee/leg.png');

        this.toraxApperance = new CGFappearance(this.scene);
        this.toraxApperance.setAmbient(0.1, 0.1, 0.1, 1);
        this.toraxApperance.setDiffuse(0.6, 0.6, 0.6, 1);
        this.toraxApperance.setSpecular(0.2,0.2,0.2, 1);
        this.toraxApperance.setTexture(this.toraxTexture);
        this.toraxApperance.setTextureWrap('REPEAT', 'REPEAT');
        
        this.headApperance = new CGFappearance(this.scene);
        this.headApperance.setAmbient(0.1, 0.1, 0.1, 1);
        this.headApperance.setDiffuse(0.6, 0.6, 0.6, 1);
        this.headApperance.setSpecular(0.2,0.2,0.2, 1);
        this.headApperance.setTexture(this.headTexture);
        this.headApperance.setTextureWrap('REPEAT', 'REPEAT');

        this.eyeApperance = new CGFappearance(this.scene);
        // black with white reflection
        this.eyeApperance.setAmbient(0, 0, 0, 1);
        this.eyeApperance.setDiffuse(0, 0, 0, 1);
        this.eyeApperance.setSpecular(1,1,1, 1);

        this.abdomenApperance = new CGFappearance(this.scene);
        this.abdomenApperance.setAmbient(0.2, 0.2, 0.2, 1);
        this.abdomenApperance.setDiffuse(0.6, 0.6, 0.6, 1);
        this.abdomenApperance.setSpecular(0.2,0.2,0.2, 1);
        this.abdomenApperance.setTexture(this.abdomenTexture);
        this.abdomenApperance.setTextureWrap('REPEAT', 'REPEAT');

        this.antennaApperance = this.headApperance;

        this.legApperance = new CGFappearance(this.scene);
        this.legApperance.setAmbient(0.1, 0.1, 0.1, 1);
        this.legApperance.setDiffuse(0.6, 0.6, 0.6, 1);
        this.legApperance.setSpecular(0.2,0.2,0.2, 1);
        this.legApperance.setTexture(this.legTexture);
        this.legApperance.setTextureWrap('REPEAT', 'REPEAT');

        this.wingsApperance = new CGFappearance(this.scene);
        // make them semi transparent
        this.wingsApperance.setTexture(this.wingsTexture);
        this.wingsApperance.setTextureWrap('REPEAT', 'REPEAT');
        this.wingsApperance.setAmbient(0.6, 0.6, 0.6, 0.1);
        this.wingsApperance.setDiffuse(0.6, 0.6, 0.6, 0.1);
        this.wingsApperance.setEmission(0.2,0.2,0.2, 0);
        this.wingsApperance.setSpecular(0.6, 0.6, 0.6, 0.1);
        this.wingsApperance.setShininess(0);

        // animation variables

        // spread angle must be between Math.PI/8 and Math.Pi/2, where 0 is the wings closed and Math.Pi/2 is the wings fully open
        this.spreadAngle = Math.PI/2;
        // wing angle must be between Math.Pi/6 and Math.Pi*3/8, where -Math.Pi/6 is the wings up and Math.Pi/6 is the wings down
        this.wingAngle = Math.PI/6;
        this.oscillationTime = 0; // To track the oscillation time
        this.dy = 0;
        
        this.isInFlight = true;
        this.northScale = Math.random() + 0.5;
        this.southScale = Math.random() + 0.5;
        this.pollen = null;
        this.inFlower = null;

        this.inAnimation = false;
        this.destination = null;
        this.reachedDestination = false;

        this.maxSpeed = 15; // Maximum speed
        this.minSpeed = 10; // Minimum speed to approach smoothly
        this.rotationSpeed = Math.PI/4; // Speed of rotation in radians per second
        this.acceleration = 20; // Acceleration per second
        this.decelerationDistance = 12; // Distance from target to start decelerating

        this.initialHeight = y;
        this.minHeight = 2;
        this.hiveHeight =this.scene.hiveLocation[1];
        this.inDescent = false;
        this.inAscension = false;
        this.descentSpeed = 0.25;
        this.ascentSpeed = 0.2;
    }

    canReturn(){
        return this.isInFlight && this.pollen != null;
    }

    update(t, dt) {
        const dts = dt / 1000;
    
        if (this.isInFlight) {
            if (this.inAnimation && this.destination) {
                const maxSpeed = this.maxSpeed;
                const acceleration = this.acceleration;
    
                const dx = this.destination[0] - this.x;
                const dy = this.destination[1] - this.y;
                const dz = this.destination[2] - this.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                const xzDistance = Math.sqrt(dx**2 + dz**2);
                const xzSpeed = Math.sqrt(this.vel[0]**2 + this.vel[2]**2);
    
                if (this.y + this.dy <= this.hiveHeight -1){
                    // If we're very close to the target, stop the bee
                    this.inAnimation = false;
                    this.reachedDestination = true;
                    // start ascendin
                    console.log("reached destination");
                    this.startAscent();
                } else {
                    // Update the orientation smoothly
                    const desiredOri = -Math.atan2(dz, dx);

                    let deltaOri = desiredOri - this.ori;
                    if (deltaOri > Math.PI) {
                        deltaOri -= 2 * Math.PI;
                    } else if (deltaOri < -Math.PI) {
                        deltaOri += 2 * Math.PI;
                    }
    
                    if (Math.abs(deltaOri) < this.rotationSpeed * dts) {
                        // If the angle difference is small enough, just set the orientation to the desired value
                        this.ori = desiredOri;
                    } else {
                        // Otherwise, rotate towards the desired orientation
                        this.ori += Math.sign(deltaOri) * this.rotationSpeed * dts;
                    }
    
                    // make the bee move in the direction of the target at a fixed speed
                    // Calculate the direction of the velocity vector
            
                    const direction = [dx/distance, dy/distance, dz/distance];
                    
                    // Calculate the new speed
                    this.vel = [direction[0] * maxSpeed, direction[1] * maxSpeed, direction[2] * maxSpeed];

                    // calculate the desired height
                    console.log(xzDistance)
                    if (xzDistance < this.decelerationDistance){
                        this.y -= this.descentSpeed;
                    }
                }
            }

            // calculate deslocation based on velocity and height (move normally when in the heighest height, but move less as we get closer to the ground)

            // get distance to the ground
            const distanceToGround = this.y - this.minHeight;
            // get a factor between 0 and 1 based on the distance to the ground
            const factor = distanceToGround / (this.initialHeight - this.minHeight);

            const factorSquared = factor ** 2;
            // Calculate position of the bee
            if (this.vel) {
                this.x += this.vel[0] * dts * factorSquared;
                this.z += this.vel[2] * dts * factorSquared;
            }

            if (this.inDescent){
                this.y -= this.descentSpeed;
            }

            if (this.inAscension){
                this.y +=  this.ascentSpeed;
            }

            if(this.y >= this.initialHeight){
                this.y = this.initialHeight;
                this.inAscension = false;
            }

            if(this.y <= this.minHeight){
                this.y = this.minHeight;
                this.inDescent = false;
            }

            if(this.inDescent){
                // check if the bee is close to a flower
                var flower = this.scene.getClosestFlower();
                if(flower){
                    this.landInFlower(flower);
                }
            }

            if(!this.inAscension && !this.inDescent){
                // Calculate dy such that the bee moves up and down in a period of 1 second
                const amplitude = 1;
                this.oscillationTime += dts; // Increment oscillation time by delta time
                this.dy = amplitude * Math.sin(2 * Math.PI * this.oscillationTime);
            }
    
            this.wingAngle = Math.PI / 6 + Math.PI / 12 * Math.sin(t / 15);
        }
    }

    dropPollen(){
        const temp = this.pollen;
        this.pollen = null;
        return temp;
    }

    deliverPollen(){
        if (!this.inFlower && this.isInFlight && this.pollen && !this.inAscension && !this.inDescent){
            this.inAnimation = true;
            this.destination = [this.scene.hiveLocation[0], this.initialHeight, this.scene.hiveLocation[2]];
            this.reachedDestination = false;
        }
    }

    travelTo(x,y,z){
        // check if we are already in the destination
        if (this.x == x && this.y == y && this.z == z){
            return;
        }

        console.log("traveling to", x,y,z);

        this.inAnimation = true;
        this.destination = [x,y,z];
        this.reachedDestination = false;
    }

    reached(){
        return this.reachedDestination;
    }

    grabPollen(pollen){
        this.pollen = pollen;
    }

    stopAnimation(){
        if (this.inAnimation){
            this.inAnimation = false;
            this.destination = null;
            // stop moving in the y direction (up and down)
            this.vel[1] = 0;
        }
    }

    turn(v){
        if (this.isInFlight){
            this.stopAnimation();
            this.ori += v;
            // change the orientation of the velocity vector
            const x = this.vel[0];
            const z = this.vel[2];

            const xzVel = Math.sqrt(x**2 + z**2);

            // calculate the vel vector in the new orientation

            this.vel[0] = xzVel * Math.cos(-this.ori);
            this.vel[2] = xzVel * Math.sin(-this.ori);
        }
    }

    accelerate(v){
        if (this.isInFlight){   
            this.stopAnimation();

            // Calculate the current speed
            const speed = Math.sqrt(this.vel[0]**2 + this.vel[1]**2 + this.vel[2]**2);
        
            // Calculate the new speed
            let newSpeed = speed + v;

            if (newSpeed < 0 ){
                newSpeed = 0;
            }
        
            // Calculate the direction of the velocity vector
            
            let direction = [Math.cos(-this.ori), 0, Math.sin(-this.ori)];
        
            // Update the velocity vector
            this.vel[0] = direction[0] * newSpeed;
            this.vel[1] = direction[1] * newSpeed;
            this.vel[2] = direction[2] * newSpeed;
        }

    }

    landInFlower(flower){
        this.isInFlight = false;
        this.inFlower = flower;
        this.inDescent = false;
        this.inAscension = false;
    }

    startDescent(){
        this.stopAnimation();
        this.inDescent = true;
        this.inAscension = false;
    }

    startAscent(){
        this.stopAnimation();
        this.inAscension = true;
        this.inDescent = false;

        this.pickUpPollen();

        if (this.inFlower){
            this.inFlower = null;
            this.isInFlight = true;
        }

    }

    pickUpPollen(){
        if(this.inFlower && this.pollen == null){
            this.pollen = this.inFlower.pollen;
            this.inFlower.pollen = null;
        }
    }

    reset(x=0,y=0,z=0,ori=0,vel=[0,0,0]){
        if (this.inAnimation){
            this.inAnimation = false;
            this.destination = null;
            // stop moving in the y direction (up and down)
        }
        this.x = x;
        this.y = y;
        this.z = z;
        this.ori = ori;
        this.vel = vel;
    }


    displayAntenna(angle){
        const middlePartHHeight = 0.5;
        const middlePartWidth = 0.03;
        const pointPartWidth = 0.03;
        const pointPartHeight = 0.3;

        this.scene.pushMatrix(); // 1

        this.scene.scale(middlePartWidth, middlePartHHeight,middlePartWidth);
        this.cylinder.display();

        this.scene.popMatrix(); // -1

        this.scene.pushMatrix(); // 2
        this.scene.translate(-middlePartWidth*(1-Math.cos(angle)), middlePartHHeight-Math.sin(angle)*middlePartWidth, 0);
        this.scene.rotate(-angle, 0,0,1);
        this.scene.pushMatrix(); // 3
        this.scene.scale(pointPartWidth, pointPartHeight, pointPartWidth);
        this.cylinder.display();
        this.scene.popMatrix(); // -3
        
        this.scene.translate(0,pointPartHeight,0);
        this.scene.scale(0.035,0.035,0.035);
        this.sphere.display();

        this.scene.popMatrix(); // -2
    }

    displayLimitBox(){
        this.sphreMaterial.apply();

        let translations = [
            [0,0,0],
            [0,3,0],
            [0,0,3],
            [0,3,3],
            [2,0,0],
            [2,3,0],
            [2,0,3],
            [2,3,3]
        ];
        this.scene.pushMatrix();
        // translate to the origin 
        this.scene.translate(-1.2,0,-1.5);

        for (let i = 0; i < 8; i++){
            this.scene.pushMatrix();
            this.scene.translate(...translations[i]);
            this.scene.scale(0.05, 0.05, 0.05);
            this.sphereForLimitBox.display();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();
    }


    displayHead(){
        
        this.scene.pushMatrix(); // 1
        this.headApperance.apply();
        this.head.display();

        this.scene.translate(0.1,0,0.5);
        this.eyeApperance.apply();
        this.eye.display();

        this.scene.translate(0,0,-1);
        this.eye.display();
        this.scene.popMatrix(); // -1

        const rightAntennaJuntionAngle = Math.PI/8;
        const leftAntennaJuntionAngle = 0;

        this.antennaApperance.apply();

        this.scene.pushMatrix(); // 2
        this.scene.translate(0.5,0.3,-0.2);
        this.scene.rotate(Math.PI/10, 0,1,0);
        this.scene.rotate(-Math.PI/2+ rightAntennaJuntionAngle,0,0,1);
        this.displayAntenna(Math.PI/9);
        this.scene.popMatrix(); // -2

        this.scene.pushMatrix(); // 2
        this.scene.translate(0.5,0.3,0.2);
        this.scene.rotate(-Math.PI/10, 0,1,0);
        this.scene.rotate(-Math.PI/2+ leftAntennaJuntionAngle,0,0,1);
        this.displayAntenna(Math.PI/9);
        this.scene.popMatrix(); // -2


    }

    displayWings(){
        // if we are looking at a bee from above with the bees face looking up then we have right wings and left wings 

        this.wingsApperance.apply();


        const hindWingsScale = 2;
        // left hind wing 
        this.scene.pushMatrix();
        this.scene.translate(0,-0.05,0.8);
        if (!this.isInFlight){
            this.scene.rotate(-Math.PI/16, 0,0,1);
            this.scene.rotate(-Math.PI*5/2, 0,1,0);
        }else{
            this.scene.rotate(-this.wingAngle, 1,0,0);
            this.scene.rotate(-Math.PI/16, 0,1,0);
        }
        this.scene.scale(hindWingsScale, hindWingsScale, hindWingsScale);
        this.hindWing.display();
        this.scene.popMatrix();

        // left forewing
        this.scene.pushMatrix();
        this.scene.translate(0,0,0.8);
        if (!this.isInFlight){
            this.scene.rotate(-Math.PI/16, 0,0,1);
            this.scene.rotate(-Math.PI*5/8, 0,1,0);
        }else{
            this.scene.rotate(-this.wingAngle, 1,0,0);
            this.scene.rotate(Math.PI/16 - Math.PI/4, 0,1,0);
        }
        this.scene.scale(hindWingsScale, hindWingsScale, hindWingsScale);
        this.foreWing.display();
        this.scene.popMatrix();

        // right hind wing 
        this.scene.pushMatrix();
        this.scene.translate(0,-0.05,-0.8);
        if (!this.isInFlight){
            this.scene.rotate(-Math.PI/16, 0,0,1);
            this.scene.rotate(Math.PI*5/2, 0,1,0);
        }else{
            this.scene.rotate(this.wingAngle, 1,0,0);
            this.scene.rotate(Math.PI/16, 0,1,0);
        }
        this.scene.scale(hindWingsScale, hindWingsScale, -hindWingsScale);
        this.hindWing.display();
        this.scene.popMatrix();

        // right forewing
        this.scene.pushMatrix();
        this.scene.translate(0,0,-0.8);
        if (!this.isInFlight){
            this.scene.rotate(-Math.PI/16, 0,0,1);
            this.scene.rotate(Math.PI*5/8, 0,1,0);
        }else{
            this.scene.rotate(this.wingAngle, 1,0,0);
            this.scene.rotate(-Math.PI/16 + Math.PI/4, 0,1,0);
        }
        this.scene.scale(hindWingsScale, hindWingsScale, -hindWingsScale);
        this.foreWing.display();
        this.scene.popMatrix();

    }

    displayLeg(mes1,mes2,mes3,angle1, angle2, angle3){
        this.scene.pushMatrix(); // 1
        
        this.scene.rotate(angle1, 0,0,1);
        this.scene.translate(0,-mes1[1],0);

        this.scene.pushMatrix(); // 2
        this.scene.scale(...mes1);
        this.sphere.display();
        this.scene.popMatrix(); // -2
        this.scene.pushMatrix(); // 2
        this.scene.translate(0,-mes1[1],0);
        this.scene.scale(0.07,0.07,0.07); // joint
        this.sphere.display();
        this.scene.popMatrix(); // -2

        this.scene.pushMatrix(); // 2
        this.scene.translate(0,-mes1[1],0);
        this.scene.rotate(angle2, 0,0,1);
        this.scene.translate(0,-mes2[1],0);
        this.scene.pushMatrix(); // 3
        this.scene.scale(...mes2);
        this.sphere.display();
        this.scene.popMatrix(); // -3

        this.scene.pushMatrix(); // 3
        this.scene.translate(0,-mes2[1],0);
        this.scene.scale(0.07,0.07,0.07); // joint
        this.sphere.display();
        this.scene.popMatrix(); // -3

        this.scene.translate(0,-mes2[1],0);
        this.scene.rotate(angle3, 0,0,1);
        this.scene.translate(0,-mes3[1],0);
        this.scene.pushMatrix(); // 3
        this.scene.scale(...mes3);
        this.sphere.display();
        this.scene.popMatrix(); // -3
        this.scene.popMatrix(); // -2

        this.scene.popMatrix(); // -1
    }

    displayLegs(){
        this.legApperance.apply();

        let inc = Math.PI/8;
        if (!this.isInFlight){
            inc = Math.PI/16;
        }
        // calculate subtle rotation based on speed of the bee
        // angle must go from 0 to Math.PI/8

        const x = this.vel[0];
        const z = this.vel[2];
        // get distance to the ground
        const distanceToGround = this.y - this.minHeight;
        // get a factor between 0 and 1 based on the distance to the ground
        const factor = distanceToGround / (this.initialHeight - this.minHeight);
        const xzVel = Math.sqrt(x**2 + z**2) * factor*factor;
        let movAngle = xzVel/(xzVel +10) * Math.PI*7/16;

        for (let i = 1; i >=-1; i-=2){
            // back leg
            this.scene.pushMatrix(); // 1 
            this.scene.translate(-0.6,-0.4,0.6*i);
            this.scene.rotate(-movAngle,0,0,1);
            this.scene.rotate(i*Math.PI/4, 0,1,0);
            if(this.pollen != null && i == 1){
                this.scene.pushMatrix();
                // put it in one of the back legs
                this.scene.translate(-1,-0.5,0);
                this.scene.scale(0.5,0.9,0.5);
                this.scene.pollenMaterial.apply();
                this.pollen.display();
                this.scene.popMatrix();
                this.legApperance.apply();
            }
            this.displayLeg([0.25,0.4,0.25],[0.25,0.6,0.25], [0.15,0.4,0.15],-Math.PI/2+inc, Math.PI/4+inc,-Math.PI/20+inc);
            this.scene.popMatrix(); // -1

            // middle leg
            this.scene.pushMatrix();
            this.scene.translate(-0.3,-0.5,0.8*i);
            this.scene.rotate(-movAngle,0,0,1);
            this.scene.rotate(i*Math.PI/2, 0,1,0);
            this.displayLeg([0.25,0.3,0.25],[0.15,0.3,0.15], [0.15,0.5,0.15],-Math.PI/2+inc, Math.PI*5/16+inc,Math.PI/20+inc);
            this.scene.popMatrix();

            // front leg
            this.scene.pushMatrix();
            this.scene.translate(0.6,-0.7,i*0.6);
            this.scene.rotate(Math.PI*3/16-inc-movAngle,0,0,1);
            this.scene.rotate(i*Math.PI/2,0,1,0);
            this.displayLeg([0.15,0.3,0.15],[0.15,0.5,0.15], [0.12,0.3,0.12],-Math.PI/2+inc, Math.PI*3/8+inc,Math.PI/20+inc);
            this.scene.popMatrix();
        }
        

    }

    display(){
        // box display the size limit of the bee
        //this.displayLimitBox();
        
        this.scene.pushMatrix(); // 1

        this.scene.translate(this.x,this.y + this.dy,this.z);

        if (this.inFlower){
            let inclination = this.inFlower.getReceptacleInclination();
            this.scene.rotate(-inclination, 1,0,1);
        }

        this.scene.rotate(this.ori, 0,1,0);

        this.scene.scale(0.3,0.3,0.3);

        this.headApperance.apply();

        this.scene.pushMatrix(); // 1

        this.scene.translate(1.4,-0.3,0);
        this.scene.rotate(Math.PI/12, 0,0,1);
        this.displayHead();

        this.scene.popMatrix(); // -1
        

        this.toraxApperance.apply();
        this.scene.pushMatrix(); // 1
        this.scene.rotate(Math.PI, 1,0,0);
        this.scene.rotate(Math.PI/2,0,0,1);
        this.torax.display();
        this.scene.popMatrix(); // -1

        // abdomen
        this.abdomenApperance.apply();
        this.scene.pushMatrix(); // 2
        this.scene.translate(-2.3,-0.3,0);
        this.scene.rotate(Math.PI*11/16, 0,0,1);
        this.abdomen.display();
        this.scene.popMatrix(); // -2

        this.displayLegs();

        this.scene.pushMatrix(); // 3
        this.scene.translate(0.3,0.8,0);
        this.displayWings();
        this.scene.popMatrix(); // -3
        
        this.scene.popMatrix(); // -1
    }
		
}


