import * as THREE from 'three';
import { MyHUD } from './MyHUD.js';
import { MyWind } from './MyWind.js';
import { MyOutdoorDisplay } from '../MyOutdoorDisplay.js';
import { MyPlayer } from './MyPlayer.js';
import { MyTrackProgressionSystem } from './MyTrackProgressionSystem.js';
import { MyWinner } from '../MyWinner.js';
import { MyEnemy } from './MyEnemy.js';
import { MyGameState } from '../MyGameState.js';
/**
 *  This class contains the contents of out application
 */
class MyMatch extends MyGameState{
    constructor(app,game,playerBallon, enemyBallon, enemyRoute, playerSide, track, powerups, obstacles, objectiveLaps = 1, initialVouchers = 0, penaltyTime = 3){
        super(app,game)

        this.playerSide = playerSide; // true for right, false for left
        this.track = track;
        this.powerups = powerups;
        this.obstacles = obstacles;
        this.objectiveLaps = objectiveLaps;

        this.playerMark = null;

        // create cntroller for different facets of the game
        this.wind = new MyWind(this,80);
        this.hud = new MyHUD(this.app, this);
        this.player = new MyPlayer(this, playerBallon, initialVouchers, penaltyTime);
        console.log(enemyRoute)
        this.enemy = new MyEnemy(this, enemyBallon, enemyRoute);
        this.progressionSystem = new MyTrackProgressionSystem(this);

        // Position ballons in the scene
        this.positionObjects();

        // add a mark for the player on the track
        this.createAuxiliaryObjects();

        // create the cameras
        this.cameras = {};
        this.activeCamera = null;
        this.initCameras();

        // recalculate animation
        this.enemy.setupAnimation(this.enemy.balloon.position.clone())

        // flags to monitor game progress
        this.running = false;
        this.onCountDown = true; // start with a countdown
        this.paused = false; // starts the game with it running
        this.matchElapsedTime = 0;

        // flag to update cameras in app
        this.changedCameras = false;

        // add checkpoint to the track to allow monitoring of progression
        this.progressionSystem.addCheckpointsFromTrack(this.track, 20);

        this.newState = null;

        // after adding everything, update the bounding boxes of the collidable objects
        this.initBoundingBoxes();
    }

    createAuxiliaryObjects(){
        // create player mark (sphere for now)
        const sphereGeometry = new THREE.SphereGeometry(1, 10,10);
        const markMaterial = new THREE.MeshPhongMaterial({
            color: "#ffff00"
        });
        this.playerMark = new THREE.Mesh(sphereGeometry, markMaterial);
        this.game.scene.add(this.playerMark);

        // create a mark for the closest track point
        const closestPointGeometry = new THREE.SphereGeometry(0.5, 10,10);
        const closestPointMaterial = new THREE.MeshPhongMaterial({
            color: "#ff0000"
        });
        this.closestPointMark = new THREE.Mesh(closestPointGeometry, closestPointMaterial);
        this.game.scene.add(this.closestPointMark);
    }

    removeAuxiliaryObjects(){ 
        this.scene.remove(this.playerMark);
        this.scene.remove(this.closestPointMark);
    }

    positionObjects(){
        // add objects to the scene and position them in the correct place
        const startingPositions = this.track.getStartingPositions();

        // determine the position of each ballon
        const playerPosition = this.playerSide ? startingPositions.right : startingPositions.left;
        const enemyPosition = this.playerSide ? startingPositions.left : startingPositions.right;

        // put the ballon in those positions
        this.player.balloon.move(playerPosition);
        this.enemy.balloon.move(enemyPosition);
    }

    onMouseClick(event){
        // do nothing by default
    }

    initBoundingBoxes(){
        this.player.balloon.updateVolumes();
        this.enemy.balloon.updateVolumes();
        
        this.obstacles.forEach(obstacle => {
            obstacle.updateVolumes();
        });

        this.powerups.forEach(powerup => {
            powerup.updateVolumes();
        });
    }

    /**
     * Initializes the scene containing the ballons (player and enemy), the track, the powerups and the obstacles, as well as the surrounding environment
     */
    initScene(){
        this.scene = new THREE.Scene()
        
        // add objects to the scene and position them in the correct place
        const startingPositions = this.track.getStartingPositions(12);
        this.player.balloon.position.copy(startingPositions.right);
        this.scene.add(this.player.balloon)

        this.enemy.balloon.position.copy(startingPositions.left);
        this.scene.add(this.enemy.balloon)

        this.scene.add(this.track)
        this.powerups?.forEach(powerup => {
            this.scene.add(powerup)
        });
        this.obstacles?.forEach(obstacle=>{
            this.scene.add(obstacle)
        });

        // add lighting (can also take a 'map' as an argument which it adds and it contains decorations)

        // add ambeint light
        const ambientLight = new THREE.AmbientLight(0x555555);
        this.scene.add(ambientLight);

        // add point light
        const pointLight = new THREE.PointLight(0xffffff, 50, 0, 0.1);
        pointLight.position.set(20, 50, 20);
        const pointlighthelper = new THREE.PointLightHelper(pointLight, 1);
        this.scene.add(pointlighthelper);
        this.scene.add(pointLight);
        
        // background
        this.scene.background = new THREE.Color("#a0cca0")

        // create player mark (sphere for now)
        const sphereGeometry = new THREE.SphereGeometry(0.7, 10,10);
        const markMaterial = new THREE.MeshPhongMaterial({
            color: "#ffff00"
        });
        this.playerMark = new THREE.Mesh(sphereGeometry, markMaterial);
        this.scene.add(this.playerMark);

        // create a mark for the closest track point
        const closestPointGeometry = new THREE.SphereGeometry(0.5, 10,10);
        const closestPointMaterial = new THREE.MeshPhongMaterial({
            color: "#ff0000"
        });
        this.closestPointMark = new THREE.Mesh(closestPointGeometry, closestPointMaterial);
        this.scene.add(this.closestPointMark);

        // create bounding boxes helpers and add them to the scene
        this.allHelpers = new THREE.Group();
        const playerBoundingBoxHelpers = this.player.balloon.createCollisionHelpers();
        this.allHelpers.add(playerBoundingBoxHelpers);

        const enemyBoundingBoxHelpers = this.enemy.balloon.createCollisionHelpers();
        this.allHelpers.add(enemyBoundingBoxHelpers);

        this.obstacles.forEach(obstacle => {
            const obstacleHelpers = obstacle.createCollisionHelpers();
            this.allHelpers.add(obstacleHelpers);
        });

        this.powerups.forEach(powerup => {
            const powerupHelpers = powerup.createCollisionHelpers();
            this.allHelpers.add(powerupHelpers);
        });

        this.allHelpers.visible = false;

        this.scene.add(this.allHelpers);
    }

    initCameras(){
        const aspect = window.innerWidth / window.innerHeight;

        this.cameraTarget = this.player.getCenterPosition();

        // Initiate thridPerson camera
        const thirdPerson =new  THREE.PerspectiveCamera(45, aspect, 1, 1000);
        this.thirdPersonCameraDistance = 100;
        // middle of the ballon
        thirdPerson.target = this.cameraTarget;
        // get the forward vector in the ballons position
        let forward = this.track.getForwardVector(this.player.balloon.position);
        // invert the vector and scale to distance
        let backwards = forward.clone().multiplyScalar(-this.thirdPersonCameraDistance);
        // get position
        thirdPerson.position.copy(thirdPerson.target.clone().add(backwards));
        thirdPerson.orbitControlSettings = {
            'enablePan': false // to stop panning from orbitControlls ( moving the camera along with the target)
        }
        thirdPerson.far = 10000;
        thirdPerson.name = 'thirdPerson';
        this.cameras['thirdPerson'] = thirdPerson;


        // initiate firstPerson camera
        // first person camera is almost the same thing as thirdPerson except closer to the ballon and the ballon isnt visible
        const firstPerson = new THREE.PerspectiveCamera(70, aspect, 5, 1000);
        this.firstPersonCameraDistance = 1;
        firstPerson.target = this.cameraTarget;
        backwards = forward.clone().multiplyScalar(-this.firstPersonCameraDistance);
        firstPerson.position.copy(firstPerson.target.clone().add(backwards));
        firstPerson.orbitControlSettings = {
            'enablePan': false, // to stop panning
            'enableZoom': false // cant zoom in or out in firstPerson
        }
        firstPerson.far = 10000;
        firstPerson.name = 'firstPerson';
        this.cameras['firstPerson'] = firstPerson;

        const freeCamera = new THREE.PerspectiveCamera(45, aspect, 1, 1000)
        const target = this.player.getCenterPosition();
        freeCamera.target = target;
        this.cameras['free'] = freeCamera;
        freeCamera.name = 'free';
        freeCamera.far = 10000;
    }

    initEnemyRoute(){
        // use route in the enemy ballon to animate it
        this.enemy.start()
    }

    getPlayerHorizontalSpeed(){
        return this.player.getHorizontalSpeed();
    }

    getPlayersCurrentLayer(){
        let layer = 0;
        for(let layerHeight in this.layersHeights){
            const height = this.layersHeights[layerHeight]
            if (height > this.playerBallon.position.y) return layer;
            layer++;
        }
        return layer;
    }

    start(){
        this.running = true;
    }

    getScene(){
        return this.game.scene;
    }

    getHUD(){
        return this.hud.getScene();
    }

    switchToNextPerspective(){
        // get the current camera
        const currentCamera = this.app.activeCameraName;
        let nextCamera;
        switch(currentCamera){
            case 'thirdPerson': nextCamera = 'firstPerson'; break;
            case 'firstPerson': nextCamera = 'free'; break;
            case 'free' : nextCamera = 'thirdPerson'; break;
        }

        this.app.setActiveCamera(nextCamera);
    }

    isKeyDown(key){
        if (this.app.keyStates[key]) return true;
    }

    countDownFinished(){
        this.onCountDown = false;
        this.enemy.start();
    }

    updatePlayerMark(){
        const pos = this.player.balloon.position;
        this.playerMark.position.set(pos.x, 0,pos.z);
    }

    updateActions(){
        if(this.app.wasKeyClicked('h')){
            this.hud.toggleHUD()
        }
        if(this.app.wasKeyClicked('c')){
            this.switchToNextPerspective();
        }
    }

    updateCameras(){
        // update thrid Camera
        const playerCenter = this.player.getCenterPosition();

        // calculate the difference between the last playerCenter
        let difference = playerCenter.clone().sub(this.cameraTarget);
        
        // apply the same difference to the camera
        this.cameras['thirdPerson'].position.add(difference);

        // update target too
        this.cameraTarget.copy(playerCenter);

        // update first person camera
        this.cameras['firstPerson'].position.add(difference);
        // if first person camera is active, make the player ballon invisible
        if (this.app.activeCameraName == 'firstPerson'){
            this.player.balloon.visible = false;
        }else{
            this.player.balloon.visible = true;
        }

    }

    checkForCollisions(){
        if (this.player.isPenalized) return // already being penalized

        let applyPenalty = false;

        for(let i = 0 ; i < this.obstacles.length; i++){
            const obstacle  = this.obstacles[i];
            const res = obstacle.checkForCollisinWithPlayer(this.player.balloon)
            if(res){
                applyPenalty = true;
                break;
            }
        }

        for(let i = 0 ; i < this.powerups.length; i++){
            const powerup  = this.powerups[i];
            const collides = powerup.checkForCollisinWithPlayer(this.player.balloon)
            if(collides){
                // add one voucher
                this.player.addVoucher();
            }
        }

        // check if ballons are colliding
        const res = this.enemy.balloon.checkForCollisinWithPlayer(this.player.balloon);
        if (res){
            applyPenalty = true;
        }

        const {distance, closestPoint} = this.track.getClosestPoint(this.playerMark.position.clone());
        if(closestPoint) this.closestPointMark.position.copy(closestPoint);
        if (distance > this.track.getWidth()/2){
            applyPenalty = true;
        }

        if(applyPenalty) this.player.applyPenalty(closestPoint.clone());
    }

    startMatch(){
        this.matchOngoing = true;
        this.enemyRoute.start();
    }

    updateOutdoorDisplay(){
        this.game.outdoorDisplay.update({
            elapsedTime: this.matchElapsedTime, 
            windDirection: this.wind.getWindDirectionString(this.player.balloon.position)
        });
    }

    pause(){
        this.game.outdoorDisplay.update({
            gameRunning: false
        })
        this.paused = true;
    }

    onKeyDown(key){
        if(key == 'Escape'){
            this.goBackToMenu();
        }else if(key == "x"){
            this.gameOver("player");
        }
    }

    goBackToMenu(){
        this.game.menuState.reset();
        this.newState = this.game.menuState;
    }

    gameOver(winner){
        console.log("winner")
        this.newState = new MyWinner(this.app, this.game, winner, this.player.balloon, this.enemy.balloon, this.matchElapsedTime);
    }

    checkProgress(delta){
        const progress = this.progressionSystem.update(this.playerMark.position, delta);

        if (progress.isWrongWay) {
            console.log('Wrong way!');
        }
        
        if (progress.isComplete) {
            // Handle race completion
            console.log('One lap completed!');
            this.player.incrementLaps();
            this.progressionSystem.reset();
        }
    }

    updateCamerasInApp(){ // called from game
        this.app.setCameras(this.cameras, 'thirdPerson');
    }

    update(delta){
        if(this.newState){
            this.game.switchState(this.newState);
            return;
        }

        if (!this.running) return;
        
        this.updateActions()

        if(!this.paused){
            if (!this.onCountDown){
                this.matchElapsedTime += delta;

                this.player.update(delta);
                this.updatePlayerMark();
                this.enemy.update(delta);

                this.checkForCollisions();
            }

            this.updateCameras();
           
            // update power ups
            this.powerups.forEach(powerup=>{
                powerup.update(delta);
            });

            // update obstacles
            this.obstacles.forEach(obstacle =>{
                obstacle.update(delta);
            });

            this.checkProgress(delta);

            this.updateOutdoorDisplay();
            this.hud.update(delta);
        }
    }
}

export { MyMatch };