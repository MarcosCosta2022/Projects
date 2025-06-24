import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyFileReader } from './parser/MyFileReader.js';
import { MySceneBuilder } from './MySceneBuilder.js';
import { MyReader } from './MyReader.js';
import {MyGame} from './game/MyGame.js';
import { MyTextWriter } from './MyTextWriter.js';


/**
 *  This class contains the contents of out application
 */
class MyContents  {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app
        this.axis = null

        this.textureLoader = new THREE.TextureLoader();
        this.reader = new MyReader(this.app, this.onGameLoaded.bind(this));
        this.loadTextures();
    }

    /**
     * initializes the contents
     */
    init() {
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.app.scene.add(this.axis)
        }

        this.game = null;        
        this.reader.load("scenes/game/scene.json");
    }

    /**
     * Called when the game is loaded
     */
    onGameLoaded(game){
        this.game = game;
        this.game.start();
    }

    updateScene(){
        if (this.sceneBuilder.scene !== null){ // update scene in app
            this.app.scene = this.sceneBuilder.scene;
        }

        // update the cameras in the app and gui
        if (this.sceneBuilder.cameras !== null){
            this.app.cameras = this.sceneBuilder.cameras;
            this.app.setActiveCamera(this.sceneBuilder.startingCameraId);
            this.app.updateCameraIfRequired();

            // update the gui 
            this.app.gui.addFunctions();
        }
    }

    loadTextures(){
        this.trackMaterial = this.textureLoader.load("./images/track.jpg");
        this.compassTexture = this.textureLoader.load('./images/compass.jpg');
        this.metalTexture = this.textureLoader.load('./images/metal.jpg');

        this.goldColorTexture = this.textureLoader.load('./images/gold/color.jpg');
        this.goldDisplacementTexture = this.textureLoader.load('./images/gold/displacement.tiff');
        this.goldMetallicTexture = this.textureLoader.load('./images/gold/metallic.jpg');
        this.goldNormalTexture = this.textureLoader.load('./images/gold/normal.png');
        this.goldRoughnessTexture = this.textureLoader.load('./images/gold/roughness.jpg');
        this.goldMaterial = new THREE.MeshStandardMaterial({
            map: this.goldColorTexture, // Base color
            normalMap: this.goldNormalTexture, // Normal map for surface details
            roughnessMap: this.goldRoughnessTexture, // Roughness for light scattering
            metalnessMap: this.goldMetallicTexture, // Metallic property for shiny appearance
            displacementMap: this.goldDisplacementTexture, // Displacement map for height variations
            displacementScale: 1, // Adjust this based on your displacement texture intensity
            displacementBias: -0.05 // Optional: Bias for fine-tuning
        });
        
        // Optional: Set additional properties
        this.goldMaterial.metalness = 0.7; // Fully metallic (or adjust as needed)
        this.goldMaterial.roughness = 0.5; // Mid-level roughness (adjust as needed)

        this.concreteTexture = this.textureLoader.load('./images/concrete.jpg')
        this.finishLineTexture = this.textureLoader.load('./images/finishline.jpg')
    }

    addBillBoard(mesh){
        if(!this.billboards){
            this.billboards = []
        }
        console.log("Adding mesh")
        this.billboards.push(mesh);
    }

    getScene(){
        if (this.game && this.game.getScene()){
            return this.game.getScene();
        }
        return this.app.scene;
    }

    getHUD(){
        if (this.game && this.game.getHUD()){
            return this.game.getHUD();
        }
        return null;
    }

    update() {
        if (this.game){
            this.game.update()
        }

        // if(this.billboards){
        //     this.billboards.forEach((billboard) => {
        //         const position = new THREE.Vector3();
        //         billboard.getWorldPosition(position);
        //         console.log(position)
        //         billboard.lookAt(this.app.activeCamera.position);
        //     });
        // }
    }
}

export { MyContents };
