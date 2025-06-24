import * as THREE from 'three';
import { MyNurbsBuilder } from '../MyNurbsBuilder.js';

/**
 *  This class contains the contents of out application
 */
class MyMaterialBuilder  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */

    constructor(app) {
        this.app = app

        this.nurbbuilder = new MyNurbsBuilder();

        // green material to stand out
        this.defaultMaterial = new THREE.MeshPhongMaterial({
            color: 0x00FF00,
            emissive: 0x00FF00,
            specular: 0x00FF00,
            shininess: 1,
            transparent: false,
            opacity: 1.0
        });
    }
    
    getRectangleScale(node){
        const point1 = node.representations[0].xy1;
        const point2 = node.representations[0].xy2;

        // Calculate width and height based on the distance between the points
        const width = Math.abs(point2[0] - point1[0]);
        const height = Math.abs(point2[1] - point1[1]);
        
        return {sizeX: width, sizeY: height};
    }

    applyTextureScale(material, s, t){
        let needsUpdate = false;
        if (material.map){
            let cloneMap = material.map.clone();
            cloneMap.repeat.set(s, t);
            material.map = cloneMap;
            needsUpdate = true;
        }
        if (material.bumpMap){
            let cloneMap = material.bumpMap.clone();
            cloneMap.repeat.set(s, t);
            material.bumpMap = cloneMap;
            needsUpdate = true;
        }  
        if (material.especularMap) {
            let cloneMap = material.especularMap.clone();
            cloneMap.repeat.set(s, t);
            material.especularMap = cloneMap;
            needsUpdate = true;
        }
        // flag the material for update
        material.needsUpdate = needsUpdate;
    }

    getCylinderScale(node){
        // use the base as the reference for the scaling

        const base = node.representations[0].base; // radiuus of the base
        const top = node.representations[0].top; // radius of the top
        const height = node.representations[0].height;
        

        const baseCircunference = 2 * Math.PI * base;

        return {sizeX: baseCircunference, sizeY: height};
    }

    getSphereScale(node){
        const radius = node.representations[0].radius;

        return {sizeX: radius, sizeY: radius};
    }

    getNurbsScale(node){
        // we use 3 control points to estimate the size of the geometry
        const controlPoints = node.representations[0].controlpoints;

        const point1 = controlPoints[0];
        const point2 = controlPoints[node.representations[0].degree_v];
        const point3 = controlPoints[controlPoints.length - node.representations[0].degree_v-1];

        const distance = function(p1, p2){
            return Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + (p1[2] - p2[2]) ** 2);
        }

        const sizeY = distance(point1, point2);
        const sizeX = distance(point1, point3);

        return {sizeX: sizeX, sizeY: sizeY};
    }

    getBoxMaterial(node, materialInfo){
        let materials = [];

        // Define the two corner points
        const point1 = new THREE.Vector3(node.representations[0].xyz1[0], node.representations[0].xyz1[1], node.representations[0].xyz1[2]);
        const point2 = new THREE.Vector3(node.representations[0].xyz2[0], node.representations[0].xyz2[1], node.representations[0].xyz2[2]);

        // Calculate the box dimensions based on the two points
        const width = Math.abs(point2.x - point1.x);
        const height = Math.abs(point2.y - point1.y);
        const depth = Math.abs(point2.z - point1.z);

        for (let i = 0; i < 6; i++){ // for each face of the box create a material
            let material = materialInfo.matObj.clone();
            materialInfo.clones.push(material);
            let texlength_s = materialInfo.texlength_s;
            let texlength_t = materialInfo.texlength_t;

            // determine the scaling based on the type of mesh
            let sizeX, sizeY = 1;
            switch(i){
                case 0: // front
                case 1: // back
                    ({sizeX, sizeY} = {sizeX: depth, sizeY: height});
                    break;
                case 2: // top
                case 3: // bottom
                    ({sizeX, sizeY} = {sizeX: width, sizeY: depth});
                    break;
                case 4: // left
                case 5: // right
                    ({sizeX, sizeY} = {sizeX: width, sizeY: height});
                    break;
            }
            
            // adjust the textlength_s and textlength_t to the geometry
            const s = sizeX / texlength_s;
            const t = sizeY / texlength_t;

            this.applyTextureScale(material,s,t);

            materials.push(material);
        }

        return materials;
    }

    createMaterialForPrimitive(parentnodeid, node, materialInfo){
        // checks
        if (materialInfo == null){
            console.error("Material info not found for primitive in node: " + parentnodeid);
            return this.defaultMaterial;
        }else if (materialInfo.matObj == null){
            console.error("Material object is null for primitive in node: " + parentnodeid);
            return this.defaultMaterial;
        }

        // make an exception for box mesh
        if (node.subtype == "box"){
            return this.getBoxMaterial(node, materialInfo);
        }else if(node.subtype == "billboard"){
            return new THREE.SpriteMaterial({
                map: materialInfo.matObj.map.clone()
            })
        }

        // clone material so we can modify it and extract only the useful information
        let material = materialInfo.matObj.clone();
        materialInfo.clones.push(material);
        let texlength_s = materialInfo.texlength_s;
        let texlength_t = materialInfo.texlength_t;

        // determine the scaling based on the type of mesh
        let sizeX = 1, sizeY = 1;
        switch(node.subtype){
            case "rectangle":
                ({sizeX, sizeY} = this.getRectangleScale(node));
                break;
            case "cylinder":
                ({sizeX, sizeY} =  this.getCylinderScale(node));
                break;
            case "sphere":
                ({sizeX, sizeY} =  this.getSphereScale(node));
                break;
            case "nurbs":
                ({sizeX, sizeY} = this.getNurbsScale(node));
                break;
            default:
                // other primitives use 1,1 as the scale
                return material;
        }
        
        // adjust the textlength_s and textlength_t to the geometry
        const s = sizeX / texlength_s;
        const t = sizeY / texlength_t;

        this.applyTextureScale(material,s,t);

        // if its a polygon make the material have vertex colors and change the color of the material to white
        if (node.subtype == "polygon"){
            material.vertexColors = true;
            material.color = new THREE.Color(0xffffff);
        }

        return material;
    }
}


export { MyMaterialBuilder };