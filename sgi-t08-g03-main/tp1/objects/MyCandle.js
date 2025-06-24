import * as THREE from 'three';
import { MyFlame } from './MyFlame';

/**
 * This class represents a candle that can be placed on top of a cake.
 */
class MyCandle extends THREE.Object3D {

    /**
     * 
     * @param {MyApp} app - The application object
     * @param {THREE.Material} candleMaterial - Material for the candle exterior
     * @param {number} height - Height where the candle should be placed
     */
    constructor(app, candleMaterial, height = 1) {
        super();
        this.app = app;
        this.candleMaterial = candleMaterial;
        this.height = height;

        
        this.createCandle();
    }

    /**
     * Create the candle geometry.
     */
    createCandle() {
        let scale = 0.5;
        let candleHeight = 1.2 * scale;
        let candleRadius = 0.1 * scale;

        // Define the candle as a cylinder
        const candleGeometry = new THREE.CylinderGeometry(candleRadius, candleRadius, candleHeight, 64, 64);
        this.candleMesh = new THREE.Mesh(candleGeometry, this.candleMaterial);

        this.add(this.candleMesh);
    }
}

MyCandle.prototype.isGroup = true;

export { MyCandle };
