import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { MyNurbsBuilder } from './MyNurbsBuilder.js';
import { MyFlower } from './objects/MyFlower.js';
import { MyFrame } from './objects/MyFrame.js'; 
import { MyBeetle } from './objects/MyBeetle.js';
import { MyChair } from './objects/MyChair.js';
import { MyTable } from './objects/MyTable.js';
import { MyPlate } from './objects/MyPlate.js';
import { MyNewspaper } from './objects/MyNewspaper.js';
import { MyPainting } from './objects/MyPainting.js';
import { MyWindow } from './objects/MyWindow.js';
import { MyCup } from './objects/MyCup.js';
import { MyJar } from './objects/MyJar.js';
import { MyCarpet } from './objects/MyCarpet.js';
import { MyFurniture } from './objects/MyFurniture.js';
import { MyCake } from './objects/MyCake.js';
import { MySpring } from './objects/MySpring.js';



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
        
        this.loadTextures();

        // Texture properties
        this.wrapModeU = 1; // 0: Clamp, 1: Repeat, 2: Mirror Repeat
        this.wrapModeV = 1; // 0: Clamp, 1: Repeat, 2: Mirror Repeat
        this.repeatU = 5; // Default repeat in U
        this.repeatV = 5; // Default repeat in V
        this.offsetU = 0; // Default offset in U
        this.offsetV = 0; // Default offset in V
        this.rotation = 0; // Default rotation in radians

        // Apply initial texture properties
        this.updateTextureProperties();

        // Plane material properties
        this.diffusePlaneColor =  "#FFFFFF"
        this.specularPlaneColor = "#000000"
        this.planeShininess = 10

        // wall materials - all difuse
        this.wallMaterials = [];
        this.planeMaterial = new THREE.MeshPhongMaterial({
            map : this.planeTexture
        });
        this.wallMaterials.push(this.planeMaterial);
        this.wallBottomMaterial = new THREE.MeshPhongMaterial({
            map : this.wallBottomTexture });
        this.wallMaterials.push(this.wallBottomMaterial);
        this.wallSideMaterialLeft = new THREE.MeshPhongMaterial({
            map : this.wallSideTextureLeft });
        this.wallMaterials.push(this.wallSideMaterialLeft);
        this.wallSideMaterialRigth = new THREE.MeshPhongMaterial({
            map : this.wallSideTextureRight });
        this.wallMaterials.push(this.wallSideMaterialRigth);
        this.wallTopMaterial = new THREE.MeshPhongMaterial({
            map : this.wallTopTexture }); 
        this.wallMaterials.push(this.wallTopMaterial);
        for(let i = 0;i < this.wallMaterials.length; i++){
            this.wallMaterials[i].color.set(this.diffusePlaneColor);
            this.wallMaterials[i].specular.set("#000000");
        }
        

        // Table Material
        this.tableMaterialStone = new THREE.MeshPhongMaterial({
            map : this.tableTexture });
        this.tableLegMaterial = new THREE.MeshPhongMaterial({
            map : this.tableTexture ,
            specular: "#d0805a", // Brighter specular color for added shine
            shininess: 80, // Increased shininess for a glossier effect
        });

        this.frameMaterial = new THREE.MeshPhongMaterial({
             map: this.frameTexture });
        this.windowMaterial = new THREE.MeshPhongMaterial({ map: this.textureWindow });
        this.windowFrameMaterial = new THREE.MeshPhongMaterial({ map: this.textureFrameBox });
        this.chairMaterial = new THREE.MeshPhongMaterial({ map: this.textureChair });
        this.chairBackMaterial = new THREE.MeshPhongMaterial({ map: this.textureChairBack });
        this.chairLegMaterial = new THREE.MeshPhongMaterial({ map: this.textureChairLeg });
        this.carpetMaterial = new THREE.MeshPhongMaterial({ map: this.textureCarpet,
            side: THREE.DoubleSide,
         });
        this.texturedDrawerMaterial = new THREE.MeshPhongMaterial({ map: this.textureFurniture });
        this.defaultDrawerMaterial = new THREE.MeshPhongMaterial({ map: this.restOfDrawer }); 
        this.cakeSideMaterial = new THREE.MeshPhongMaterial({ map: this.textureCakeSide ,
            color: '#888888',
        });
        this.jarMaterial = new THREE.MeshPhongMaterial({ map: this.textureVase ,
            side: THREE.DoubleSide,
        });
        this.floorMaterial = new THREE.MeshPhongMaterial({
            map: this.floorTexture
        });

        // Table material: Polished wood
        this.tableMaterial = new THREE.MeshPhongMaterial({
            color: "#d2691e",  // lighter brown
            specular: "#774411",  // wood-like reflection
            emissive: "#221100",  // subtle dark emissive
            shininess: 60  // higher shininess for polished wood
        });

        // Plate material: Ceramic white with slight shine
        this.plateMaterial = new THREE.MeshPhongMaterial({
            color: "#ffffff",  // clean white
            specular: "#333333",  // bright reflection
            emissive: "#000000",  // no emissive light
            shininess: 30,  // high shininess for ceramic
            side: THREE.DoubleSide
        });


        this.cakeMaterialExterior = new THREE.MeshStandardMaterial({
            map: this.textureCakeTop,
            roughness: 0.5,        // Adds a rough, matte feel for a cakey look
            bumpMap: this.textureCakeTop,
            bumpScale: 0.5,
        });

        // Flame material: Bright yellow-orange
        this.flameMaterial = new THREE.MeshPhongMaterial({
            color: "#ff8c00",  // flame orange
            specular: "#ffcc33",  // bright reflection
            emissive: "#ff4500",  // glowing emissive
            shininess: 100  // very shiny
        });

        // Candle material: Wax-like white
        this.candleMaterial = new THREE.MeshPhongMaterial({
            color: "#f0e68c",  // pale yellow (wax)
            specular: "#cccccc",  // mild reflection
            emissive: "#333333",  // very subtle dark emissive
            shininess: 50  // moderate shininess
        });

        // Cup material: Bright, clean ceramic
        this.cupMaterial = new THREE.MeshPhongMaterial({
            color: "#e0e0e0",  // light cyan
            specular: "#cceeff",  // bright reflection
            emissive: "#111111",  // subtle emissive for depth
            shininess: 70, // high shininess for ceramic look
            opacity: 0.7,
            transparent: true,
            side: THREE.DoubleSide
        });

        
        this.beetleMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        this.canvasMaterial = new THREE.MeshPhongMaterial({
             map : this.canvasTexture ,
            color: "#ffffff",  // white
            specular: "#111111",  // white reflection
            emissive: "#000000",  // no emissive
        });


        this.spotLight = null;
        this.spotLightAngle = 25;
        this.spotLightHelper = null;
        this.showSpotLightHelper = false;
        
        this.cubeCamera = new THREE.CubeCamera(1, 1000, 256);
        this.app.scene.add(this.cubeCamera);

        this.springMaterial = new THREE.MeshPhongMaterial({
            color: 0x666666,    // Base color of the spring (gray for metal)
            specular: 0xffffff, // Highlight color (brighter gray for reflective highlights)
            shininess: 100,     // Controls the shininess (higher value for a more metallic look)
            emissive: 0x000000, // No emissive color for a metallic look
            reflectivity: 1,    // High reflectivity for a metallic surface
        });
        

        this.newspaperTexture.wrapS = THREE.RepeatWrapping;
        this.newspaperTexture.wrapT = THREE.RepeatWrapping;
        this.newspaperTexture.rotation = Math.PI/2;
        this.rightPageTexture = this.newspaperTexture.clone();
        // the texture contains both pages, so we need to scale it to show only one page
        this.rightPageTexture.repeat.set(0.5,1);
        // offset
        this.rightPageTexture.offset.set(0.5,0);
        this.rightPageMaterial = new THREE.MeshPhongMaterial({
            // color of a newspaper page
            map: this.rightPageTexture,
            side: THREE.DoubleSide,
            color: "#ffffff",
            specular: "#000000",
            emissive: "#000000",
            shininess: 90
            
        });

        this.leftPageTexture = this.newspaperTexture.clone();
        this.leftPageTexture.repeat.set(0.5,1);
        this.leftPageTexture.offset.set(0,0);
        this.leftPageMaterial = new THREE.MeshPhongMaterial({
            // color of a newspaper page
            map: this.leftPageTexture,
            side: THREE.DoubleSide
        });

        this.newspaperPages = [];
        this.newspaperPagesGroup = new THREE.Group();

        this.flowerMaterial = new THREE.MeshPhongMaterial({
            color : "#ff0000",
            specular: "#ffcccc",  // bright reflection
            emissive: "#003300",  // glowing emissive
            shininess: 10,  // very shiny
            side: THREE.DoubleSide
        });
    
        // rotate the texture 90 degrees
        this.stemTexture.rotation = Math.PI/2;
        this.stemTexture.wrapS = THREE.RepeatWrapping;
        this.stemTexture.wrapT = THREE.RepeatWrapping;

        // make the texture repeat along the stem
        this.stemTexture.repeat.set(1, 5);

        this.stemMaterial = new THREE.MeshPhongMaterial({
            map : this.stemTexture,
            specular: "#11bb00",  // bright reflection
            emissive: "#003300",  // glowing emissive
            shininess: 10  // very shiny
        });
        this.receptacleMaterial = new THREE.MeshPhongMaterial({ // yellow
            color : "#ffcc00"
        });
        // rotate the texture 90 degres
        this.flower =null;

        this.builder = new MyNurbsBuilder();
    }
    
    /**
     * Loads all the texture used in the scene
     */
    loadTextures(){
        const textureLoader = new THREE.TextureLoader();
        this.stemTexture = textureLoader.load('textures/stem.jpg');
        this.skyTexture = textureLoader.load('textures/sky.jpg');
        this.newspaperTexture = textureLoader.load('textures/newspaper.jpg');
        this.planeTexture =textureLoader.load('textures/brick_wall.jpg');
        this.tableTexture =textureLoader.load('textures/table.jpg');
        this.canvasTexture = textureLoader.load('textures/canvas.jpg');
        this.wallBottomTexture =textureLoader.load('textures/brick_wall_bottom.jpg');
        this.wallTopTexture =textureLoader.load('textures/brick_wall_top.jpg');
        this.wallSideTextureLeft = textureLoader.load('textures/brick_wall_side_left.jpg');
        this.wallSideTextureRight =textureLoader.load('textures/brick_wall_side_rigth.jpg');
        this.tableTexture =textureLoader.load('textures/table.jpg');
        this.frameTexture = textureLoader.load('textures/painting_frame.jpg');
        this.textureFrameBox = textureLoader.load('textures/table.jpg');
        this.textureWindow = textureLoader.load('textures/window.jpg');
        this.textureChair = textureLoader.load('textures/table.jpg');
        this.textureChairBack = textureLoader.load('textures/table.jpg');
        this.textureChairLeg = textureLoader.load('textures/table.jpg');
        this.textureCarpet = textureLoader.load('textures/carpet.jpg');
        this.floorTexture =textureLoader.load('textures/church_floor.jpg');
        this.textureFurniture = textureLoader.load('textures/drawer.jpg');
        this.restOfDrawer = textureLoader.load('textures/table.jpg');
        this.textureCakeSide = textureLoader.load('textures/cake_side.jpg');
        this.textureCakeTop = textureLoader.load('textures/cake_top2.jpg');
        this.textureVase = textureLoader.load('textures/pottery.jpg');

        // configure the texture to repeat
        this.textureFurniture.wrapS = THREE.RepeatWrapping; // Repeat horizontally
        this.textureFurniture.wrapT = THREE.RepeatWrapping; // Repeat vertically
        this.textureFurniture.repeat.set(1, 1) // se quiser mudar no futuro

        this.floorTexture.repeat.set(5, 5); 
        this.floorTexture.wrapS = THREE.RepeatWrapping;
        this.floorTexture.wrapT = THREE.RepeatWrapping;
    }

    // Method to update texture properties
    updateTextureProperties() {
        // Set the texture wrapping mode
        this.floorTexture.wrapS = this.getWrapMode(this.wrapModeU);
        this.floorTexture.wrapT = this.getWrapMode(this.wrapModeV);

        // Set the texture repeat values
        this.floorTexture.repeat.set(this.repeatU, this.repeatV);

        // Set the texture offset values
        this.floorTexture.offset.set(this.offsetU, this.offsetV);
        
        // Update texture rotation
        this.floorTexture.rotation = this.rotation;

        // Mark texture for update
        this.floorTexture.needsUpdate = true; 
    }

    // Helper method to get wrapping mode based on the selected option
    getWrapMode(mode) {
        switch (mode) {
            case 0: return THREE.ClampToEdgeWrapping; // Clamp
            case 1: return THREE.RepeatWrapping; // Repeat
            case 2: return THREE.MirroredRepeatWrapping; // Mirror Repeat
            default: return THREE.RepeatWrapping; // Default to Repeat
        }
    }

    //Create table and everything on it

    initTable() {
        this.tableScale = 0.5;
        this.table = new MyTable(this,10,10,20,1,0.5,0.3,0.4,this.tableMaterialStone, this.tableLegMaterial);
        this.table.scale.set(this.tableScale, this.tableScale, this.tableScale);
        this.app.scene.add(this.table);

        const heightTable = this.tableScale*this.table.tableTopHeight;

        this.plate = new MyPlate(this.app, 1.6,2, 2.05, 2.4, 0.1, 0.2, 60,1, this.plateMaterial);
        this.plate.position.set(0,heightTable,0);
        this.plate.scale.set(0.7,0.7,0.7);
        this.app.scene.add(this.plate);

        let amountEaten = 0.9;
        let cakeRadius = 1.5;

        this.cake = new MyCake(this.app, this.cakeMaterialExterior, this.cakeSideMaterial,this.candleMaterial, this.flameMaterial, cakeRadius, amountEaten, true, 0);
        this.cake.position.set( 0,this.plate.getBaseHeigth() + heightTable+0.001, 0);
        this.app.scene.add(this.cake);

        this.smallPlate = new MyPlate(this.app, 2,2, 2.1, 2.4, 0.15, 0.05, 60,10, this.plateMaterial);
        this.smallPlate.position.set(1,heightTable,3);
        this.smallPlate.scale.set(0.4,0.6,0.4);
        this.app.scene.add(this.smallPlate);
        const coord = this.smallPlate.centerOfThePlate();

      
        this.cakeSlice = new MyCake(this.app, this.cakeMaterialExterior, this.cakeSideMaterial,this.candleMaterial, this.flameMaterial, cakeRadius, 1-amountEaten, false, Math.PI);
        this.cakeSlice.position.set(coord.x+0.7,coord.y+0.001,coord.z-0.2);
        this.app.scene.add(this.cakeSlice);

        this.MyCup = new MyCup(this, this.cupMaterial, this.cupInsideMaterial);
        this.MyCup.position.set(0,heightTable+0.01,-4);
        this.app.scene.add(this.MyCup);
        //this.createCup( new THREE.Vector3(0,heightTable ,-4));
        this.spring = new MySpring(this.app,20,8,5,0.8,0.15,this.springMaterial);
        this.spring.rotation.y = Math.PI/8;
        this.spring.rotation.z = Math.PI/2;
        this.spring.scale.set(0.2,0.2,0.2);
        this.spring.position.set(0,heightTable + this.spring.getHeightLaying()/2,-3);
        this.app.scene.add(this.spring);

        this.createNewspaper( new THREE.Vector3(0.8,heightTable+0.01,-3), 1.5, Math.PI/2+ Math.PI/8);

        this.createJar({
            x: -1,
            y: heightTable + 0.01,
            z:2.5,

        });
    }
   
   
    //Create landscape
    createSkySphere() {
        const skyGeometry = new THREE.SphereGeometry(10, 32, 32, 0, Math.PI);

        this.skyTexture.wrapS = THREE.RepeatWrapping;
        this.skyTexture.wrapT = THREE.RepeatWrapping;
        this.skyTexture.repeat.set(0.5, 1);

        const skyMaterial = new THREE.MeshBasicMaterial({
            map: this.skyTexture,
            color: '#cccccc',
            side: THREE.BackSide  
        });
    
        const skySphere = new THREE.Mesh(skyGeometry, skyMaterial);
        skySphere.position.set(3, 10, 15);
        
        this.app.scene.add(skySphere);
    }

    //Create Jar
    createJar(pos) {
        
        const jar = new MyJar(this,this.jarMaterial); 

        jar.position.set(pos.x, pos.y, pos.z);
        this.app.scene.add(jar);

        
        // add the flower inside the jar
        this.flower = new MyFlower(this, 0.10, 5.5, 1.5, 0.4, 60*Math.PI/180, 0.4, 10,this.flowerMaterial, this.stemMaterial, this.receptacleMaterial);
        this.flower.position.set(pos.x, pos.y+0.01, pos.z);
        this.flower.scale.set(0.3,0.3,0.3);
        this.app.scene.add(this.flower);

        this.flower = new MyFlower(this, 0.10, 6, 0.7, 0.4, 50*Math.PI/180, 0.4, 10,this.flowerMaterial, this.stemMaterial, this.receptacleMaterial);
        this.flower.position.set(pos.x-0.2, pos.y+0.01, pos.z);
        this.flower.rotation.y = Math.PI/4;
        this.flower.scale.set(0.33,0.33,0.33);
        this.app.scene.add(this.flower);

        this.flower = new MyFlower(this, 0.10, 5.3, 0.8, 0.4, Math.PI/4, 0.4, 10,this.flowerMaterial, this.stemMaterial, this.receptacleMaterial);
        this.flower.position.set(pos.x-0.1, pos.y+0.01, pos.z+0.1);
        this.flower.rotation.y = -70 * Math.PI/180;
        this.flower.scale.set(0.32,0.32,0.32);
        this.app.scene.add(this.flower);
    }  
        
    /**
     * initializes the contents
     */
    init() {
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.axis.visible = false;
            this.app.scene.add(this.axis)
        }

       
        
        // Create Floor
        let floor = new THREE.PlaneGeometry( 30, 30 );
        this.floorMesh = new THREE.Mesh( floor, this.floorMaterial );
        this.floorMesh.rotation.x = -Math.PI / 2;
        this.floorMesh.position.y = 0;
        this.floorMesh.receiveShadow = true;
    
        this.app.scene.add( this.floorMesh );

        // Create 4 Walls
        let wallHeight = 20;
        this.walls = new THREE.Group;

        let wall1 = new THREE.PlaneGeometry(30,wallHeight);
        this.wallMesh1 = new THREE.Mesh(wall1,this.planeMaterial);
        this.wallMesh1.position.z = -15;
        this.wallMesh1.position.y = wallHeight / 2;
        this.walls.add(this.wallMesh1);

        let wall2 = new THREE.PlaneGeometry(30, wallHeight);
        this.wallMesh2 = new THREE.Mesh(wall2, this.planeMaterial);
        this.wallMesh2.rotation.y = Math.PI / 2;
        this.wallMesh2.position.x = -15;
        this.wallMesh2.position.y = wallHeight / 2;
        this.walls.add(this.wallMesh2);

        let wall3horizontal = new THREE.PlaneGeometry(30, wallHeight-14);

        this.wallMesh3bottom = new THREE.Mesh(wall3horizontal, this.wallBottomMaterial);
        this.wallMesh3bottom.rotation.y = Math.PI;
        this.wallMesh3bottom.position.z = 15;
        this.wallMesh3bottom.position.y = wallHeight -17;

        this.wallMesh3top = new THREE.Mesh(wall3horizontal, this.wallTopMaterial);
        this.wallMesh3top.rotation.y = Math.PI;
        this.wallMesh3top.position.z = 15;
        this.wallMesh3top.position.y = wallHeight - 3;

        let wall3vertical = new THREE.PlaneGeometry(9.25, 8);

        this.wallMesh3left = new THREE.Mesh(wall3vertical, this.wallSideMaterialLeft);
        this.wallMesh3left.rotation.y = Math.PI;
        this.wallMesh3left.position.z = 15;
        this.wallMesh3left.position.y = 10;
        this.wallMesh3left.position.x = 10.5;

        this.wallMesh3rigth = new THREE.Mesh(wall3vertical, this.wallSideMaterialRigth);
        this.wallMesh3rigth.rotation.y = Math.PI;
        this.wallMesh3rigth.position.z = 15;
        this.wallMesh3rigth.position.y = 10;
        this.wallMesh3rigth.position.x = -10.5;

        this.walls.add(this.wallMesh3bottom);
        this.walls.add(this.wallMesh3top);
        this.walls.add(this.wallMesh3left);
        this.walls.add(this.wallMesh3rigth);

        let wall4 = new THREE.PlaneGeometry(30, wallHeight);
        this.wallMesh4 = new THREE.Mesh(wall4, this.planeMaterial);
        this.wallMesh4.rotation.y = -Math.PI / 2;
        this.wallMesh4.position.x = 15;
        this.wallMesh4.position.y = wallHeight / 2;

        this.walls.add(this.wallMesh4);

        // cast shadow and receive shadows on every wall

        this.walls.traverse(function(child){
            child.receiveShadow = true;
            child.castShadow = true;
        });

        this.app.scene.add(this.walls);


        this.initTable();
       
        // create paintings
        this.painting1 = new MyPainting(this,'rodrigoPicture.jpeg',this.frameMaterial )
        this.painting2 = new MyPainting(this,'marcosPicture.jpg',this.frameMaterial )
        this.painting1.position.set(-7,10,-14.5);
        this.painting2.position.set(7,10,-14.5);
        this.app.scene.add(this.painting1);
        this.app.scene.add(this.painting2);

        //create window
        this.myWindow = new MyWindow(this,this.windowFrameMaterial, this.cupMaterial, this.cupInsideMaterial);
        this.myWindow.position.set(0, 10, 15.1); 
        this.app.scene.add(this.myWindow);

        //create beetle painting
        this.beetle = new MyBeetle(this, 20, 12, 1, this.tableMaterialStone, 1, this.canvasMaterial, this.beetleMaterial);
        this.beetle.position.set(-14.8, 10, 0);
        this.beetle.scale.set(0.4, 0.4, 0.4);
        this.beetle.rotateY(Math.PI / 2);
        this.app.scene.add(this.beetle);

       
        //create chairs
        this.chairs = [];

        this.addChairs();

        //create carpet
        this.carpet = new MyCarpet(this, this.carpetMaterial);  
        this.carpet.position.set(0,0.01,0);
        this.app.scene.add(this.carpet);

        //create furniture under the portraits
       this.furniture = new MyFurniture(this, this.texturedDrawerMaterial, this.defaultDrawerMaterial);
       this.furniture.position.set(0, 2.5, -14);
        this.app.scene.add(this.furniture);

        //create skySphere landscape
        this.createSkySphere();

        this.initLights();
    }

    initLights(){
        // add a point light in the candle flame
        this.pointLight = new THREE.PointLight(0xfffff2f,20,0);
        const posflame = this.cake.flameRelativePosition;
        const poscake = this.cake.position;
        const pos = {
            x: posflame.x + poscake.x,
            y: posflame.y + poscake.y,
            z: posflame.z + poscake.z
        }
        this.pointLight.position.set(pos.x, pos.y, pos.z);

       
        this.pointLight.castShadow = false;
        this.pointLight.shadow.mapSize.width = 512;
        this.pointLight.shadow.mapSize.height = 512;
        this.pointLight.shadow.camera.far = 40;
        this.pointLight.shadow.bias = -0.0000005; 

        this.app.scene.add(this.pointLight);

        // spot light with yellow light
        this.spotLight = new THREE.SpotLight( 0x919191 , 50);
        this.spotLight.position.set( 0, 20, 0 );
        this.spotLight.angle = this.spotLightAngle * Math.PI / 180;
        this.spotLight.penumbra = 0.15;
        this.spotLight.decay = 0.3;
        this.spotLight.distance = 30;
        this.spotLight.target = this.cake;

        
        this.spotLightMapSize = 1024;
        
        this.spotLight.castShadow = true; 
        this.spotLight.shadow.mapSize.width = this.spotLightMapSize; // default
        this.spotLight.shadow.mapSize.height = this.spotLightMapSize; // default
        this.spotLight.shadow.camera.near = 0.5; // default
        this.spotLight.shadow.camera.far = 100;
        this.spotLight.shadow.focus = 1; // default
        this.spotLight.shadow.bias = -0.0000005; 
        this.app.scene.add(this.spotLight);


        // helper for the spot light
        this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight );
        this.spotLightHelper.visible = false;   
        this.app.scene.add( this.spotLightHelper );

        // add two more spotLights
        this.portraitsLight = new THREE.SpotLight( 0x919191 , 20);
        this.portraitsLight.position.set(0,20,0);
        this.portraitsLight.angle = 35*Math.PI /180;
        this.portraitsLight.penumbra = 0.4;
        this.portraitsLight.decay =0.3;
        this.portraitsLight.distance = 50;
        const portraitsLightTarget = new THREE.Object3D;
        portraitsLightTarget.position.set(0,10,-15);
        this.app.scene.add(portraitsLightTarget);
        this.portraitsLight.target = portraitsLightTarget;
        this.app.scene.add(this.portraitsLight);

        this.paitingLight = new THREE.SpotLight( 0x919191 , 20);
        this.paitingLight.position.set(0,20,0);
        this.paitingLight.angle = 35*Math.PI /180;
        this.paitingLight.penumbra = 0.4;
        this.paitingLight.decay =0.3;
        this.paitingLight.distance = 50;
        const paitingLightTarget = new THREE.Object3D;
        paitingLightTarget.position.set(-15,10,0);
        this.app.scene.add(paitingLightTarget);
        this.paitingLight.target = paitingLightTarget;
        this.app.scene.add(this.paitingLight);

        // add an ambient light
        this.ambientLight = new THREE.AmbientLight( 0xffffff, 1 );
        this.app.scene.add( this.ambientLight );
    }

    addChairs(){
        //create chairs
        let chair = new MyChair(this, this.chairMaterial, this.chairBackMaterial, this.chairLegMaterial);
        chair.position.set(-2.5, 0, 0);
        this.chairs.push(chair);
        this.app.scene.add(chair);

        chair = new MyChair(this, this.chairMaterial, this.chairBackMaterial, this.chairLegMaterial);
        chair.position.set(2.5, 0, 0);
        chair.rotateY(Math.PI);
        this.chairs.push(chair);
        this.app.scene.add(chair);

        chair = new MyChair(this, this.chairMaterial, this.chairBackMaterial, this.chairLegMaterial);
        chair.rotation.y = -Math.PI/1.5;
        

        let rotationAngle = -Math.PI/1.5;
        // previous position was x=6 z=-6 but due to the rotation and scaling being applied after the translation it ended up besides the window which is what is intended
        // calculate the new translation
        chair.position.set( 6*1.5*Math.cos(rotationAngle) - 6*1.5*Math.sin(rotationAngle),
                            0,
                            -6*1.5*Math.sin(rotationAngle) - 6*1.5*Math.cos(rotationAngle)); 
        this.chairs.push(chair);
        this.app.scene.add(chair);

        chair = new MyChair(this, this.chairMaterial, this.chairBackMaterial, this.chairLegMaterial);
        chair.rotation.y = -Math.PI/5;
        // previous position was x=3 z=8 but due to the rotation and scaling being applied after the translation it ended up besides the window which is what is intended
        // calculate the new translation
        rotationAngle = -Math.PI/5;
        chair.position.set( 3*1.5*Math.cos(rotationAngle) + 8*1.5*Math.sin(rotationAngle),
                            0,
                            -3*1.5*Math.sin(rotationAngle) + 8*1.5*Math.cos(rotationAngle));
        this.chairs.push(chair);
        this.app.scene.add(chair);

    }

    createNewspaper(pos,scale = 1, rot = 0){

        const newspapernew = new MyNewspaper(this, 5, this.rightPageMaterial , this.leftPageMaterial);
        newspapernew.position.set(pos.x, pos.y, pos.z);
        newspapernew.scale.set(scale,scale,scale);
        newspapernew.rotation.y = rot;
        this.app.scene.add(newspapernew);
    }
    
    
     // updates the diffuse plane color and the material
   
    updateDiffusePlaneColor(value){
        this.diffusePlaneColor = value
        for(let i = 0; i < this.wallMaterials.length; i++){
            this.wallMaterials[i].color.set(this.diffusePlaneColor);
        }
        this.floorMaterial.color.set(this.diffusePlaneColor)
    }
    
     //updates the specular plane color and the material
    
    
    updateSpecularPlaneColor(value) {
        this.specularPlaneColor = value
        for(let i = 0; i < this.wallMaterials.length; i++){
            this.wallMaterials[i].specular.set(this.specularPlaneColor)
        }
        this.floorMaterial.specular.set(this.specularPlaneColor)
    }
   
     //updates the plane shininess and the material
     
     
    updatePlaneShininess(value) {
        this.planeShininess = value
        for(let i = 0; i < this.wallMaterials.length; i++){
            this.wallMaterials[i].shininess = this.planeShininess
        }
        this.floorMaterial.shininess = this.planeShininess
    }

    updateSpotLightHelper(){
        this.app.scene.remove(this.spotLightHelper);
        this.spotLightHelper = new THREE.SpotLightHelper( this.spotLight );
        this.spotLightHelper.visible = this.showSpotLightHelper;
        this.app.scene.add( this.spotLightHelper );
    }

    updateSpotLightColor(value) {
        this.spotLight.color.set(value)
    }

    updateSpotLightShadowMapSize(){
        this.spotLight.shadow.mapSize.width = this.spotLightMapSize; 
        this.spotLight.shadow.mapSize.height = this.spotLightMapSize;
        this.spotLight.shadow.map.setSize( this.spotLightMapSize, this.spotLightMapSize );

        this.spotLight.shadow.camera.updateProjectionMatrix();
        this.spotLight.shadow.needsUpdate = true;
        this.spotLight.shadow.updateMatrices(this.spotLight)
    }

    toggleSpotLightHelper(value){
        this.showSpotLightHelper = value;
        this.spotLightHelper.visible = this.showSpotLightHelper;
    }
    


    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
    }

}

export { MyContents };