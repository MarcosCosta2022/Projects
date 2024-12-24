import { CGFscene, CGFcamera, CGFaxis, CGFappearance, CGFshader, CGFtexture } from "../lib/CGF.js";
import { MyPlane } from "./geometric/MyPlane.js";
import { MySphere } from "./geometric/MySphere.js";
import { MyPanorama} from "./objects/MyPanorama.js";
import { MyRock } from "./objects/MyRock.js";
import { MyRockSet } from "./objects/MyRockSet.js";
import { MyBee } from "./bee/MyBee.js";
import { MyRockLayout } from "./objects/MyRockLayout.js";
import { MyGarden } from "./garden/MyGarden.js";
import { MyHive } from "./objects/MyHive.js";
import { MyGrass } from "./objects/MyGrass.js";
import { MyPollen } from "./objects/MyPollen.js";

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

        // set update period to 60fps
        this.fps = 60;
        const updatePeriod = 1000 / this.fps;
        this.setUpdatePeriod(updatePeriod);
        this.time=0;
        this.hiveAltitude = 18;

        this.setGlobalAmbientLight(1,1,1, 1.0);

        this.returnCoords = [0,33,0];
        this.returning = false;

        this.hiveLocation = [50-4, this.hiveAltitude + 8, 29];

        //Background color
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        //Initialize scene objects
        
        this.axis = new CGFaxis(this);
        
        this.plane = new MyPlane(this, 30, 0, 5, 0, 5);
        this.mySphere = new MySphere(this, 50,25);

        this.rockAppearance = new CGFappearance(this);
        this.rockAppearance.setAmbient(0.1, 0.1, 0.1, 1);
        this.rockAppearance.setDiffuse(0.6, 0.6, 0.6, 1);
        this.rockAppearance.setSpecular(0.2,0.2,0.2, 1);
        this.rockAppearance.loadTexture('textures/rock4.jpg');
        this.rockAppearance.setTextureWrap('REPEAT', 'REPEAT');
        
        this.myRockSet = new MyRockSet(this, 3, this.rockAppearance, true);
        // comment this line for faster startup
        //this.myRockLayout = new MyRockLayout(this, 20, 10, 3, this.rockAppearance);

        this.myRockSets = [];
        for (let i = 0; i < 2; i++){
            const rockSet = new MyRockSet(this, 2, this.rockAppearance);
            this.myRockSets.push(rockSet);
        }
        this.myRocks = [];
        for (let i = 0 ; i < 5 ; i++){
            const rock = new MyRock(this, 10, 5);
            this.myRocks.push(rock);
        }
        
        this.myBee = new MyBee(this,0,35,0,0,[0,0,0]);

        this.hive = new MyHive(this);


        this.startTime = Date.now();
        
        this.shader = new CGFshader(this.gl, "shaders/grass.vert", "shaders/grass.frag");

        let positions = [];
        for (let x = -25; x < 25; x++) {
            for (let z = -25; z < 25; z++) {
                let offsetX = Math.random(); // Uniformly distributed number between 0 and 1
                let offsetZ = Math.random(); // Uniformly distributed number between 0 and 1

                // make up for the offset if the grass is out of bounds
                if (x + offsetX > 24.6 ) {
                    offsetX -= 0.3;
                }
                if (z + offsetZ > 24.6) {
                    offsetZ -= 0.3;
                }
                if (x + offsetX < -24.6) {
                    offsetX += 0.3;
                }
                if (z + offsetZ < -24.6) {
                    offsetZ += 0.3;
                }

                positions.push({ x: x + offsetX, z: z + offsetZ });
            }
        }
        

        // create a 50x50 grass field - 2500 grass objects
        this.grassField = new Array(2500);
        for (let i = 0; i < 2500; i++){
            let grass = new MyGrass(this);
            grass.x_grass_scale = Math.random() * 2 + 2; // random number between 2 and 4
            grass.y_grass_scale = Math.random() * 2 + 2; // random number between 2 and 4
            grass.z_grass_scale = Math.random() * 3 + 1; // random number between 1 and 4
            grass.x_trans = positions[i].x;
            grass.z_trans = positions[i].z;

            // random angle between 0 and 30 or 0 and -30
            grass.rotation_angle = ((Math.random() * 60 - 30) * Math.PI) / 180;

            this.grassField[i] = grass;
        }

        this.grassTexture = new CGFtexture(this, "textures/grassLeaf.jpg");
        this.grassMaterial = new CGFappearance(this);
        this.grassMaterial.setAmbient(0.1, 0.1, 0.1, 1);
        this.grassMaterial.setDiffuse(0.6, 0.6, 0.6, 1);
        this.grassMaterial.setSpecular(0.2,0.2,0.2, 1);
        this.grassMaterial.setTexture(this.grassTexture);
        this.grassMaterial.setTextureWrap('REPEAT', 'REPEAT');
        
        this.panoramaTexture = new CGFtexture(this, "images/panorama2.jpg");
        this.panorama = new MyPanorama(this, this.panoramaTexture);

        this.gardenM = 8;
        this.gardenN = 8;
        this.garden = new MyGarden(this, this.gardenM, this.gardenN);
        this.garden.updateFlowersByScaling(2,2,2);

        //Objects connected to MyInterface
        this.displayAxis = true;
        this.scaleFactor = 1;
        this.displayGlobe = false;
        this.displayPanorama = false;
        this.displayPlane = false;
        this.displayRock = false;
        this.displayRockLayout = false;
        this.displayNormals = false;
        this.displayRockSet = false;
        this.displayBee = false;
        this.speedFactor = 1;
        this.displayGarden = false;
        this.displayHive = false;
        this.displayGrass = false;
        this.completeScene = true;
        this.followBee = false;

        this.enableTextures(true);

        this.terrain = new CGFtexture(this, "images/terrain.jpg");
        this.relvaTexture = new CGFtexture(this, "textures/relva4.jpg");
        this.earthTexture = new CGFtexture(this, "textures/earth4.jpg");

        this.grassAppearance = new CGFappearance(this);
        this.grassAppearance.setAmbient(0.5, 0.5, 0.5, 1);
        this.grassAppearance.setDiffuse(0.5, 0.5, 0.5, 1); 
        this.grassAppearance.setSpecular(0, 0, 0, 0);
        this.grassAppearance.setShininess(0);
        this.grassAppearance.setTexture(this.relvaTexture);
        this.grassAppearance.setTextureWrap("REPEAT", "REPEAT");

        this.terrainMaterial = new CGFappearance(this);
        this.terrainMaterial.setAmbient(0.3, 0.3, 0.3, 1);
        this.terrainMaterial.setDiffuse(0.5, 0.5, 0.5, 1);
        this.terrainMaterial.setSpecular(0.5, 0.5, 0.5, 1);
        this.terrainMaterial.setTexture(this.terrain);
        this.terrainMaterial.setTextureWrap('REPEAT', 'REPEAT');

        this.earthMaterial = new CGFappearance(this);
        this.earthMaterial.setAmbient(0.3, 0.3, 0.3, 1);
        this.earthMaterial.setDiffuse(0.5, 0.5, 0.5, 1);
        this.earthMaterial.setSpecular(0.5, 0.5, 0.5, 1);
        this.earthMaterial.setTexture(this.earthTexture);
        this.earthMaterial.setTextureWrap('REPEAT', 'REPEAT');
        
        let pollenTexture = new CGFtexture(this, "textures/pollen.jpg");
        this.pollenMaterial = new CGFappearance(this);
        this.pollenMaterial.setAmbient(0.3, 0.3, 0.3, 1);
        this.pollenMaterial.setDiffuse(0.5, 0.5, 0.5, 1);
        this.pollenMaterial.setSpecular(0.5, 0.5, 0.5, 1);
        this.pollenMaterial.setTexture(pollenTexture);
        this.pollenMaterial.setTextureWrap('REPEAT', 'REPEAT');

        
        // activate alpha blending
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)
        this.gl.enable(this.gl.BLEND)
    }

    updateGarden(){
        this.garden = new MyGarden(this, this.gardenM, this.gardenN);
    }

    checkKeys() {

        var text="Keys pressed: ";
        var keysPressed=false;
        // Check for key codes e.g. in https://keycode.info/
        if (this.gui.isKeyPressed("KeyW")) {
            text+=" W ";
            keysPressed=true;

            // accelerate the bee
            this.myBee.accelerate(0.1*this.speedFactor);
        }
        if (this.gui.isKeyPressed("KeyS")){
            text+=" S ";
            keysPressed=true;

            // decelerate the bee
            this.myBee.accelerate(-0.3*this.speedFactor);
        }
        if (this.gui.isKeyPressed("KeyA")){
            text+=" A ";
            keysPressed=true;

            // turn left
            this.myBee.turn(Math.PI/30*this.speedFactor);
        }
        if (this.gui.isKeyPressed("KeyD")){
            text+=" D ";
            keysPressed=true;

            // turn right
            this.myBee.turn(-Math.PI/180*this.speedFactor);
        }
        if (this.gui.isKeyPressed("KeyR")){
            text+=" R ";
            keysPressed=true;

            // reset bee position
            this.myBee.reset(0,35,0);
        }
        if(this.gui.isKeyPressed("KeyF")){
            text+=" F ";
            keysPressed=true;

            // toggle bee's movement
            this.myBee.startDescent();
        }
        if (this.gui.isKeyPressed("KeyP")){
            text+=" P ";
            keysPressed=true;

            // toggle bee's movement
            this.myBee.startAscent();
        }
        if (this.gui.isKeyPressed("KeyO")){
            text+=" O ";
            keysPressed=true;

            this.myBee.deliverPollen();
        }
        //if (keysPressed)
            //console.log(text);
    }

    getClosestFlower(){
        var flowers = this.garden.getFlowers();
        // initialize min distance to a large value infinity
        var minDistance = 1000000;
        var closestFlower = null;

        for (let i = 0; i < flowers.length; i++){
            let flower = flowers[i];
            const recepatcleCenter = flower.centerCoords;
            if (recepatcleCenter== null){
                continue;
            }
            
            let distance = Math.sqrt((this.myBee.x - recepatcleCenter.x)**2 + (this.myBee.y + this.myBee.dy - recepatcleCenter.y)**2 + (this.myBee.z - recepatcleCenter.z)**2);
            if (distance < minDistance){
                minDistance = distance;
                closestFlower = flower;
            }
        }
        console.log(minDistance);
        if (minDistance >1){
            return null;
        }
        return closestFlower;
    }

    update(t){
        if (this.time == 0){
            this.time = t;
        }
        const deltaT = t - this.time;
        this.time = t;

        if (this.displayBee || this.completeScene){
            this.myBee.update(t, deltaT);
            if(this.myBee.reached()){
                this.myBee.reachedDestination = false;
                this.dropPollen();
            }
        }

        this.checkKeys();

        if (this.followBee && (this.displayBee || this.completeScene)){
            // set the camera to behind the bee and pointing at the bee
            let x = this.myBee.x;
            let y = this.myBee.y;
            let z = this.myBee.z;
            
            // current camera position
            let camX = this.camera.position[0];
            let camY = this.camera.position[1];
            let camZ = this.camera.position[2];

            // make the camera get to a specific distance from the bee
            let desiredDis = 15 / this.camera.fov;
            let distance = Math.sqrt((x - camX)**2 + (y - camY)**2 + (z - camZ)**2);
            // calculate the new camera position
            let newX = x - (x - camX) * desiredDis / distance;
            let newY = y - (y - camY) * desiredDis / distance;
            let newZ = z - (z - camZ) * desiredDis / distance;

            // make the camera look at the bee
            this.camera.position = vec3.fromValues(newX, newY, newZ);
            this.camera.target = vec3.fromValues(x, y, z);
        }
    }

    dropPollen(){
        let pollen = this.myBee.dropPollen();
        if (pollen != null){
            this.hive.addPollen(pollen);
        }
    }

    regenerateRockSet(){
        this.myRockSet = new MyRockSet(this, 5);
    }

    initLights() {
        // Light 1
        this.lights[0].setPosition(0, 0, 10, 1);
        this.lights[0].setAmbient(0.2, 0.2, 0.2, 1);
        this.lights[0].setDiffuse(0.9, 0.9, 1.0, 1);
        this.lights[0].setSpecular(0, 0, 0, 1);
        this.lights[0].enable();
        this.lights[0].update();

        // Light 2
        this.lights[1].setPosition(10, 10, 10, 1);
        this.lights[1].setAmbient(0.2, 0.2, 0.2, 1);
        this.lights[1].setDiffuse(0.9, 0.9, 1.0, 1);
        this.lights[1].setSpecular(0, 0, 0, 1);
        this.lights[1].enable();
        this.lights[1].update();

        // Light 3
        this.lights[2].setPosition(-10, -10, -10, 1);
        this.lights[2].setAmbient(0.2, 0.2, 0.2, 1);
        this.lights[2].setDiffuse(0.9, 0.9, 1.0, 1);
        this.lights[2].setSpecular(0, 0, 0, 1);
        this.lights[2].enable();
        this.lights[2].update();
    }

    initCameras() {
        this.camera = new CGFcamera(
            2,
            0.1,
            1000,
            vec3.fromValues(30, 50, 50),
            vec3.fromValues(30, 0, 0)
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

        // ---- BEGIN Primitive drawing section
        
        if (this.displayNormals){
            this.mySphere.enableNormalViz();
        } else{
            this.mySphere.disableNormalViz();
        }

        if (this.followBee){
            this.camera.fov = 1.3;
        }else{
            this.camera.fov = 1.5;
        }
        
        const groundHeight = -1;

        // draw plane
        if (this.displayPlane || this.completeScene){
            this.pushMatrix();
            this.grassAppearance.apply();
            this.scale(400,400,400);
            this.rotate(-Math.PI/2.0,1,0,0);
            this.plane.display();
            this.popMatrix();
        }
        
        // draw planet
        if (this.displayGlobe){
            this.pushMatrix();
            //this.scale(5,5,5);
            this.earthMaterial.apply();
            this.mySphere.display();
            this.popMatrix();
        }

        // draw dome   
        if (this.displayPanorama || this.completeScene){
            this.pushMatrix();

            var cameraPosition = this.camera.position;
            this.translate(cameraPosition[0], cameraPosition[1], cameraPosition[2]);

            this.panorama.display();

            this.popMatrix();
        } 
        
        if (this.displayRock){
            this.rockAppearance.apply();
            this.pushMatrix();
            this.scale(3,3,3);
            this.myRock.display();
            this.popMatrix();
        }

        if (this.displayRockSet){
            this.myRockSet.display();
        }

        if (this.displayRockLayout){
            this.myRockLayout.display();
        }

        if (this.displayGarden){
            this.garden.display();
        }

        if (this.displayHive){
            this.hive.display();
        }

        // display the grass field
        if (this.displayGrass || this.completeScene){
            //this.grassMaterial.apply();
            this.setActiveShader(this.shader);

            let currentTime = (Date.now() - this.startTime) / 1000.0; // Time in seconds
            let timeLocation = this.gl.getUniformLocation(this.shader.program, "time");
            this.gl.uniform1f(timeLocation, currentTime);

            for (let i = 0; i < 2500; i++) {
                this.pushMatrix();
                this.translate(this.grassField[i].x_trans, 0, this.grassField[i].z_trans);
                this.scale(this.grassField[i].x_grass_scale, this.grassField[i].y_grass_scale, this.grassField[i].z_grass_scale);
                this.rotate(this.grassField[i].rotation_angle, 0, 1, 0);
                this.grassField[i].display();
                this.popMatrix();
            }

            this.setActiveShader(this.defaultShader);
        }

        if (this.completeScene){
            // ground and sky already drawn
            // draw rock layout  
            this.pushMatrix();
            this.translate(15,groundHeight,15);
            this.scale(3,2,3);
            //this.myRockLayout.display();
            this.popMatrix();


            // draw rock set that will serve as a base for the hive
            this.pushMatrix();
            this.translate(50,groundHeight,30);
            this.scale(6,6,6);
            this.myRockSet.display();
            this.popMatrix();
            
            this.pushMatrix();
            this.translate(60,0,0);
            this.scale(6,6,6);
            this.myRockSets[0].display();
            this.popMatrix();

            this.pushMatrix();
            this.translate(30,0,50);
            this.scale(6,6,6);
            this.myRockSets[1].display();
            this.popMatrix();

            this.pushMatrix();
            this.translate(0,0,50);
            this.scale(10,10,10);
            this.myRocks[0].display();
            this.popMatrix();

            this.pushMatrix();
            this.translate(-35,0,-35);
            this.scale(5,5,5);
            this.myRocks[1].display();
            this.popMatrix();

            this.pushMatrix();
            this.translate(-35,0,25);
            this.scale(7,7,7);
            this.myRocks[1].display();
            this.popMatrix();

            // draw hive
            this.pushMatrix();
            this.translate(50, this.hiveAltitude, 30);
            this.rotate(-Math.PI*3/4, 0, 1, 0);
            this.hive.display();
            this.popMatrix();

            // display flowers
            this.pushMatrix();
            this.scale(2,2,2);
            this.garden.display();
            this.popMatrix();
        }


        // keep the bee in last because it has transparency
        if (this.displayBee || this.completeScene){
            this.pushMatrix();
            this.scale(this.scaleFactor, this.scaleFactor, this.scaleFactor);
            this.myBee.display();
            this.popMatrix();
        }

        // for testing purposes
        /*
        const flowers = this.garden.getFlowers();
        for(let i = 0; i < flowers.length; i++){
            const center = flowers[i].centerCoords;
            this.pushMatrix();
            this.translate(center.x, center.y, center.z);
            this.mySphere.display();
            this.popMatrix();
        }
        */
        /*
        this.pushMatrix();
            this.translate(...this.hiveLocation);
            this.mySphere.display();
            this.popMatrix();
        */
        // ---- END Primitive drawing section
    }
}
