import * as THREE from 'three';
import { MyApp } from '../MyApp.js';

/**
 * This class represents a cake with an optional candle and a portion eaten.
 */
class MyCake extends THREE.Object3D {

    /**
     * 
     * @param {MyApp} app - The application object
     * @param {THREE.Material} cakeMaterialExterior - Material for the exterior of the cake
     * @param {THREE.Material} cakeSideMaterial - Material for the interior of the cake
     * @param {THREE.Material} candleMaterial - Material for the candle
     * @param {THREE.Material} flameMaterial - Material for the flame
     * @param {number} cakeRad - Radius of the cake
     * @param {number} amountEaten - Ratio of cake eaten (0-1)
     * @param {boolean} createCandle - Whether to add a candle on top
     * @param {number} rot - Rotation angle of the cut section
     */
    constructor(app, cakeMaterialExterior, cakeSideMaterial, candleMaterial, flameMaterial, cakeRad = 1.5, amountEaten = 0.9, createCandle = true, rot = 0) {
        super();
        this.app = app;
        this.cakeMaterialExterior = cakeMaterialExterior;
        this.cakeSideMaterial = cakeSideMaterial;
        this.candleMaterial = candleMaterial;
        this.flameMaterial = flameMaterial;
        this.cakeRad = cakeRad;
        this.amountEaten = amountEaten;
        this.createCandleFlag = createCandle;
        this.rot = rot;

        this.flameRelativePosition = {
            x: 0,
            y: 0,
            z: 0
        };

        this.createCake();

        this.traverse( function( child ) {
            child.castShadow = true;
            child.receiveShadow = true;
        } );
    }

    /**
     * Create the cake geometry and cut planes, and add an optional candle.
     */
    createCake() {
        let scale = 0.8;
        let cakeHeight = scale;
        let cakeRadius = this.cakeRad * scale;
        let cakeEatenRatio = this.amountEaten;
        let cakeCutThetaStart = Math.PI / 2 + this.rot;
        let cakeCutThetaLength = Math.PI * 2 * cakeEatenRatio;

        // Cake body
        const cakeGeometry = new THREE.CylinderGeometry(cakeRadius, cakeRadius, cakeHeight, 64, 64, false, cakeCutThetaStart, cakeCutThetaLength);
        this.cakeMesh = new THREE.Mesh(cakeGeometry, this.cakeMaterialExterior);
        this.cakeMesh.position.y = cakeHeight / 2;
        this.add(this.cakeMesh);

        // Only add cut planes if cake is not fully intact
        if (cakeEatenRatio < 1) {
            this.addCutPlanes(cakeRadius, cakeHeight, cakeCutThetaStart, cakeCutThetaLength);
        }

        // Add candle if flag is set to true
        if (this.createCandleFlag) {
            this.createCandle(cakeHeight, -0.1, -0.3);
        }
    }

    /**
     * Add two planes to represent the cut sides of the cake.
     */
    addCutPlanes(cakeRadius, cakeHeight, cakeCutThetaStart, cakeCutThetaLength) {
        const planeGeometry = new THREE.PlaneGeometry(cakeRadius, cakeHeight);

        // First cut plane
        const plane1 = new THREE.Mesh(planeGeometry, this.cakeSideMaterial);
        const rotation1 = cakeCutThetaStart - Math.PI / 2;
        plane1.rotation.y = rotation1;
        plane1.position.set(cakeRadius * Math.cos(rotation1) / 2, cakeHeight / 2, -cakeRadius * Math.sin(rotation1) / 2);
        this.add(plane1);

        // Second cut plane
        const plane2 = new THREE.Mesh(planeGeometry, this.cakeSideMaterial);
        const rotation2 = cakeCutThetaStart + cakeCutThetaLength + Math.PI / 2;
        plane2.rotation.y = rotation2;
        plane2.position.set(-cakeRadius * Math.cos(rotation2) / 2, cakeHeight / 2, cakeRadius * Math.sin(rotation2) / 2);
        this.add(plane2);
    }

    /**
     * Create the candle with flame.
     */
    createCandle(height = 1, x = 0, z = 0) {
        let scale = 0.5;
        let candleHeight = 1.2 * scale;
        let candleRadius = 0.1 * scale;

        // Candle body
        const candleGeometry = new THREE.CylinderGeometry(candleRadius, candleRadius, candleHeight, 64, 64);
        this.candleMesh = new THREE.Mesh(candleGeometry, this.candleMaterial);
        this.candleMesh.position.set(x, height + candleHeight / 2, z);
        this.add(this.candleMesh);

        // Add flame on top of the candle
        this.createFlame(height + candleHeight, x, z);
    }

    /**
     * Create a flame on top of the candle, composed of two cones and a cylinder.
     */
    createFlame(height = 1, x = 0, z = 0) {
        let scale = 0.9;
        let flameRadius = 0.1 * scale;
        let bottomConeHeight = 0.1 * scale;
        let cylinderHeight = 0.05 * scale;
        let topConeHeight = 0.3 * scale;

        // Bottom cone (flipped)
        const bottomConeGeometry = new THREE.ConeGeometry(flameRadius, bottomConeHeight, 64);
        this.bottomConeMesh = new THREE.Mesh(bottomConeGeometry, this.flameMaterial);
        this.bottomConeMesh.position.set(x, height + bottomConeHeight / 2, z);
        this.bottomConeMesh.rotation.x = Math.PI;
        this.add(this.bottomConeMesh);

        // Middle cylinder
        const cylinderGeometry = new THREE.CylinderGeometry(flameRadius, flameRadius, cylinderHeight, 64, 64);
        this.cylinderMesh = new THREE.Mesh(cylinderGeometry, this.flameMaterial);
        this.cylinderMesh.position.set(x, height + bottomConeHeight + cylinderHeight / 2, z);
        this.add(this.cylinderMesh);

        // Top cone
        const topConeGeometry = new THREE.ConeGeometry(flameRadius, topConeHeight, 64);
        this.topConeMesh = new THREE.Mesh(topConeGeometry, this.flameMaterial);
        this.topConeMesh.position.set(x, height + bottomConeHeight + cylinderHeight + topConeHeight / 2, z);
        this.add(this.topConeMesh);

        this.flameRelativePosition={
            x: x,
            y: height + bottomConeHeight + cylinderHeight / 2,
            z: z
        }
    }
}

MyCake.prototype.isGroup = true;

export { MyCake };
