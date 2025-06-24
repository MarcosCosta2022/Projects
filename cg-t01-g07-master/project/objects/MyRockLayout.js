import {CGFobject, CGFappearance} from '../../lib/CGF.js';
import {MyRock} from './MyRock.js';
import {MyRockSet} from './MyRockSet.js';

export class MyRockLayout extends CGFobject {
	constructor(scene, areaLimits, numberOfRocks, numberOfRockSets, appearance = null) {
		super(scene);

        this.rocks =[];
        this.rockSets = [];
        this.rocksOrientations = []; // must be within 0 and 2*Math.PI
        this.rocksScales = []; // array of 2 elements which is the
        this.rocksPositions = [];
        this.rockSetsOrientations = []; 
        this.rockSetsScales = [];
        this.rockSetsPositions = [];

        const positionLimits = areaLimits;
    
        // generate the rocks
        for(let i = 0; i < numberOfRocks; i++){
            let x = Math.random() * positionLimits * 2 - positionLimits;
            let z = Math.random() * positionLimits * 2 - positionLimits;
            let orientation = Math.random() * 2 * Math.PI; // random orientation between 0 and 2*Math.PI
            let scale = Math.random() * 1.5 + 0.5; // random scale between 0.5 and 2
            this.rocks.push(new MyRock(this.scene, 10, 5));
            this.rocksPositions.push([x,z]);
            this.rocksOrientations.push(orientation);
            this.rocksScales.push(scale);
        }

        // generate the rock sets
        for(let i = 0; i < numberOfRockSets; i++){
            let x = Math.random() * positionLimits * 2 - positionLimits;
            let z = Math.random() * positionLimits * 2 - positionLimits;
            let orientation = Math.random() * 2 * Math.PI; // random orientation between 0 and 2*Math.PI
            let scale = Math.random() * 1.5 + 0.5; // random scale between 0.5 and 2
            let numRocksInSet = Math.floor(Math.random() * 3) + 2; // random number between 2 and 4
            this.rockSets.push(new MyRockSet(this.scene, numRocksInSet, this.rockAppearance));
            this.rockSetsPositions.push([x,z]);
            this.rockSetsOrientations.push(orientation);
            this.rockSetsScales.push(scale);
        }
        
        this.rockAppearance = appearance;

	}

    display(){
        if (this.rockAppearance != null){
            this.rockAppearance.apply();
        }

        for (let i = 0; i < this.rocks.length; i++){
            this.scene.pushMatrix();
            this.scene.translate(this.rocksPositions[i][0], 0, this.rocksPositions[i][1]);
            this.scene.rotate(this.rocksOrientations[i], 0, 1, 0);
            this.scene.scale(this.rocksScales[i],1,1);
            this.rocks[i].display();
            this.scene.popMatrix();
        }

        for (let i = 0; i < this.rockSets.length; i++){
            this.scene.pushMatrix();
            this.scene.translate(this.rockSetsPositions[i][0], 0, this.rockSetsPositions[i][1]);
            this.scene.rotate(this.rockSetsOrientations[i], 0, 1, 0);
            this.scene.scale(this.rockSetsScales[i],1,1);
            this.rockSets[i].display();
            this.scene.popMatrix();
        }
    }


	
}

