import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyTrack } from './game/MyTrack.js';
import { MyBallon } from './game/MyBallon.js';
import { MyObstacle } from './game/MyObstacle.js';
import { MyGame } from './game/MyGame.js';
import {MyRoute} from './game/MyRoute.js'
import {MyPowerUp} from './game/MyPowerUp.js'

import { MyFileReader } from './parser/MyFileReader.js';
import { MySceneBuilder } from './MySceneBuilder.js';

/**
 *  This class contains the contents of out application
 */
class MyReader {
    constructor(app, onGameLoaded) {
        this.app = app
        this.onGameLoaded = onGameLoaded;

        this.fileReader = new MyFileReader(this.onSceneLoaded.bind(this));
        this.sceneBuilder = new MySceneBuilder(this.app);
        // this.track = null;
        // this.ballon = null;
        // this.obstacles = [];
        
        // this.loaded = false;
    }

    load(sceneFilePath){
        this.fileReader.open(sceneFilePath);
    }

    /**
     * Called when the scene xml file load is complete
     * @param {MySceneData} data the entire scene data object
     */
    async onSceneLoaded(data) {
        if(this.fileReader.errorMessage !== null) {
            console.error(this.fileReader.errorMessage);
            return;
        }

        // print data for debugging purposes
        console.debug("Data structure:")
        console.debug(data);

        this.onAfterSceneLoadedAndBeforeRender(data);

        await data.onLoadFinished(this.app,this); // do checks and create textures, materials, etc
        // promise is resolved when all textures are loaded and materials are created

        this.scene = this.sceneBuilder.build(data); // constructs root id scene including camera
        
        // load the balllons, object and powerups models
        this.load3DObjectModels(data);

        // construct the game structures
        this.initGameStructures(data);  

        // create a game object and pass the scene to it along with the other game items
        this.game = new MyGame(this.app,this.scene, this.track, this.obstacles, this.powerups, this.balloons, this.routes)

        this.onGameLoaded(this.game);
    }

    load3DObjectModels(data){
        // first load all ballon models
        this.balloonsModels = {};
        for(let i in data.ballonNodesIds){
            let ballonId = data.ballonNodesIds[i];
            // get that node from data
            const node = data.getLOD(ballonId);
            if (node == null){
                console.error("Ballon lod id not found");
            }else{
                this.balloonsModels[ballonId] = this.sceneBuilder.createLOD(node);
            }
        }

        // next load design
        this.obstacleModel = null;
        const obstacleModelId = data.obstacleNodeId;
        if (obstacleModelId != null){
            const node = data.getNode(obstacleModelId);
            if(node == null){
                console.error("Obstacle node id not found");
            }else{
                this.obstacleModel = this.sceneBuilder.createNode(node);
            
            }
        }

        this.powerupModel = null;
        const powerUpModelId= data.powerupNodeId;
        if (powerUpModelId != null){
            const node = data.getNode(powerUpModelId);
            if(node == null){
                console.error("Power Up node id not found");
            }else{
                this.powerupModel = this.sceneBuilder.createNode(node);
            }
        }
    }

    createTrackFromData(data){
        const points = data.path["points"];
        const width = data.path["width"];
        const segments = data.path["segments"];

        // convert points to an arroy of Vector3
        let pointsVectors = [];
        points.forEach( (point) =>{
            pointsVectors.push(new THREE.Vector3(point[0], point[1], 0))
        });

        // get material of the track
        let material, text_lt, text_ls;
        if(data.trackMaterial){
            material = data.trackMaterial.matObj;
            text_lt = data.trackMaterial.texturelength_t || 1;
            text_ls = data.trackMaterial.texturelength_s || 1;
        }else{
            material = new THREE.MeshBasicMaterial({ 
                wireframe: false,
                map: this.app.contents.trackMaterial
             });
             text_ls = 1;
             text_ls = 1;
        }

        // const textureRepeat = 1;
        // const showWireframe = true;
        // const showMesh = true;
        // const showLine = true;
        // const closedCurve = false;
        this.track = new MyTrack(this.app , pointsVectors, segments, width, material, text_ls, text_lt);
    }

    initGameStructures(data){
        // create the track
        if(data.path){
            this.createTrackFromData(data);
        }

        // create routes
        this.routes ={};
        for(let i in data.routes){
            let routeData = data.routes[i];
            const route = new MyRoute(this.app, routeData);
            this.routes[i] = route;
        }

        // load ballons
        this.balloons = {};
        for(let i in data.ballonsData){
            let ballonData = data.ballonsData[i];
         
            // check if the ballon model and route if they exist
            const ballonModelId = ballonData.model;
            const routeId = ballonData.route;

            let ballonModel = null;
            if(ballonModelId){
                ballonModel = this.balloonsModels[ballonModelId];
            }

            let route = null;
            if(routeId){
                route = this.routes[routeId];
            }

            // create the ballon
            this.balloons[i] = new MyBallon(this.app, ballonModel, route);
        }

        // create obstacles
        this.obstacles = [];
        for(let i in data.obstaclesData){
            const obstacledata = data.obstaclesData[i];
            // create obstacle
            const obstacleModel = this.obstacleModel ? this.obstacleModel.clone() : null;
            const obstacle = new MyObstacle(this.app, obstacleModel);
        
            // position obstacle 
            obstacle.move(new THREE.Vector3().fromArray(obstacledata.position))

            // scale obstacle
            obstacle.scale.fromArray(obstacledata.scale);

            obstacle.updateVolumes(); // update bounding boxes

            // add obstacle to list
            this.obstacles.push(obstacle);
        }

        // create powerups 
        this.powerups = [];
        for(let i in data.powerUpsData){
            const powerupdata = data.powerUpsData[i];
            // create obstacle
            const powerupModel = this.powerupModel ? this.powerupModel.clone(): null;
            const powerup = new MyPowerUp(this.app, powerupModel);
        
            // position obstacle 
            powerup.move(new THREE.Vector3().fromArray(powerupdata.position));

            // scale obstacle
            powerup.scale.fromArray(powerupdata.scale);

            powerup.updateVolumes(); // update bounding boxes

            // add obstacle to list
            this.powerups.push(powerup);
        }
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

    createTrack(){
        const texture = new THREE.TextureLoader().load("./images/track.jpg");
        texture.wrapS = THREE.RepeatWrapping;

        const material =new THREE.MeshBasicMaterial({ 
            wireframe: false,
            map: texture
         });

        material.map.repeat.set(10, 3);
        material.map.wrapS = THREE.RepeatWrapping;
        material.map.wrapT = THREE.RepeatWrapping;

        const segments = 200;
        const width = 100;
        // const textureRepeat = 1;
        // const showWireframe = true;
        // const showMesh = true;
        // const showLine = true;
        // const closedCurve = false;
        this.path.forEach(point=>{
            point.multiplyScalar(1500)
        })
        this.track = new MyTrack(this.app , this.path, segments, width, material);
    }

    createBallon(){
        // simple 
        // sphere
        this.ballon = new MyBallon(this.app);
        this.ballon.position.set(0,0,0);
    }

    createObstacles(){
        const material = new THREE.MeshPhongMaterial({
            color: "#ff0000"
        });
        let obstacle = new MyObstacle(this.app, 20, 4, material);
        const startPosition = this.track.meshSegments[0].clone();
        startPosition.y = 10;
        startPosition.x = 10;
        obstacle.position.copy(startPosition);
        this.obstacles.push(obstacle);
    }

    createPowerUps(){
        this.powerUps = [];
        let powerUp = new MyPowerUp(this.app, 10, "life");
        const startPosition = this.track.meshSegments[0].clone();
        startPosition.y = 10;
        powerUp.position.copy(startPosition);
        this.powerUps.push(powerUp);
    }

    init(){
        console.log("MyReader init");

        this.createTrack();
        this.createBallon();
        this.createObstacles();
        this.createPowerUps();

        console.log("MyReader init done");

        const routePoints = [
            { position: new THREE.Vector3(0, 0, 0), time: 0 },
            { position: new THREE.Vector3(0, 2, 2), time: 5 },
            { position: new THREE.Vector3(0, 2, 4), time: 10 },
            { position: new THREE.Vector3(4, 4, 4), time: 15 },
            { position: new THREE.Vector3(3, 2, -3), time: 20 },
            { position: new THREE.Vector3(0, 2, 0), time: 25 },
            { position: new THREE.Vector3(0, 0, 0), time: 30 }
        ]

        routePoints.forEach((point) => {
            point.position.multiplyScalar(100);
        });

        const route = new MyRoute(this.app,routePoints, 30)

        const levels = [
            {
                name : 'first',
                track : this.track, 
                powerups : this.powerUps,
                obstacles : this.obstacles
            }
        ]

        this.game = new MyGame(this.app, this.balloons,[route],levels);
        this.game.start();

        // put game in the app
        this.app.setGame(this.game);

        this.loaded = true;
    }

    loadGame(){
        return this.game;
    }
}

export { MyReader };