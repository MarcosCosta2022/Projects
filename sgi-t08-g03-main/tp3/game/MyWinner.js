import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { MyGameState } from './MyGameState.js';
import {MyFireworkFactory} from './MyFireworkFactory.js';
import { MyMatch } from './match/MyMatch.js';
import { MyMenu } from './MyMenu.js';

/**
 *  This class represents the state where we show the winner of the game
 */
class MyWinner extends MyGameState {

    constructor(app,game, winner, playerBalloon, enemyBalloon, time) {
        super(app,game);
        this.winner = winner;
        this.playerBalloon = playerBalloon;
        this.enemyBalloon = enemyBalloon;
        this.playerName = "";
        this.time = time;
        this.myFireworkFactory = new MyFireworkFactory(this.app, this.getScene(),new THREE.Vector3(1000,0,0));
        
        this.raycaster = new THREE.Raycaster()
        this.raycaster.near = 1
        this.raycaster.far = 2000
        
        this.pointer = new THREE.Vector2()
        this.intersectedObj = null

        this.newState = null;

        this.cameras = {}
        this.changedCameras = false;
        this.init();
    }

    init() {
        

        // add backpanel for text
        const panel = new THREE.PlaneGeometry(30,10);
        const panelMaterial = new THREE.MeshPhongMaterial({
            color: 0xff4400
        });

        this.playerName = "Computer" + " wins!";

        //write the winner name
        const { textMesh, dimensions } = this.game.textWriter.createTextMesh(this.playerName, 10);
        
        textMesh.rotation.y = Math.PI/2;
        textMesh.position.set(1450,400,60);

        this.game.scene.add(textMesh);
        //write the time
        //at most time has 1 decimal places
        this.time = this.time.toFixed(1);
        const { textMesh: textMesh1, dimensions: dimensions1 } = this.game.textWriter.createTextMesh("Time: " + this.time + " seconds", 5);
        
        textMesh1.rotation.y = Math.PI/2;
        textMesh1.position.set(1450,390,45);

        this.game.scene.add(textMesh1);
        //write under winner
        const { textMesh: textMesh2, dimensions: dimensions2 } = this.game.textWriter.createTextMesh("WINNER", 5);
        
        textMesh2.rotation.y = Math.PI/2;
        this.winnerText = textMesh2;
        this.winner = "Autonomous";
        if(this.winner == "Autonomous"){
        textMesh2.position.set(1450,345,-7.5);}
        else{
            textMesh2.position.set(1450,345,37);}


        this.game.scene.add(this.winnerText);

        this.playerBalloon.position.set(1450,350,20);
        this.enemyBalloon.position.set(1450,350,-20);

        //two buttons to restart or go back to menu
        const geometry = new THREE.BoxGeometry( 10, 10, 30 );

        const loader = new THREE.TextureLoader();
        const restartTexture = loader.load( 'images/restart.png' );
        const menuTexture = loader.load( 'images/backtomenu.png' );
        const restartMaterial = new THREE.MeshBasicMaterial( {map: restartTexture} );
        const menuMaterial = new THREE.MeshBasicMaterial( {map: menuTexture} );

        const cube = new THREE.Mesh( geometry, restartMaterial );
        //rotate slightly upwards
        cube.rotation.z = Math.PI/6;
        cube.position.set(1450,330,20);
        cube.name = "restartButton";
        this.game.scene.add( cube );

        const cube1 = new THREE.Mesh( geometry, menuMaterial );
        
        cube1.rotation.z = Math.PI/6;
        cube1.position.set(1450,330,-20);
        cube1.name = "menuButton";
        this.game.scene.add( cube1 );


        this.createdText = false;
        // create a camera
        this.createCameras();
    }

    // create the cameras
    createCameras(){
        const aspect = window.innerWidth / window.innerHeight;
        // create a fixed camera for the scene
        const fixed = new THREE.PerspectiveCamera(45, aspect, 1, 1000);
        fixed.position.set(1550,390,0);
        fixed.target = new THREE.Vector3(0,0,0);
        
        fixed.orbitControlSettings = {
            'enabled' : false
        }
        this.cameras['fixed'] = fixed;
        fixed.far = 10000;
        // create a free camera for the scene
        const free = new THREE.PerspectiveCamera(45, aspect, 1, 1000);
        free.position.set(1250,395,0);
        free.target = new THREE.Vector3();
        this.cameras['free'] = free;     
        free.far = 10000;
    }

    getScene(){
        return this.game.scene;
        }
    // create the text that shows the winner
    createWinnerText(){
        if (this.game.font){
            const geometry = new TextGeometry(this.winner + ' wins!', {
                font: this.game.font,
                size: 0.5,
                height: 0.1,
                curveSegments: 12,
                bevelEnabled: false
            });
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const text = new THREE.Mesh(geometry, material);
            text.position.set(-1.5, 0, 0);
            this.createdText = true;
        }
    }

   

    onMouseClick(event) {
        // Calculate pointer position in normalized device coordinates
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
        // Set the picking ray from the camera position and mouse coordinates
        this.raycaster.setFromCamera(this.pointer, this.app.getActiveCamera());
    
        // Compute intersections
        const intersects = this.raycaster.intersectObjects(this.getScene().children)
    
        if (intersects.length > 0) {
            const obj = intersects[0].object;
            console.log(obj)
            
            if( obj.name == "restartButton" ){
                    console.log("Restarting game");
                    this.startMatch();
                }
            if( obj.name == "menuButton" ){
                    console.log("Going back to menu");
                    this.game.menuState.reset();
                    if(!this.newState){
                        this.newState = this.game.menuState;
                    }
                }
            
        }
    }
    // start the match
    startMatch(){
        if(!this.getState){
            this.newState = this.game.menuState.getNewMatch();
        }
    }

    update(delta){

        if(this.newState){
            this.game.switchState(this.newState);
            this.newState.start();
            return;
        }

        if (!this.changedCameras){
            this.changedCameras = true;
            // change the app cameras for these cameras
            this.app.setCameras(this.cameras, 'fixed');
        }
        this.myFireworkFactory.update();

        if(!this.createdText){
            this.createWinnerText();
        }

        if (this.winner === "Autonomous") {
            this.enemyBalloon.rotation.y += 0.01; // Rotate enemy balloon around the Y-axis
        } else {
            this.playerBalloon.rotation.y += 0.01; // Rotate player balloon around the Y-axis
        }
        const pulseScale = 1 + 0.1 * Math.sin(Date.now() * 0.002); // Sine wave for smooth scaling
        this.winnerText.scale.set(pulseScale, pulseScale, pulseScale);

    }

    
    
}

export { MyWinner };