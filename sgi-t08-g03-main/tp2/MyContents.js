import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyFileReader } from './parser/MyFileReader.js';
import { MySceneBuilder } from './MySceneBuilder.js';


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

        // adde these two lines
        this.defaultMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });
        this.sceneBuilder = new MySceneBuilder(this.app);

        this.reader = new MyFileReader(this.onSceneLoaded.bind(this));
        
        const sceneFile = "scenes/T08_G03/scene.json";
        this.reader.open(sceneFile);

        this.cameras = null;
        this.sceneNeedsUpdate = false;
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
    }

    /**
     * Called when the scene xml file load is complete
     * @param {MySceneData} data the entire scene data object
     */
    onSceneLoaded(data) {
        if(this.reader.errorMessage !== null) {
            console.error(this.reader.errorMessage);
            return;
        }

        // print data for debugging purposes
        console.debug("Data structure:")
        console.debug(data);

        this.onAfterSceneLoadedAndBeforeRender(data);

        const promise = data.onLoadFinished(this.app,this); // do checks and create textures, materials, etc
        // promise is resolved when all textures are loaded and materials are created

        // construct the scene
        promise.then(() => { // after all textures are loaded and materials are created, we can build the scene
            this.sceneBuilder.build(data); // constructs scene including cameras
            this.sceneNeedsUpdate = true; // we set to update scene in the first update call aftee the scene is loaded to be loaded in the first update that follows
        });
    }

    output(obj, indent = 0) {
        console.log("" + new Array(indent * 4).join(' ') + " - " + obj.type + " " + (obj.id !== undefined ? "'" + obj.id + "'" : ""))
    }

    printYASF(data, indent = '') {
        for (let key in data) {
            if (typeof data[key] === 'object' && data[key] !== null) {
                console.log(`${indent}${key}:`);
                this.printYASF(data[key], indent + '\t');
            } else {
                console.log(`${indent}${key}: ${data[key]}`);
            }
        }
    }

    onAfterSceneLoadedAndBeforeRender(data) {
        //this.printYASF(data)
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

    update() {
        if (this.sceneNeedsUpdate) { // update the scene only once when it's loaded
            this.sceneNeedsUpdate = false;
            this.updateScene();
        }
    }
}

export { MyContents };
