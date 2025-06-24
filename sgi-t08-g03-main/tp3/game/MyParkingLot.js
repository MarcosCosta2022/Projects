import * as THREE from 'three';
import { MyBallon } from './MyBallon.js';

/**
 * A class that represents a parking lot for 3D balloons
 */
class MyParkingLot extends THREE.Object3D {
    constructor(app, balloons, side) {
        super();
        this.app = app;
        this.balloons = balloons;
        this.side = side;

        // Adjust dimensions to fit ground size (600x300)
        this.spotsPerRow = 50; // Reduced to fit width
        this.spotWidth = 50;
        this.spotLength = 50;
        this.spacing = 10;

        // get array of ballon map keys
        this.ballonNames = Object.keys(this.balloons);
        
        this.init();
    }

    init() {
        // Create ground plane for parking lot
        const groundGeometry = new THREE.BoxGeometry(600,300,200);
        const groundMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            side: THREE.DoubleSide
        });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.position.set(0,-150,0);
        this.ground.receiveShadow = true;
        this.add(this.ground);

        // Add parking spot markings
        this.createParkingSpots();

        // Position balloons in parking spots
        this.positionBalloons();
    }

    createParkingSpots() {
        // Create white lines for parking spots
        const spotMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        
        for (let row = 0; row < Math.ceil(this.balloons.length / this.spotsPerRow); row++) {
            for (let col = 0; col < this.spotsPerRow; col++) {
                if (row * this.spotsPerRow + col >= this.balloons.length) break;

                // Create outline for each parking spot
                const lineGeometry = new THREE.BoxGeometry(this.spotWidth, 0.1, 0.1);
                const sideLine = new THREE.Mesh(lineGeometry, spotMaterial);
                
                const startX = -250 + col * (this.spotWidth + this.spacing); // Start from left edge
                const startZ = -100 + row * (this.spotLength + this.spacing); // Start from front edge

                // Add lines around the parking spot
                const spot = new THREE.Group();
                
                // Front line
                const frontLine = sideLine.clone();
                frontLine.position.set(0, 0, -this.spotLength/2);
                spot.add(frontLine);

                // Back line
                const backLine = sideLine.clone();
                backLine.position.set(0, 0, this.spotLength/2);
                spot.add(backLine);

                // Side lines
                const sideGeometry = new THREE.BoxGeometry(0.1, 0.1, this.spotLength);
                const leftLine = new THREE.Mesh(sideGeometry, spotMaterial);
                leftLine.position.set(-this.spotWidth/2, 0, 0);
                spot.add(leftLine);

                const rightLine = new THREE.Mesh(sideGeometry, spotMaterial);
                rightLine.position.set(this.spotWidth/2, 0, 0);
                spot.add(rightLine);

                spot.position.set(startX, 0.01, startZ);
                this.add(spot);
            }
        }
    }

    positionBalloons() {
        // Get the world matrix of the parking lot
        this.updateWorldMatrix(true, false);
        const worldMatrix = this.matrixWorld;

        let index = 0;
        for(let key in this.balloons) {
            const balloon = this.balloons[key];

            const row = Math.floor(index / this.spotsPerRow);
            const col = index % this.spotsPerRow;

            // Calculate position relative to ground boundaries
            const localX = -250 + col * (this.spotWidth + this.spacing); // Start from left edge
            const localY = 1; // Height above ground
            const localZ =  row * (this.spotLength + this.spacing); // Start from front edge

            // Create a vector for the local position
            const localPosition = new THREE.Vector3(localX, localY, localZ);
            
            // Transform the local position to world coordinates
            const worldPosition = localPosition.clone().applyMatrix4(worldMatrix);
            
            // Move balloon to the world position
            balloon.move(worldPosition);
            
            index++;
        }
    }

    getLeftBallonName(currentBallon){
        // get index of currentBallon
        let index = 0;
        for(index = 0; index < this.ballonNames.length; index++){
            if (this.ballonNames[index] == currentBallon){
                break;
            }
        }

        if(this.ballonNames[index] != currentBallon || index == 0) return null;

        return this.ballonNames[index-1];
    }

    getRightBallonName(currentBallon){
        // get index of currentBallon
        let index = 0;
        for(index = 0; index < this.ballonNames.length; index++){
            if (this.ballonNames[index] == currentBallon){
                break;
            }
        }

        if(this.ballonNames[index] != currentBallon || index == this.ballonNames.length-1) return null;

        return this.ballonNames[index+1];
    }

    getBalloonByName(name){
        return this.balloons[name];
    }

    getFirstBalloonName(){
        return this.ballonNames[0];
    }

    checkBallonPicked(obj) {
        // Traverse up the hierarchy
        let current = obj; // Start with the given object
        while (current) {
            // Check if the current object is an instance of the desired class or has a specific property
            if (current instanceof MyBallon && current.side == this.side) {
                // Return the balloon object if found
                return current;
            }
    
            // Move up to the parent
            current = current.parent;
        }
    
        // If no Balloon instance is found in the hierarchy
        return null;
    }


}

export { MyParkingLot };