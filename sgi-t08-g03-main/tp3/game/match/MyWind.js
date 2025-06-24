
import * as THREE from 'three';

/**
 * Class managing wind strenght and direction
 */
class MyWind {

    constructor(match, windStrength, directions = null, heights = null){
        this.match = match;
        this.windStrength = windStrength;
        this.directions = directions || this.defaultDirections();
        this.heights = heights || this.defaultHeights();

        this.windDirectionStrings = ['N','S', 'E','W']
    }

    defaultDirections(){
        return [
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(0,0,-1),
            new THREE.Vector3(0,0,1),
            new THREE.Vector3(1,0,0),
            new THREE.Vector3(-1,0,0)
        ]
    }

    defaultHeights(){
        return [
            20,
            40,
            60,
            80,
            100
        ]
    }

    // get the layer of the wind

    getLayer(height){
        for(let i = 0; i < this.heights.length; i++){
            const layerMaxHeight = this.heights[i];
            if (layerMaxHeight >= height){
                return i;
            }
        }
        return 4; // default to highest layer
    }

    getWindVector(position){
        // extract height 
        const height = position.y;
        // determine layer
        const layer = this.getLayer(height);

        // get the wind direction
        const windDirection = this.directions[layer].clone();
        // multiply by the wind strenght
        return windDirection.multiplyScalar(this.windStrength);
    }

    getWindDirectionString(position){
        // extract height 
        const height = position.y;
        // determine layer
        const layer = this.getLayer(height);

        if (layer >0 && layer < 5){
            return this.windDirectionStrings[layer-1];
        }else{
            return ''
        }
    }

}

export {MyWind};