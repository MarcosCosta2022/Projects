import * as THREE from 'three';
import { MyNurbsBuilder } from '../MyNurbsBuilder.js';

/**
 *  This class contains the contents of out application
 */
class MyLightsBuilder  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */

    constructor(app) {
        this.app = app
    }


    createLightHelper(light){
        // check the type of the light
        let helper = null;
        if (light instanceof THREE.PointLight){
            helper = new THREE.PointLightHelper(light);
        }
        else if (light instanceof THREE.SpotLight){
            helper = new THREE.SpotLightHelper(light);
        }
        else if (light instanceof THREE.DirectionalLight){
            helper = new THREE.DirectionalLightHelper(light);
        }
        else{
            console.error("Light type not supported");
        }
        return helper;
    }

    RGBVectorToStr([r,g,b]){
        // Scale r, g, and b from 0–1 to 0–255
        r = Math.round(r * 255);
        g = Math.round(g * 255);
        b = Math.round(b * 255);

        // Convert each to a two-character hex string and pad with '0' if needed
        const hexR = r.toString(16).padStart(2, '0');
        const hexG = g.toString(16).padStart(2, '0');
        const hexB = b.toString(16).padStart(2, '0');

        // Combine into the #RRGGBB format
        return `#${hexR}${hexG}${hexB}`;
    }

    /**
     * Creates a point light based on the node attributes
     * @param {*} node  the node containing the attributes of the light
     * @returns  a group containing the light and the helper
     */
    createPointLight(node){
        const color = this.RGBVectorToStr(node.color);
        const position = node.position;
        let enabled = node.enabled;
        let intensity = node.intensity;
        let  distance = node.distance;
        let  decay = node.decay;
        const castshadow = node.castshadow;
        const shadowfar = node.shadowfar;
        const shadowmapsize = node.shadowmapsize;

        const light = new THREE.PointLight(color, intensity, distance, decay);
        
        if (castshadow){
            light.castShadow = true;
        }
        
        light.shadow.mapSize.width = shadowmapsize;
        light.shadow.mapSize.height = shadowmapsize;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = shadowfar;

        light.position.set(position[0], position[1], position[2]);

        light.visible = enabled;
        
        return light;
    }

    /**
     * Creates a spotlight based on the node attributes
     * @param {*} node  the node containing the attributes of the light
     * @returns  a group containing the light and the helper
     * */
    createSpotLight(node){
        let enabled = node.enabled;
        const color = this.RGBVectorToStr(node.color);
        const position = node.position;
        const target = node.target;

        const light = new THREE.SpotLight(color, node.intensity, node.distance, node.angle*Math.PI/180, node.penumbra, node.decay);
        light.position.set(position[0], position[1], position[2]);
        light.target.position.set(target[0], target[1], target[2]);

        if (node.castshadow){
            light.castShadow = true;
        }

        light.shadow.mapSize.width = node.shadowmapsize;
        light.shadow.mapSize.height = node.shadowmapsize;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = node.shadowfar;

        light.visible = enabled;

        return light;
    }

    
    /**
     * Creates a directional light based on the node attributes
     * @param {*} node  the node containing the attributes of the light 
     * @returns  a group containing the light and the helper
     */
    createDirectionalLight(node){

        const color = this.RGBVectorToStr(node.color);
        const position = node.position;

        const light = new THREE.DirectionalLight(color, node.intensity);
        light.position.set(position[0], position[1], position[2]);

        if (node.castshadow){
            light.castShadow = true;
        }

        light.shadow.mapSize.width = node.shadowmapsize;
        light.shadow.mapSize.height = node.shadowmapsize;
        light.shadow.camera.far = node.shadowfar;
        light.shadow.camera.left = node.shadowleft;
        light.shadow.camera.right = node.shadowright;
        light.shadow.camera.bottom = node.shadowbottom;
        light.shadow.camera.top = node.shadowtop;

        light.visible = node.enabled;

        return light;
    }

    createLight(parentnodeid, node){ 
        const type = node.type;
        let res = null;

        try{
            switch (type) {
                case "pointlight":
                    res = this.createPointLight(node);
                    break;
                case "spotlight":
                    res = this.createSpotLight(node);
                    break;
                case "directionallight":
                    res = this.createDirectionalLight(node);
                    break;
                default:
                    console.error("Light type not supported: " + type);
                    break;
            }}
        catch (e){ // add the parent node id to the error message
            throw e;
        }

        return res;
    }
}


export { MyLightsBuilder };