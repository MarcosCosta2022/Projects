import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import * as THREE from 'three';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui =  new GUI();
        this.contents = null
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
        
        const data = {  
            'diffuse color': this.contents.diffusePlaneColor,
            'specular color': this.contents.specularPlaneColor,
        };

        this.datgui.add(this.contents.axis, 'visible').name('Show axis');

        // adds a folder to the gui interface for the plane
        const planeFolder = this.datgui.addFolder( 'Plane' );
        planeFolder.addColor( data, 'diffuse color' ).onChange( (value) => { this.contents.updateDiffusePlaneColor(value) } );
        planeFolder.addColor( data, 'specular color' ).onChange( (value) => { this.contents.updateSpecularPlaneColor(value) } );
        planeFolder.add(this.contents, 'planeShininess', 0, 1000).name("shininess").onChange( (value) => { this.contents.updatePlaneShininess(value) } );
        planeFolder.open();

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective 1', 'Perspective 2','Corner 1','Corner 2', 'Left', 'Right', 'Front', 'Back','Top' ]).name("active camera");
        // note that we are using a property from the app 
        cameraFolder.add(this.app.activeCamera.camera.position, 'x', -20, 20).name("x coord")
        cameraFolder.add(this.app.activeCamera.camera.position, 'y', 0, 30).name("y coord")
        cameraFolder.add(this.app.activeCamera.camera.position, 'z', -20, 20).name("z coord")
        cameraFolder.open()

        // New folder for the floor texture properties
        const textureFolder = this.datgui.addFolder('Floor Texture');

        // Wrapping mode U
        const wrappingModes = {
            "Clamp": 0,
            "Repeat": 1,
            "Mirror Repeat": 2,
        };
        textureFolder.add(this.contents, 'wrapModeU', wrappingModes).name("Wrapping mode U").onChange(value => {
            this.updateWrappingMode('U', value);
        });

        // Wrapping mode V
        textureFolder.add(this.contents, 'wrapModeV', wrappingModes).name("Wrapping mode V").onChange(value => {
            this.updateWrappingMode('V', value);
        });

        // Repeat U
        textureFolder.add(this.contents, 'repeatU', 1, 50).name("Repeat U").onChange(value => {
            this.contents.floorTexture.repeat.set(value, this.contents.floorTexture.repeat.y);
            this.contents.floorTexture.needsUpdate = true; // Notify Three.js that the texture needs to be updated
           

        });

        // Repeat V
        textureFolder.add(this.contents, 'repeatV', 1, 50).name("Repeat V").onChange(value => {
            this.contents.floorTexture.repeat.set(this.contents.floorTexture.repeat.x, value);
            this.contents.floorTexture.needsUpdate = true; // Notify Three.js that the texture needs to be updated
        });

        // Offset U
        textureFolder.add(this.contents, 'offsetU', -1, 1).name("Offset U").onChange(value => {
            this.contents.floorTexture.offset.set(value, this.contents.floorTexture.offset.y);
            this.contents.floorTexture.needsUpdate = true; // Notify Three.js that the texture needs to be updated
        });

        // Offset V
        textureFolder.add(this.contents, 'offsetV', -1, 1).name("Offset V").onChange(value => {
            this.contents.floorTexture.offset.set(this.contents.floorTexture.offset.x, value);
            this.contents.floorTexture.needsUpdate = true; // Notify Three.js that the texture needs to be updated
        });

        // Rotation
        textureFolder.add(this.contents, 'rotation', 0, Math.PI * 2).name("Rotation").onChange(value => {
            this.contents.floorTexture.rotation = value;
            this.contents.floorTexture.needsUpdate = true; // Notify Three.js that the texture needs to be updated
        });

        textureFolder.close();

        // add a light ffolder
        const lightFolder = this.datgui.addFolder('Light')
        
        const ambientLightFolder = lightFolder.addFolder('Ambient Light');
        ambientLightFolder.addColor(this.contents.ambientLight, 'color').name('ambient color');
        ambientLightFolder.add(this.contents.ambientLight, 'intensity', 0, 100).name('ambient intensity');
        ambientLightFolder.close();

        // add another folder inside light folder called spot light
        const spotLightFolder = lightFolder.addFolder('Spot Light')
        // add a property to the spot light folder
        
        spotLightFolder.add(this.contents.spotLight, 'visible').name('Enabled');
        spotLightFolder.add(this.contents, 'showSpotLightHelper', false).name('helper').onChange((value) => {this.contents.toggleSpotLightHelper(value)});
        spotLightFolder.addColor(this.contents.spotLight, 'color').name('color');
        spotLightFolder.add(this.contents.spotLight, 'intensity', 0, 100).name('intensity');
        spotLightFolder.add(this.contents.spotLight, 'distance', 0 , 100).name('distance').onChange(() => {this.contents.updateSpotLightHelper()});
        spotLightFolder.add(this.contents, 'spotLightAngle', 0, 90).name('angle').onChange((value) => {this.contents.spotLight.angle = value * Math.PI / 180; this.contents.updateSpotLightHelper()});
        spotLightFolder.add(this.contents.spotLight, 'penumbra', 0, 1).name('penumbra').onChange(() => {this.contents.updateSpotLightHelper()});
        spotLightFolder.add(this.contents.spotLight, 'decay', 0, 2).name('decay');
        spotLightFolder.add(this.contents.spotLight, 'castShadow').name('castShadow');
        spotLightFolder.add(this.contents, 'spotLightMapSize', 1024, 4096).name('mapSize').step(1).onChange(() =>{
            this.contents.updateSpotLightShadowMapSize();
        });
        const spotLightPosition = spotLightFolder.addFolder('Position');
        spotLightPosition.add(this.contents.spotLight.position, 'x', 0, 50).name('X coord').onChange(() => {this.contents.updateSpotLightHelper()});
        spotLightPosition.add(this.contents.spotLight.position, 'y', 0, 50).name('y coord').onChange(() => {this.contents.updateSpotLightHelper()});
        const spotLightTarget = spotLightFolder.addFolder('Target');
        spotLightTarget.add(this.contents.spotLight.target.position, 'x', 0, 50).name('X coord').onChange(() => {this.contents.updateSpotLightHelper()});
        spotLightTarget.add(this.contents.spotLight.target.position, 'y', 0, 50).name('y coord').onChange(() => {this.contents.updateSpotLightHelper()});
        spotLightFolder.close();

        const pointLightFolder = lightFolder.addFolder('Flame Light');
        pointLightFolder.add(this.contents.pointLight ,'visible').name('Enabled');
        pointLightFolder.add(this.contents.pointLight, 'castShadow').name('castShadow');
        pointLightFolder.add(this.contents.pointLight, 'intensity', 0, 30).name('intensity');
        pointLightFolder.close();

        lightFolder.add(this.contents.portraitsLight,'visible').name('Portraits light enabled');
        lightFolder.add(this.contents.paitingLight,'visible').name('Painting light enabled');

        lightFolder.close();

        //this.datgui.add(this.app.contents.carpet.points, 'visible').name('Show control points');
    }

    // Helper function to update wrapping modes
    updateWrappingMode(axis, value) {
        const mode = value === 0 ? THREE.ClampToEdgeWrapping : value === 1 ? THREE.RepeatWrapping : THREE.MirroredRepeatWrapping;
        if (axis === 'U') {
            this.contents.floorTexture.wrapS = mode;
        } else {
            this.contents.floorTexture.wrapT = mode;
        }
        this.contents.floorTexture.needsUpdate = true; // Notify Three.js that the texture needs to be updated
    }
}

export { MyGuiInterface };