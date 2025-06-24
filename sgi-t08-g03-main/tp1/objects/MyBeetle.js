import * as THREE from 'three';
import { MyApp } from '../MyApp.js';
import {MyFrame} from './MyFrame.js';

/**
 * This class contains a 3D axis representation
 */
class MyBeetle extends THREE.Object3D {

    /**
     * 
     * @param {MyApp} app the application object
     * @param {number} width the width of the canvas
     * @param {number} height the height of the canvas
     * @param {number} frameThickness the thickness of the frame
     * @param {THREE.Material} frameMaterial the material of the frame
     * @param {number} bettleScale the scale of the beetle
     * @param {THREE.Material} canvasMaterial the material of the canvas
     */
    constructor(app,width,height, frameThickness, frameMaterial, bettleScale, canvasMaterial,beetleMaterial, beetleRes=40) {
        super();
        this.app = app;
        this.type = 'Group';
        
        this.height = height;
        this.width = width;
        this.frameThickness = frameThickness;
        this.frameMaterial = frameMaterial;
        this.bettleScale = bettleScale;
        this.canvasMaterial = canvasMaterial;
        this.beetleRes = beetleRes;
        this.beetleMaterial = beetleMaterial;

        this.frame = null;
        this.beetle = null;
        this.canvas = null;

        this.create();
    }

    /**
     * Create the beetle
     */
    create(){

        // create frame
        this.frame = new MyFrame(this, this.width, this.height,this.frameThickness, this.frameMaterial);
        this.frame.position.set(0, 0, 0);
        this.add(this.frame);

        // create canvas
        let plane = new THREE.PlaneGeometry(this.width, this.height);
        this.canvas = new THREE.Mesh(plane, this.canvasMaterial);
        this.canvas.position.set(0, 0, this.frameThickness/2);
        this.add(this.canvas);

        // add beetle on the canvas
        this.createBeetle();
    }

    createBeetle(){
        this.beetle = new THREE.Group();

        const curve1 = new THREE.CubicBezierCurve3(
            new THREE.Vector3(-8,-4,0),
            new THREE.Vector3(-8,0,0),
            new THREE.Vector3(-2,0,0),
            new THREE.Vector3(-2,-4,0)
        );
        
        const points1 = curve1.getPoints(this.beetleRes);
        const geometry1 = new THREE.BufferGeometry().setFromPoints(points1);
        const curveObject1 = new THREE.Line(geometry1, this.beetleMaterial);
        this.beetle.add(curveObject1);

        // second wheel
        const curve2 = new THREE.CubicBezierCurve3(
            new THREE.Vector3(2,-4,0),
            new THREE.Vector3(2,0,0),
            new THREE.Vector3(8,0,0),
            new THREE.Vector3(8,-4,0)
        );

        const points2 = curve2.getPoints(this.beetleRes);
        const geometry2 = new THREE.BufferGeometry().setFromPoints(points2);
        const curveObject2 = new THREE.Line(geometry2, this.beetleMaterial);
        this.beetle.add(curveObject2);

        // back
        let radius = 8;
        let center = new THREE.Vector3(0,-4,0);
        let h = 4/3*(Math.sqrt(2)-1)*radius;
        const curve3 = new THREE.CubicBezierCurve3(
            new THREE.Vector3(center.x-radius,center.y,0),
            new THREE.Vector3(center.x-radius,h+center.y,0),
            new THREE.Vector3(center.x-h,center.y+radius,0),
            new THREE.Vector3(center.x,center.y+radius,0)
        );

        const points3 = curve3.getPoints(this.beetleRes);
        const geometry3 = new THREE.BufferGeometry().setFromPoints(points3);
        const curveObject3 = new THREE.Line(geometry3, this.beetleMaterial);
        this.beetle.add(curveObject3);

        // windshield
        radius = 4;
        center = new THREE.Vector3(0,0,0);
        h = 4/3*(Math.sqrt(2)-1)*radius;
        const curve4 = new THREE.CubicBezierCurve3(
            new THREE.Vector3(center.x,center.y+radius,0),
            new THREE.Vector3(center.x+h,center.y+radius,0),
            new THREE.Vector3(center.x+radius,center.y+h,0),
            new THREE.Vector3(center.x+radius,center.y,0),
        );

        const points4 = curve4.getPoints(this.beetleRes);
        const geometry4 = new THREE.BufferGeometry().setFromPoints(points4);
        const curveObject4 = new THREE.Line(geometry4, this.beetleMaterial);
        this.beetle.add(curveObject4);

        // front hood
        center = new THREE.Vector3(4,-4,0);
        const curve5 = new THREE.CubicBezierCurve3(
            new THREE.Vector3(center.x,center.y+radius,0),
            new THREE.Vector3(center.x+h,center.y+radius,0),
            new THREE.Vector3(center.x+radius,center.y+h,0),
            new THREE.Vector3(center.x+radius,center.y,0),
        );

        const points5 = curve5.getPoints(this.beetleRes);
        const geometry5 = new THREE.BufferGeometry().setFromPoints(points5);
        const curveObject5 = new THREE.Line(geometry5, this.beetleMaterial);
        this.beetle.add(curveObject5);

        // put the beetle a little forward
        this.beetle.position.set(0,0,0.01);
        this.beetle.scale.set(this.bettleScale, this.bettleScale, this.bettleScale);
        this.canvas.add(this.beetle);
    }
}

MyBeetle.prototype.isGroup = true;

export { MyBeetle };