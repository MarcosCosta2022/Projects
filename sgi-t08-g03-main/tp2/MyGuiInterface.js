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

        this.lightParameters = {};
        this.fogParameters = {};
        this.nodeParameters = {};
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
    }

    /**
     * Add functionality to the gui interface
     */
    addFunctions(){
        this.addCameras();

        // add axis or close it
        const axis = this.app.contents.sceneBuilder.axis;
        this.datgui.add(axis, 'visible').name('Show Axis');

        // add wireframe option
        this.addWireframeOption();

        // add background color option
        const scene = this.app.contents.sceneBuilder.scene;
        this.datgui.addColor(scene, 'background').name('Background');

        // amient light optionnts
        this.addAmbientLightOptions();

        this.addFogControls();

        this.addLightsControls();
    }

    addFogControls(){
        // add a folder for the fog
        let folder = this.datgui.addFolder('Fog');

        let fog = this.app.contents.sceneBuilder.scene.fog;

        // add a checkbox to enable/disable the fog
        folder.addColor(fog, 'color').name('Color');
        const far = Math.max(fog.far*2, 100);
        const near = Math.min(fog.near*2, far);
        folder.add(fog, 'near', 0, near).name('Near');
        folder.add(fog, 'far', 0, far).name('Far');

        folder.close();
    }

    addWireframeOption() {
        this.datgui.add(this.app.contents.sceneBuilder, 'wireframe').name('Wireframe').onChange((value) => {
            this.app.contents.sceneBuilder.setWireframe(value);
        });
    }



    /**
     * Update the gui interface
     */
    addCameras() {
        let cameraNames = this.app.getCameraNames();
        this.datgui.add(this.app, 'activeCameraName', cameraNames).name('Camera').onChange((value) => {
            this.app.setActiveCamera(value);
        });
    }

    /**
     * Add options for the ambient light
     */
    addAmbientLightOptions() {
        let light = this.app.contents.sceneBuilder.ambientLight;
        let folder = this.datgui.addFolder('Ambient Light');
        folder.addColor(light, 'color').name('Color');
        folder.add(light, 'intensity', 0, 10).name('Intensity');
        folder.close();
    }

    /**
     * Add options for the lights
     */
    addLightsControls() {
        // create folder
        let folder = this.datgui.addFolder('Lights');

        // add a list of lights ids to the gui interface
        this.lightsids = Object.keys(this.app.contents.sceneBuilder.lights);

        this.param ={
            selectedLightId: this.lightsids[0]? this.lightsids[0]: ''
        }

        // add a list in the gui interface to select the light
        folder.add(this.param, 'selectedLightId', this.lightsids).name('Lights').onChange((value) => {
            this.openFolder(value);
        });

        // for every light, create a dedicated folder
        for (let i = 0; i < this.lightsids.length; i++) {
            this.addLightDedicatedFolder(folder, this.lightsids[i]);
        }

        // set the first light as the selected light
        if (this.lightsids.length > 0){
            this.openFolder(this.lightsids[0]);
        }

        // close the folder
        folder.close();
    }

    hideFolder(folder){
        folder.domElement.style.display = "none";
    }

    showFolder(folder){ 
        folder.domElement.style.display = "block";
    }

    openFolder(lightid){
        // Hide all folders
        for (let key in this.lightParameters) {
            this.hideFolder(this.lightParameters[key].folder);
        }

        // Show the selected folder
        if (this.lightParameters[lightid]) {
            this.showFolder(this.lightParameters[lightid].folder);
        }
    }


    /**
     * 
     * @param {*} parentFolder 
     * @param {*} lightid 
     */

    addLightDedicatedFolder(parentFolder, lightid){
        // create folder
        let folder = parentFolder.addFolder('Light ' + lightid);

        // get light object
        let light = this.app.contents.sceneBuilder.lights[lightid];

        // create corresponding parameters
        let parameters = {
            folder: folder,
            lights: light,
            visible : light[0].light.visible,
            color: light[0].light.color,
            helper: false,
            intensity: light[0].light.intensity,
            castShadow: light[0].light.castShadow,
            shadowMapSize: light[0].light.shadow.mapSize.width
        };

        // store parameters
        this.lightParameters[lightid] = parameters;

        // add a enable/disable checkbox
        folder.add(this.lightParameters[lightid], 'visible').name('Visible').onChange((value)=>{
            this.app.contents.sceneBuilder.setLightProperty(light, "visible", value);
        });

        // add option to change the color of the light
        folder.addColor(this.lightParameters[lightid], 'color').name('Color').onChange((value)=>{
            this.app.contents.sceneBuilder.setLightProperty(light, "color", value);
        });

        folder.add(this.lightParameters[lightid], 'helper').name('Helper').onChange((value)=>{
            this.app.contents.sceneBuilder.setLightHelper(light,value);
        });

        const limitInt = Math.max(light[0].light.intensity*2, 30);
        folder.add(this.lightParameters[lightid], 'intensity', 0, limitInt).name('Intensity').onChange((value)=>{
            this.app.contents.sceneBuilder.setLightProperty(light, "intensity", value);
        });

        folder.add(this.lightParameters[lightid], 'castShadow').name('Cast Shadow').onChange((value)=>{
            this.app.contents.sceneBuilder.setLightProperty(light, "castShadow", value);
        });

        const limit = Math.max(light[0].light.shadow.mapSize.width,4096);
        folder.add(this.lightParameters[lightid], 'shadowMapSize', 512, limit).step(1).name('Shadow Map Size').onChange((value)=>{
            this.app.contents.sceneBuilder.setShadowMapSize(light, value);
        });

        // add options specific to the type of light

        this.addLightSpecificOptions(folder, parameters, light);

    }

    addLightSpecificOptions(folder, param, light){
        if (light[0].light instanceof THREE.PointLight){
            this.addPointLightOptions(folder, param, light);
        } else if (light[0].light instanceof THREE.SpotLight){
            this.addSpotLightOptions(folder, param, light);
        }else if (light[0].light instanceof THREE.DirectionalLight){
            this.addDirectionalLightOptions(folder, param, light);
        }
    }

    addPointLightOptions(folder, param, light){
        // add a folder for the point light
        param.distance = light[0].light.distance;
        param.decay = light[0].light.decay; 

        const limit = Math.max(light[0].light.distance*2, 100);
        folder.add(param, 'distance', 0, limit).name('Distance').onChange((value)=>{
            this.app.contents.sceneBuilder.setLightProperty(light, "distance", value, true);
        });

        folder.add(param, 'decay', 0, 2).name('Decay').onChange((value)=>{
            this.app.contents.sceneBuilder.setLightProperty(light, "decay", value);
        });
    }

    addSpotLightOptions(folder, param, light){

        param.distance = light[0].light.distance;
        param.angle = light[0].light.angle * 180 / Math.PI;
        param.penumbra = light[0].light.penumbra;
        param.decay = light[0].light.decay;


        const limit = Math.max(light[0].light.distance*2, 100);
        folder.add(param, 'distance', 0, limit).name('Distance').onChange((value)=>{
            this.app.contents.sceneBuilder.setLightProperty(light, "distance", value, true);
        });

        folder.add(param, 'angle', 0, 90).name('Angle').onChange((value)=>{
            this.app.contents.sceneBuilder.setLightProperty(light, "angle", value * Math.PI / 180 , true);
        });

        folder.add(param, 'penumbra', 0, 1).name('Penumbra').onChange((value)=>{
            this.app.contents.sceneBuilder.setLightProperty(light, "penumbra", value);
        });

        folder.add(param, 'decay', 0, 2).name('Decay').onChange((value)=>{
            this.app.contents.sceneBuilder.setLightProperty(light, "decay", value);
        });
    
    }

    addDirectionalLightOptions(folder, param, light){
    
    }

    
}

export { MyGuiInterface };