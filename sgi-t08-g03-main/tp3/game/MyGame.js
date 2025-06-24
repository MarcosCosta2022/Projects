import * as THREE from 'three';
import {MyMenu} from './MyMenu.js'
import { MyMatch } from './match/MyMatch.js'
import { MyTextWriter } from '../MyTextWriter.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { MyWinner } from './MyWinner.js';
import { MyParkingLot } from './MyParkingLot.js';
import { MyOutdoorDisplay } from './MyOutdoorDisplay.js';
import { MyBassReliefDisplay } from './MyBassReliefDisplay.js';

/**
 *  This class contains the contents of out application
 */
class MyGame {
    constructor(app,scene,track, obstacles,powerups, balloons, routes){
        this.app = app;
        this.scene = scene;

        this.track = track;
        this.obstacles = obstacles;
        this.powerups = powerups;
        this.balloons = balloons;
        this.routes = routes;

        this.textWriter = new MyTextWriter(this.app, './images/font_transparent.png');
        this.fontLoader = new FontLoader();
        this.font = null;
        this.fontLoader.load('./fonts/gentilis_bold.typeface.json' , (font)=>{
            this.font = font;
        })

        this.running = false;

        // assembleScene
        this.assembleScene();

        // state can be : menu, match, winnerScreen
        this.state = null;
        this.initState();

        this.needsBoundingVolumesUpdate = true;
    }

    assembleScene(){
        // put all the obstacles and powers ups and ballons (in the parking lot) in the scene
        // start by putting the track in the scene
        this.track.position.set(0,0,0)
        this.scene.add(this.track);

        // put ballons in parking lot TODO
        this.assembleParkingLot()

        // add powerups and obstacles to the scene
        this.obstacles.forEach((obstacle)=>{
            this.scene.add(obstacle);
        });

        this.powerups.forEach((powerup) =>{
            this.scene.add(powerup);
        });

        // create an outDoor display
        this.outdoorDisplay = new MyOutdoorDisplay(this.app,this, 300);
        this.outdoorDisplay.rotation.y = Math.PI/2;
        this.outdoorDisplay.position.set(-1000,0,0);
        this.scene.add(this.outdoorDisplay);

        // create a bass relief outdoor display
        this.bassReliefOutdoorDisplay = new MyBassReliefDisplay(this.app,this, 300);
        this.bassReliefOutdoorDisplay.rotation.y = Math.PI * 5/4;
        this.bassReliefOutdoorDisplay.position.set(600,300,700);
        this.scene.add(this.bassReliefOutdoorDisplay)

        // create collision box helpers
        this.createCollisionBoxHelpers();
    }

    assembleParkingLot(){
        // create dupicate balloons for player and enemy
        this.playerBalloons = this.balloons;
        this.enemyBalloons = {};
        for(let key in this.balloons){
            const balloon = this.balloons[key];
            // clone balloon
            const clonedBalloon = balloon.clone();
            // add clone to enemies balloons
            this.enemyBalloons[key] = clonedBalloon;

            // add both ballons to the scene
            this.scene.add(balloon);
            this.scene.add(clonedBalloon);

            // store ids inside ballons
            balloon.name = key;
            balloon.side = "player";

            clonedBalloon.name = key;
            clonedBalloon.side = "autonomous";
        }

        // create a parking lot and put the ballons in there
        this.enemyParkingLot = new MyParkingLot(this.app, this.enemyBalloons, "autonomous");
        this.enemyParkingLot.position.set(-1200,0,500);
        this.enemyParkingLot.rotation.y = Math.PI/2;
        this.scene.add(this.enemyParkingLot);
        this.enemyParkingLot.positionBalloons();

        // create a parking lot for the players ballons
        this.playerParkingLot = new MyParkingLot(this.app, this.playerBalloons, "player");
        this.playerParkingLot.position.set(-1200,0,-500);
        this.playerParkingLot.rotation.y = Math.PI/2;
        this.scene.add(this.playerParkingLot);
        this.playerParkingLot.positionBalloons();
        
    }

    createCollisionBoxHelpers(){
        // create bounding boxes helpers and add them to the scene
        this.allHelpers = new THREE.Group();

        // for all ballons
        for(let key in this.balloons){
            const balloon = this.balloons[key];

            // create the box helper
            const boxHelper = balloon.createCollisionHelpers();

            // add it to the helpers
            this.allHelpers.add(boxHelper);
        }

        for(let key in this.enemyBalloons){
            const balloon = this.enemyBalloons[key];

            // create the box helper
            const boxHelper = balloon.createCollisionHelpers();

            // add it to the helpers
            this.allHelpers.add(boxHelper);
        }

        // do the same for all obstacles
        this.obstacles.forEach(obstacle => {
            const obstacleHelpers = obstacle.createCollisionHelpers();
            this.allHelpers.add(obstacleHelpers);
        });

        // and for powerups
        this.powerups.forEach(powerup => {
            const powerupHelpers = powerup.createCollisionHelpers();
            this.allHelpers.add(powerupHelpers);
        });

        // set helpers to false as a default
        this.allHelpers.visible = false;

        // add helpers to the scene
        this.scene.add(this.allHelpers);
    }
    
    onMouseClick(event){
        // let the state handle mouse clicks
        console.log("mouse click")
        if(this.state) this.state.onMouseClick(event);
    }

    onKeyDown(key){
        // let the state handle key presses
        if(this.state) this.state.onKeyDown(key);
    }

    switchState(state){
        this.state = state;
        this.needsUpdateCamera = true;
    }

    initState(){
        this.needsUpdateCamera = true;
        this.state = new MyMenu(this.app,this);
        return;
    }

    start(){
        this.running = true;
    }

    isKeyDown(key){
        if (this.app.keyStates[key]) return true;
    }

    getScene(){
        return this.state.getScene();
    }

    getHUD(){
        return this.state.getHUD(); // might be null if not defined, in that case, no HUD will be rendered
    }

    updateBoundingBoxes(){
        // go through ballons and update volumes 
        for(let key in this.balloons){
            const balloon = this.balloons[key];
            balloon.updateVolumes();
        }

        for(let key in this.enemyBalloons){
            const balloon = this.enemyBalloons[key];
            balloon.updateVolumes();
        }
    }

    update(){
        if (!this.running) return;

        const delta = this.app.deltaTime;

        if (this.state) this.state.update(delta);

        if(this.needsBoundingVolumesUpdate){ // update bounding volumes after the render pass
            this.updateBoundingBoxes();
            this.needsBoundingVolumesUpdate;
        }

        if (this.needsUpdateCamera){
            // call updateCameras from the state
            this.state.updateCamerasInApp();
            this.needsUpdateCamera = false;
        }

        // update bass-relief outdoor display
        this.bassReliefOutdoorDisplay.update(delta);
    }

    

}

export { MyGame };