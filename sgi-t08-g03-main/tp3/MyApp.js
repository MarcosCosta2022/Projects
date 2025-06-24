
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MyContents } from './MyContents.js';
import { MyGuiInterface } from './MyGuiInterface.js';
import Stats from 'three/addons/libs/stats.module.js'
import {MyGame} from './game/MyGame.js'

/**
 * This class contains the application object
 */
class MyApp  {
    /**
     * the constructor
     */
    constructor() {
        this.debug = true

        this.scene = null
        this.stats = null

        // camera related attributes
        this.activeCamera = null
        this.activeCameraName = null
        this.lastCameraName = null
        this.cameras = []
        this.frustumSize = 20;
        this.hudFrustumSize = 10;

        // other attributes
        this.renderer = null
        this.controls = null
        this.gui = null
        this.axis = null
        this.contents == null

        this.game = null

        this.clock = new THREE.Clock()
        this.deltaTime = 0
    }

    /**
     * initializes the application
     */
    init() {
                
        // Create an empty scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x101010 );

        this.stats = new Stats()
        this.stats.showPanel(1) // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom)

        this.initCameras();
        this.setActiveCamera('default')

        // Create a renderer with Antialiasing
        this.renderer = new THREE.WebGLRenderer({antialias:true});
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setClearColor("#000000");
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;
        this.renderer.autoClear = false; // Prevent clearing the color buffer

        // Configure renderer size
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        // Append Renderer to DOM
        document.getElementById("canvas").appendChild( this.renderer.domElement );

        // manage window resizes
        window.addEventListener('resize', this.onResize.bind(this), false );

        this.keyStates = {
            "ArrowUp": false,
            "ArrowDown": false,
            "w": false,
            "s":false
        }

        this.keyClicks = {}

        // manage key events
        document.addEventListener('keydown', this.onDocumentKeyDown.bind(this), false );
        document.addEventListener('keyup', this.onDocumentKeyUp.bind(this), false );
        document.addEventListener(
            // "pointermove",
            // "mousemove",
            "pointerdown",
            // list of events: https://developer.mozilla.org/en-US/docs/Web/API/Element
            this.onMouseClick.bind(this)
        );

        // HUD (Heads-Up Display) scene and camera
        this.hudCamera = new THREE.OrthographicCamera( window.innerWidth/2, window.innerWidth/2,window.innerHeight/2, window.innerHeight/2, 0, 2000);
        this.hudCamera.position.z = 100; // doesnt make a difference in the rendered scene (if all objects have z less than the cameras)

        // Create a square as an example HUD object
        this.hudScene = new THREE.Scene();
        const hudGeometry = new THREE.PlaneGeometry(10, 10);
        const hudMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00
        });
        const hudSquare = new THREE.Mesh(hudGeometry, hudMaterial);

        // Make HUD background transparent
        this.hudScene.background = null;

        // Add the square to the HUD scene
        this.hudScene.add(hudSquare);
    }

    onMouseClick(event){
        // pass this to game
        if(this.contents && this.contents.game){
            this.contents.game.onMouseClick(event);
        }
    }

    wasKeyClicked(key){
        let res = this.keyClicks[key];
        this.keyClicks[key] = false;
        return res;
    }

    clickedButton(key){
        let res = false;
        const isKeyDown = this.isKeyDown(key);
        if(isKeyDown && !this.buttonClicks[key]){ res = true
            console.log("Clicked button: " + key)
        }
        this.buttonClicks[key] = isKeyDown;
        return res;
    }

    onDocumentKeyDown(event) {
        this.keyStates[event.key] = true; // the difference is that clicks can be overwritten to become false before the user lets go of the button similar to if we were calling a funcio
        this.keyClicks[event.key] = true;
        if(this.contents && this.contents.game){
            this.contents.game.onKeyDown(event.key);
        }
    }

    onDocumentKeyUp(event) {
        this.keyStates[event.key] = false;
        this.keyClicks[event.key] = false;
    }

    /**
     * initializes all the cameras
     */
    initCameras() {
        const aspect = window.innerWidth / window.innerHeight;

        // Create a basic perspective camera
        const perspective1 = new THREE.PerspectiveCamera( 75, aspect, 0.1, 1000 )
        perspective1.position.set(10,10,3)
        perspective1.target = new THREE.Vector3();
        perspective1.far = 10000;
        this.cameras['default'] =  perspective1;
        this.defaultCamera = perspective1;

        // save these cameras 
        this.appCameras = this.cameras;
    }

    resetCameras(){
        this.setCameras(this.appCameras, 'default');
    }

    /**
     * Set cameras
     */
    setCameras(cameras, activeCameraName){
        this.cameras = cameras;
        this.cameras['default'] = this.defaultCamera;
        this.setActiveCamera(activeCameraName);
        this.updateCameraIfRequired();
        // restart cameras folder in GUI
        this.gui.resetCamerasFolder();
    }

    /**
     * sets the active camera by name
     * @param {String} cameraName 
     */
    setActiveCamera(cameraName) {   
        console.log("Setting camera to: " + cameraName)

        // check if the camera exists
        if (this.cameras[cameraName] === undefined) {
            console.error("Camera " + cameraName + " does not exist")
            return
        }

        this.activeCameraName = cameraName
        this.updateActiveCamera = true;
    }

    getActiveCamera() {
        return this.cameras[this.activeCameraName]
    }

    /**
     *  returns the camera names
     * 
     * @returns the camera names
     */
    getCameraNames() {
        return Object.keys(this.cameras)
    }

    /**
     * updates the active camera if required
     * this function is called in the render loop
     * when the active camera name changes
     * it updates the active camera and the controls
     */
    updateCameraIfRequired() {
        // camera changed?
        if (this.lastCameraName !== this.activeCameraName || this.updateActiveCamera) {
            console.log("Updating camera to " + this.activeCameraName)
            this.lastCameraName = this.activeCameraName;
            this.activeCamera = this.cameras[this.activeCameraName]
            document.getElementById("camera").innerHTML = this.activeCameraName
           
            // call on resize to update the camera aspect ratio
            // among other things
            this.onResize()

            // are the controls yet?
            if (this.controls === null) {
                // Orbit controls allow the camera to orbit around a target.
                this.controls = new OrbitControls( this.activeCamera, this.renderer.domElement );
                this.controls.enableZoom = true;
                this.controls.update();
            }
            else {
                this.controls.object = this.activeCamera
            }

            // apply camera orbit control settins 
            this.applyOrbitControlSettings(this.activeCamera.orbitControlSettings)

            // change the target of the orbit controls
            if (this.activeCamera.target !== undefined) {
                this.controls.target = this.activeCamera.target
            }

            this.updateActiveCamera = false;
        }
    }

    applyOrbitControlSettings(settings){

        if(settings && settings.enabled != null){
            this.controls.enabled = settings.enabled;
        }else{
            this.controls.enabled = true;
        }

        if(settings && settings.enablePan != null){
            this.controls.enablePan = settings.enablePan;
        }else{
            this.controls.enablePan = true;
        }
        if(settings && settings.enableZoom != null){
            this.controls.enableZoom = settings.enableZoom;
        }else{
            this.controls.enableZoom = true;
        }
        if(settings && settings.enableRotate != null){
            this.controls.enableRotate = settings.enableRotate;
        }else{
            this.controls.enableRotate = true;
        }
    }

    /**
     * the window resize handler
     */
    onResize() {
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            this.activeCamera.aspect = window.innerWidth / window.innerHeight;
            this.activeCamera.updateProjectionMatrix();
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize( window.innerWidth, window.innerHeight );
        }

        // Update HUD orthographic camera
        this.hudCamera.left = -window.innerWidth / 2;
        this.hudCamera.right = window.innerWidth / 2;
        this.hudCamera.top = window.innerHeight / 2;
        this.hudCamera.bottom = -window.innerHeight / 2;
        this.hudCamera.updateProjectionMatrix();
    }
    /**
     * 
     * @param {MyContents} contents the contents object 
     */
    setContents(contents) {
        this.contents = contents;
    }

    /**
     * @param {MyGuiInterface} contents the gui interface object
     */
    setGui(gui) {   
        this.gui = gui
    }

    /**
     * @param {MyGame} game the game object
     */
    setGame(game){
        this.game = game
    }

    /**
    * the main render function. Called in a requestAnimationFrame loop
    */
    render () {
        this.stats.begin()
        this.updateCameraIfRequired()
        this.lastCameraName = this.activeCameraName

        // get the delta time
        this.deltaTime = this.clock.getDelta() // in seconds

        // update the animation if contents were provided
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            this.contents.update()
        }

        // required if controls.enableDamping or controls.autoRotate are set to true
        this.controls.update();

        // get the scene
        const scene = this.contents.getScene();

        // render the scene
        this.renderer.clear();
        this.renderer.render(scene,this.activeCamera);

        // Render the HUD
        const hudScene = this.contents.getHUD();
        if (hudScene !== null) {
            this.renderer.clearDepth(); // Clear depth buffer to render HUD on top
            this.renderer.render(hudScene, this.hudCamera);
        }

        // subsequent async calls to the render loop
        requestAnimationFrame( this.render.bind(this) );
        this.stats.end()
    }

}


export { MyApp };