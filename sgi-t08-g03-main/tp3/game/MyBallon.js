import * as THREE from 'three';
import { MyCollidableObject } from './MyCollidableObject.js';

/**
 *  This class contains the contents of out application
 */
class MyBallon extends MyCollidableObject{
    constructor(app,model,route =null){
        super();
        this.app = app;
        this.ballon = null;
        this.route = route;

        if(model == null){
            throw Error("Null mesh provided to the ballon class constructor");
        }

        const newModel = model.clone();

        // assuming model is a LOD lets take the first object in the LOD
        const firstObject = newModel.getObjectForDistance(0);

        // use first object as the collider
        super.init(firstObject);

        this.ballon = newModel;
        this.add(this.ballon)

        this.adjustHeight(firstObject);

        // calculate center and add it to the ballon too
        this.calculateCenter(firstObject);
    }

    adjustHeight(firstObject){
        // Create a bounding box for the object
        const bbox = new THREE.Box3().setFromObject(firstObject, true);
        
        // Get the minimum y-coordinate of the bounding box
        const minY = bbox.min.y;
        
        // If the object is not already at y=0, translate it up by the minimum y value
        // This will make the bottom of the object sit at y=0
        if (minY !== 0) {
            firstObject.position.y -= minY;
        }
        
    }

    getRoute(){
        return this.route;
    }

    clone(){

        // clone the ballon model
        const clonedBallon = this.ballon.clone();

        // create another MyBalloon
        const newBalllon = new MyBallon(this.app,clonedBallon, this.route);
        
        return newBalllon;
    }

    calculateCenter(mesh) {
        // Create a temporary bounding box
        const bbox = new THREE.Box3().setFromObject(mesh);
        
        // Calculate the center of the bounding box
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        
        // Create a center object and position it
        this.center = new THREE.Object3D();
        this.center.position.copy(center);
        this.add(this.center);
        
        // Optionally, you can store the dimensions
        this.dimensions = new THREE.Vector3();
        bbox.getSize(this.dimensions);
    }

    createBallon(){
        const loader = new THREE.TextureLoader();
        const texture = loader.load(this.texture);
        const sphereMaterial = new THREE.MeshPhongMaterial({
            map: texture
        });
        sphereMaterial.shininess = 100;
        const sphereRadius = 5;
        const sphere = new THREE.SphereGeometry(sphereRadius, 15,15)
        const sphereMesh = new THREE.Mesh(sphere, sphereMaterial)

        // cube
        const cubeTexture = loader.load('images/woodenbox.jpg');
        const cubeMaterial = new THREE.MeshPhongMaterial({
            map: cubeTexture
        });
        
        const cubeHeight = 3
        const cube = new THREE.BoxGeometry(5,cubeHeight,5)
        const cubeMesh = new THREE.Mesh(cube, cubeMaterial);

        // position the object such that the ballon's base sits in the center of the origin
        cubeMesh.position.set(0,cubeHeight/2,0);
        sphereMesh.position.set(0,cubeHeight/2 + sphereRadius + 5, 0);

        //create columns
        const columnHeight = 5;
        const columnRadius = 0.1;
        const columnTexture = loader.load('images/rope.jpg');
        const columnMaterial = new THREE.MeshPhongMaterial({
            map: columnTexture
        });
        
        const column = new THREE.CylinderGeometry(columnRadius,columnRadius,columnHeight,32);
        const columnMesh1 = new THREE.Mesh(column, columnMaterial);
        const columnMesh2 = new THREE.Mesh(column, columnMaterial);
        const columnMesh3 = new THREE.Mesh(column, columnMaterial);
        const columnMesh4 = new THREE.Mesh(column, columnMaterial);

        columnMesh1.position.set(2.4, sphereRadius/2 + cubeHeight, 2.4);
        columnMesh2.position.set(-2.4, sphereRadius/2 + cubeHeight, 2.4);
        columnMesh3.position.set(2.4, sphereRadius/2 + cubeHeight, -2.4);
        columnMesh4.position.set(-2.4, sphereRadius/2 + cubeHeight, -2.4);
        // group
        const group = new THREE.Group();

        group.add(sphereMesh);
        group.add(cubeMesh);

        this.add(columnMesh1);
        this.add(columnMesh2);
        this.add(columnMesh3);
        this.add(columnMesh4);

        this.ballon = group;
        this.add(this.ballon);

        // create a center object with a position
        this.center = new THREE.Object3D();
        this.center.position.set(0,5,0);
        this.add(this.center);
    }
}


export {MyBallon};