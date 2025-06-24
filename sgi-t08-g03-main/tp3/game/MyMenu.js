//create a MyMenu class

import * as THREE from 'three';

import { MyBallon } from './MyBallon.js';
import { MyGameState } from './MyGameState.js';
import { MyMatch } from './match/MyMatch.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

class MyMenu extends MyGameState{
    constructor(app,game){
        super(app,game);
        this.changedCameras = false;

        this.playerBallon = null;
        this.enemyBallon = null;
        this.playerSide = true; // right side is default

        // store this state in the game so it doenst have to be created multiple times
        this.game.menuState = this;

        // initializa raycaster for picking
        this.raycaster = new THREE.Raycaster()
        this.raycaster.near = 1
        this.raycaster.far = 2000

        this.pointer = new THREE.Vector2()
        this.intersectedObj = null
        this.pickingColor = "0x00ff00"

        this.notPickableObjIds = []
        this.lastPickedObj = null

        this.currentScene = null;
        this.playerName = "Your Name";
        this.automousName = "Automous";
        this.currentPlayerNameMesh = null;
        this.needsToUpdatePlayerNameMesh = false;

        this.phase = "start";

        this.selectedPlayerBallonName = this.game.playerParkingLot.getFirstBalloonName();
        this.selectedEnemyBallonName = this.game.enemyParkingLot.getFirstBalloonName();

        this.nextState = null;

        this.initMenuScene();
        this.initPickScreenScene();
        this.initCameras();
    }

    reset(){
        this.switchPhase("start");
        this.game.playerParkingLot.positionBalloons();
        this.game.enemyParkingLot.positionBalloons();
    }

    initCameras(){
        this.cameras = {}
        const aspect = window.innerWidth / window.innerHeight;

        // Create a basic perspective camera
        const frustumSize = 200
        const camera = new THREE.OrthographicCamera( -frustumSize * aspect, frustumSize * aspect, frustumSize, -frustumSize, 1, 1000 );
        camera.position.set(0,0,300);
        camera.target = new THREE.Vector3();
        camera.far = 10000;
        camera.orbitControlSettings = {
            'enabled' : false
        };
        this.cameras['front'] = camera;


        // init a perspective camera for when picking the ballons
        const thirdPerson = new THREE.PerspectiveCamera(75, aspect, 1, 1000);
        thirdPerson.target = this.game.playerParkingLot.position.clone();
        const position = this.game.playerParkingLot.position.clone();
        position.x += 200;
        position.y += 100;
        thirdPerson.position.copy(position);
        thirdPerson.far = 10000;
        this.pickingCameras = {
            'thirdPerson': thirdPerson
        }
    }

    initMenuScene(){
        this.menuscene = new THREE.Scene() // create scene for the menu

        //create texture based on menu.jpg  
        const loader = new THREE.TextureLoader();
        const texture = loader.load('./images/menu.jpg');
        const playButtonGeometry = new THREE.PlaneGeometry( 500 ,150);
        const geometry = new THREE.PlaneGeometry( window.innerWidth/2 ,window.innerHeight/2);
        
        //create material with texture
        const material = new THREE.MeshBasicMaterial( { map: texture } );
        material.color.setHex(0xffffff);
        const transparentMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0.0 } );

        this.playButton = new THREE.Mesh( playButtonGeometry, transparentMaterial );
        this.playButton.name = "playButton";

        this.cube = new THREE.Mesh( geometry, material );
        this.playButton.position.set(1,-65,0);

        this.menuscene.add( this.playButton );
        this.menuscene.add( this.cube );

        this.currentScene = this.menuscene; // make this scene show in the screen
    }

    selectLeft(){
        // find what is the ballon on the left
        let leftBallonName = null;
        if(this.phase == "pickingPlayer"){
            leftBallonName = this.game.playerParkingLot.getLeftBallonName(this.selectedPlayerBallonName);
            if(leftBallonName != null){
                this.selectedPlayerBallonName = leftBallonName;
                this.placeCameraInCorrectPosition(this.game.playerParkingLot.getBalloonByName(this.selectedPlayerBallonName));
            }
        }else if (this.phase == "pickingEnemy"){
            leftBallonName = this.game.enemyParkingLot.getLeftBallonName(this.selectedEnemyBallonName);
            if(leftBallonName != null){
                this.selectedEnemyBallonName = leftBallonName;
                this.placeCameraInCorrectPosition(this.game.enemyParkingLot.getBalloonByName(this.selectedEnemyBallonName));
            }
        }
    }

    selectRight() {
        // find what is the ballon on the right
        let rightBallonName = null;
        if(this.phase == "pickingPlayer") {
            rightBallonName = this.game.playerParkingLot.getRightBallonName(this.selectedPlayerBallonName);
            if(rightBallonName != null) {
                this.selectedPlayerBallonName = rightBallonName;
                this.placeCameraInCorrectPosition(this.game.playerParkingLot.getBalloonByName(this.selectedPlayerBallonName));
            }
        } else if (this.phase == "pickingEnemy") {
            rightBallonName = this.game.enemyParkingLot.getRightBallonName(this.selectedEnemyBallonName);
            if(rightBallonName != null) {
                this.selectedEnemyBallonName = rightBallonName;
                this.placeCameraInCorrectPosition(this.game.enemyParkingLot.getBalloonByName(this.selectedEnemyBallonName));
            }
        }
    }

    initPickScreenScene(){
        this.pickHUD = new THREE.Scene() // create scene for the menu

        // add two arrow to alternate between ballons
        const triangleVertices = new Float32Array([
            0, 5, 0,     // Top vertex
            -15, -15, 0, // Bottom-left vertex
            15, -15, 0   // Bottom-right vertex
        ]);
        
        const buttonGeometry = new THREE.BufferGeometry();
        buttonGeometry.setAttribute('position', new THREE.BufferAttribute(triangleVertices, 3));
        const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000, 
            side: THREE.DoubleSide  });

        // back button
        this.backButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
        this.backButton.rotation.z = Math.PI/2;
        this.backButton.scale.set(3,3,3);
        this.backButton.name = "changeBackButton";
        this.pickHUD.add(this.backButton);

        //font button
        this.frontButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
        this.frontButton.rotation.z = -Math.PI/2;
        this.frontButton.scale.set(3,3,3);
        this.frontButton.name = "changeForwardButton";
        this.pickHUD.add(this.frontButton);

        // add the button to move forward
        const squareButtonGeometry = new THREE.PlaneGeometry(250, 75);
        const squareButtonMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.nextButton = new THREE.Mesh(squareButtonGeometry, squareButtonMaterial);
        this.nextButton.name = "nextButton";
        this.pickHUD.add(this.nextButton);

        // add the displayed name on the top
        this.updatePlayerTextMesh();

        // add the position toggling buttons and texts
        this.positionTogglingButtons = this.addPositionTogglingButtons();
        this.pickHUD.add(this.positionTogglingButtons);

        function onResize(menu){
            menu.frontButton.position.set(window.innerWidth/2-140, 0);
            menu.backButton.position.set(-(window.innerWidth/2-140), 0);
            menu.nextButton.position.set(0, -window.innerHeight/2 + 60);
            menu.positionTogglingButtons.position.set(-window.innerWidth/2+140, window.innerHeight/2 - 200, 0);
        }

        onResize(this);

        // manage window resizes
        window.addEventListener('resize', () => {
            onResize(this)
        }, false );

        this.needsUpdatePickingScreen = true;
    }

    addPositionTogglingButtons(){
        const group = new THREE.Group();

        // create the button only
        const buttonGeometry = new THREE.PlaneGeometry(200,50);
        const buttonMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
        const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
        buttonMesh.name = "togglePositions";
        group.add(buttonMesh);

        this.needsToCompletePositionTogglingButtons = true;

        return group;
    }


    switchPhase(phase){
        if(phase == "pickingPlayer"){
            this.pickPlayerBallon();
        }else if(phase == "pickingEnemy"){
            this.pickEnemyBallon();
        }else if(phase == "start"){
            this.switchToStartScene();
        }
    }

    updateSelectedBallonTextMesh(){
        if(this.game.font){
            if(this.pickButtonSelectedBallonTextMesh){
                this.nextButton.remove(this.pickButtonSelectedBallonTextMesh);
            }

            const textMaterial = new THREE.MeshBasicMaterial({color:0xffffff});
            let selectedBallonName = "Something";
            if(this.phase == "pickingPlayer"){
                selectedBallonName = this.selectedPlayerBallonName;
            }else if(this.phase == "pickingEnemy"){
                selectedBallonName = this.selectedEnemyBallonName;
            }

            const mesh = this.getCenteredTextMesh(selectedBallonName, 30, textMaterial);
            this.pickButtonSelectedBallonTextMesh = mesh;
            mesh.name = "nextButton";
            mesh.position.y -= 15;
            this.nextButton.add(mesh);
        }
    }

    completePickingScreen(){
        if(this.game.font){
            // do some update
            //add the string "Picking [side] balloon"
            if(this.pickingTitle){
                this.pickHUD.remove(this.pickingTitle);
            }

            let text = "I dont know";
            if (this.phase == "pickingPlayer"){
                text = "Selecting Player's Balloon";
            }else if(this.phase == "pickingEnemy"){
                text = "Selecting Enemy's Balloon";
            }

            // create a material
            const textMaterial = new THREE.MeshBasicMaterial({color:0xffffff});
            const textMesh = this.getCenteredTextMesh(text, 20, textMaterial);
            // add mesh to the HUD
            this.pickingTitle = textMesh;
            this.pickingTitle.position.set(0,window.innerHeight/2-50,0);
            this.pickHUD.add(this.pickingTitle);

            const pickText = "Pick this balloon";
            const picktextMesh = this.getCenteredTextMesh(pickText, 15, textMaterial);
            this.pickButtonTextMesh = picktextMesh;
            picktextMesh.position.y += 15;
            picktextMesh.name = "nextButton"
            this.nextButton.add(picktextMesh);

            this.updateSelectedBallonTextMesh();

            this.completePositionToggling();

            this.needsUpdatePickingScreen = false;
        }
    }

    completePositionToggling(){
        if(this.needsToCompletePositionTogglingButtons){
            const group = this.positionTogglingButtons;

            const white =  new THREE.MeshBasicMaterial({color: 0xffffff});

            // add text to this group
            const title = this.getCenteredTextMesh("Starting Positions", 20,white);
            title.position.set(0,100, 0);
            group.add(title);

            const player = this.getCenteredTextMesh("Player", 14, new THREE.MeshBasicMaterial({color: 0x00ff00}));
            player.position.set(-60,70,0);
            this.playerStartingPositionTextMesh = player;
            group.add(player);

            const autonomous = this.getCenteredTextMesh("Autonomous", 14 , new THREE.MeshBasicMaterial({color: 0xff0000}));
            autonomous.position.set(60,70,0);
            this.autonomousStartingPositionTextMesh = autonomous;
            group.add(autonomous);

            const right = this.getCenteredTextMesh("right", 14, white);
            right.position.set(60,40,0);
            group.add(right);

            const left = this.getCenteredTextMesh("left", 14, white);
            left.position.set(-60,40,0);
            group.add(left);

            const toggle = this.getCenteredTextMesh("Toggle Positions", 14, white);
            toggle.position.set(0,0,0);
            toggle.name = "togglePositions";    
            group.add(toggle);

            // calculate new position based on player side
            if(this.playerSide == true){ // then player is on the right
                this.playerStartingPositionTextMesh.position.set(60,70,0);
                this.autonomousStartingPositionTextMesh.position.set(-60,70,0);
            }else{
                this.playerStartingPositionTextMesh.position.set(-60,70,0);
                this.autonomousStartingPositionTextMesh.position.set(60,70,0);
            }

            this.needsToCompletePositionTogglingButtons = false;
        }
    }

    getCenteredTextMesh(text, size = 1, material = null){
        if(this.game.font){

            // create 3d mesh 
            const geometry = new TextGeometry(text, {
                size: size,
                font: this.game.font
            });

            // Center the geometry
            geometry.computeBoundingBox();
            const boundingBox = geometry.boundingBox;
            const textCenter = new THREE.Vector3();
            boundingBox.getCenter(textCenter);
            geometry.translate(-textCenter.x, -textCenter.y, -textCenter.z);

            // Transform it into a mesh
            const textMesh = new THREE.Mesh(geometry, material);
            return textMesh;
        }

        return null;
    }

    updatePlayersName(key){
        if(this.playerName === "Your Name"){this.playerName = "";}

        if (key.length === 1) {
            this.playerName += key; // Append the character to the typedName
        }else if (key == 'Backspace') {
            this.playerName = this.playerName.slice(0, -1); // Remove last character
        }

        this.needsToUpdatePlayerNameMesh = true;
    }

    onKeyDown(key) {
        if(key == "Escape"){
            // go back a phase
            if (this.phase == "pickingPlayer"){
                this.switchPhase("start");
            }else if(this.phase == "pickingEnemy"){
                this.switchPhase("pickingPlayer");
            }
        }

        if(this.phase == "pickingPlayer"){
            this.updatePlayersName(key);
        }
    }
    
    getScene() {
        return this.currentScene; // Return the active scene or the default scene
    }

    getHUD(){
        if (this.phase == "pickingPlayer" || this.phase == "pickingEnemy") return this.pickHUD;
    }

    getNewMatch(){
        const playerBallon = this.game.playerParkingLot.getBalloonByName(this.selectedPlayerBallonName);
        const enemyBallon = this.game.enemyParkingLot.getBalloonByName(this.selectedEnemyBallonName);
        const route = enemyBallon.route;
        const obstacles = this.game.obstacles;
        const powerups = this.game.powerups;
        const track = this.game.track;
        const playerSide = this.playerSide;

        return new MyMatch(this.app,this.game,playerBallon, enemyBallon, route,false, track, powerups, obstacles);
    }

    startMatch(){
        if(this.nextState) return // already has a match ready to update
        this.nextState = this.getNewMatch();
    }

    placeCameraInCorrectPosition(balloon){
        // place camera based on ballon position
        
        // get camera
        const camera = this.pickingCameras['thirdPerson'];

        // get balloon position
        const center = new THREE.Vector3();
        balloon.center.getWorldPosition(center);
        center.y += 10;

        const position = center.clone();
        position.x += 50;

        // put camera correctly
        camera.position.copy(position);
        camera.target.copy(center);
    }

    switchToStartScene(){
        this.currentScene = this.menuscene;
        this.app.setCameras(this.cameras, 'front');

        this.phase = "start";
    }

    pickEnemyBallon(){
        // switch scene to the game scene
        this.currentScene = this.game.scene;

        // change camera to a perspective camera that faces the players parking lot ballon
        this.app.setCameras(this.pickingCameras, 'thirdPerson');

        // get selected balloon
        const balloon = this.game.enemyParkingLot.getBalloonByName(this.selectedEnemyBallonName);

        // updateCamera position
        this.placeCameraInCorrectPosition(balloon);

        // register change in phase
        this.phase = "pickingEnemy";

        // updatetitle
        this.completePickingScreen();

        this.needsToUpdatePlayerNameMesh = true;
    }

    pickPlayerBallon(){
        // switch scene to the game scene
        this.currentScene = this.game.scene;

        // change camera to a perspective camera that faces the players parking lot ballon
        this.app.setCameras(this.pickingCameras, 'thirdPerson');

        // get selected balloon
        const balloon = this.game.playerParkingLot.getBalloonByName(this.selectedPlayerBallonName);

        // updateCamera position
        this.placeCameraInCorrectPosition(balloon);

        // register change in phase
        this.phase = "pickingPlayer";

        // updatetitle
        this.completePickingScreen();

        this.needsToUpdatePlayerNameMesh  = true;
    }

    getPickingCamera(){
        if (this.phase == "pickingPlayer" || this.phase == "pickingEnemy"){
            return this.app.hudCamera;
        }
        return this.app.getActiveCamera();
    }

    getPickingScene(){
        if (this.phase == "pickingPlayer" || this.phase == "pickingEnemy"){
            return this.pickHUD;
        }
        return this.getScene();
    }


    switchPositions(){
        this.playerSide = !this.playerSide;

        // calculate new position based on player side
        if(this.playerSide == true){ // then player is on the right
            this.playerStartingPositionTextMesh.position.set(60,70,0);
            this.autonomousStartingPositionTextMesh.position.set(-60,70,0);
        }else{
            this.playerStartingPositionTextMesh.position.set(-60,70,0);
            this.autonomousStartingPositionTextMesh.position.set(60,70,0);
        }
    }
    

    onMouseClick(event) {
        // Calculate pointer position in normalized device coordinates
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
        // Set the picking ray from the camera position and mouse coordinates
        this.raycaster.setFromCamera(this.pointer, this.getPickingCamera());
    
        // Compute intersections
        const intersects = this.raycaster.intersectObjects(this.getPickingScene().children)
    
        if (intersects.length > 0) {
            const obj = intersects[0].object;

            if(this.phase == "start"){
                if( obj.name == "playButton" ){
                    this.pickPlayerBallon();
                }
            }else if(this.phase == "pickingPlayer" || this.phase == "pickingEnemy"){
                // check name of picked object
                if ( obj.name == "changeBackButton"){
                    this.selectLeft();
                    this.updateSelectedBallonTextMesh();
                }else if(obj.name == "changeForwardButton"){
                    this.selectRight();
                    this.updateSelectedBallonTextMesh();
                }else if(obj.name == "nextButton"){
                    // move to the next step
                    if (this.phase == "pickingPlayer"){
                        this.switchPhase("pickingEnemy");
                    }else if(this.phase == "pickingEnemy"){
                        console.log("Starting match")
                        this.startMatch();
                    }
                }else if(obj.name == "togglePositions"){
                    this.switchPositions();
                }
            }
        }
    }

    switchToPickScreen(){
        this.currentScene = this.scene;
    }

    /*
    * Helper to visualize the intersected object
    *
    */
    pickingHelper(intersects) {
        if (intersects.length > 0) {
            const obj = intersects[0].object
            if (obj.name === "playButton") {
                this.changeColorOfFirstPickedObj(obj);
            }}
            
    }

    changeColorOfFirstPickedObj(obj) {
        if (obj.name !== "playButton") return; // Only act on the playButton
    
        if (this.lastPickedObj !== obj) {
            if (this.lastPickedObj) {
                this.lastPickedObj.material.color.setHex(this.lastPickedObj.currentHex);
            }
            this.lastPickedObj = obj;
            this.lastPickedObj.currentHex = this.lastPickedObj.material.color.getHex();
            this.lastPickedObj.material.color.setHex(this.pickingColor);
        }
    }
    

    /*
     * Restore the original color of the intersected object
     *
     */
    restoreColorOfFirstPickedObj() {
        if (this.lastPickedObj)
            this.lastPickedObj.material.color.setHex(this.lastPickedObj.currentHex);
        this.lastPickedObj = null;
    }

    /**
     * Print to console information about the intersected objects
     */
    transverseRaycastProperties(intersects) {
        for (var i = 0; i < intersects.length; i++) {

            console.log(intersects[i]);

            /*
            An intersection has the following properties :
                - object : intersected object (THREE.Mesh)
                - distance : distance from camera to intersection (number)
                - face : intersected face (THREE.Face3)
                - faceIndex : intersected face index (number)
                - point : intersection point (THREE.Vector3)
                - uv : intersection point in the object's UV coordinates (THREE.Vector2)
            */
        }
    }

    updatePlayerTextMesh(){
        // Remove the previous textMesh if it exists
        if (this.currentTextMesh) {
            this.pickHUD.remove(this.currentTextMesh);
        }

        let text = this.playerName;
        if(this.phase == "pickingEnemy"){
            text = this.automousName;
        }

        // Render the updated player's name
        const { textMesh, dimensions } = this.game.textWriter.createTextMesh(text, 30);
        //based on the this.playerName length vary the x position to always keep it centered

        textMesh.position.set(-dimensions.x/2, window.innerHeight/2 - 100, 1);
    
        // Add the new textMesh to the scene and store a reference to it
        this.pickHUD.add(textMesh);
        this.currentTextMesh = textMesh; // Store a reference for future removal
    }

    updateCamerasInApp(){
        this.app.setCameras(this.cameras, 'front')
    }

    update() {
        if(this.nextState){
            this.game.switchState(this.nextState);
            this.game.state.start();
            this.nextState = null;
            return;
        }

        if(this.needsToUpdatePlayerNameMesh){
            this.updatePlayerTextMesh();
            this.needsToUpdatePlayerNameMesh = false;
        }

        if(this.needsUpdatePickingScreen){
            this.completePickingScreen();
        }
    }
    
}

export { MyMenu};