import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';
import * as THREE from 'three';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app;
        this.datgui =  new GUI();

        this.app.setGui(this); // added this line so the GUI is accessible from the app

        this.cameraFolder = null;
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Initialize the gui interface
     */
    init() {
        this.createCamerasFolder();
    }

    createCamerasFolder(){
        // get cameras IDS
        this.camerasIds = this.app.getCameraNames();

        // create folder
        if(this.cameraFolder == null){
            this.cameraFolder = this.datgui.addFolder('Camera')
        }
        this.cameraFolder.add(this.app, 'activeCameraName', this.camerasIds).name("active camera").onChange((value)=>{
            this.app.setActiveCamera(value);
        })
        this.cameraFolder.open()
    }

    resetCamerasFolder(){
        // remove everything from the cameraFolder
        if (this.cameraFolder){
            // Remove all controllers from the folder
            const controllers = [...this.cameraFolder.children]; // Copy to avoid mutation issues
            for (let controller of controllers) {
                controller.destroy(); // Proper way to remove controllers
            }
        }
        this.createCamerasFolder();
    }

    
}

export { MyGuiInterface };