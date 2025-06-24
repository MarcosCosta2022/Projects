import * as THREE from 'three';
import { MyNurbsBuilder } from '../MyNurbsBuilder.js';


/**
 *  This class contains the contents of out application
 */
class MyPrimitiveBuilder  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */

    constructor(app) {
        this.app = app
        this.nurbbuilder = new MyNurbsBuilder(this.app);

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

    getColorFromRGB(rgb) { // simpler than the one above
        const color = new THREE.Color(rgb[0], rgb[1], rgb[2]);
        color.convertSRGBToLinear();
        return color;
    }

    createBox(node,material){
       
        // Define the two corner points
        const point1 = new THREE.Vector3(node.representations[0].xyz1[0], node.representations[0].xyz1[1], node.representations[0].xyz1[2]);
        const point2 = new THREE.Vector3(node.representations[0].xyz2[0], node.representations[0].xyz2[1], node.representations[0].xyz2[2]);

        // Calculate the box dimensions based on the two points
        const width = Math.abs(point2.x - point1.x);
        const height = Math.abs(point2.y - point1.y);
        const depth = Math.abs(point2.z - point1.z);

        // Calculate the box center by averaging the two points
        const centerX = (point1.x + point2.x) / 2;
        const centerY = (point1.y + point2.y) / 2;
        const centerZ = (point1.z + point2.z) / 2;
        const center = new THREE.Vector3(centerX, centerY, centerZ);

        // Create the box geometry and mesh
        const geometry = new THREE.BoxGeometry(width, height, depth, node.representations[0].parts_x, node.representations[0].parts_y, node.representations[0].parts_z);
        
        const box = new THREE.Mesh(geometry, material);

        // Position the box at the calculated center
        box.position.copy(center);

        return box;
    }

    createCylinder(node,material){
        const repre = node.representations[0];

        const geometry = new THREE.CylinderGeometry(repre.top, repre.base, repre.height, repre.slices, repre.stacks, 
            !repre.capsclose, repre.thetastart / 180 * Math.PI, repre.thetalength / 180 * Math.PI);

        const cylinder = new THREE.Mesh(geometry, material);

        return cylinder;
    }

    createNurbs(node,material){
        // the points have to be seperated into lists  of degree_v
        let controlPoints = [];
        const degree_u = node.representations[0].degree_u;
        const degree_v = node.representations[0].degree_v;

        for(let i = 0; i < degree_u+1; i++){
            let row = [];
            for(let j = 0; j < degree_v+1; j++){
                row.push(node.representations[0].controlpoints[i * (degree_v+1) + j]);
            }
            controlPoints.push(row);
        } 

        const surfaceData = this.nurbbuilder.build(controlPoints, degree_u, degree_v, 
            node.representations[0].parts_u, node.representations[0].parts_v, material);

        const curve = new THREE.Mesh(surfaceData, material);
        
        return curve;
    }

    createPolygon(node,material) {
        const rep = node.representations[0];

        const colorCenter = this.getColorFromRGB(rep.color_c); // Center color as a THREE.Color
        const colorEdge = this.getColorFromRGB(rep.color_p);   // Edge color as a THREE.Color

        const geometry = new THREE.BufferGeometry();
    
        const positions = [];
        const colors = [];
        const indices = [];
        const uvs = [];
    
        // Generate vertices and colors
        for (let stack = 0; stack <= rep.stacks; stack++) {
            const r = (stack / rep.stacks) * rep.radius; // Radius of this stack
            const currentColor = colorCenter.clone().lerp(colorEdge, stack / rep.stacks); // Interpolate color for this stack
    
            for (let slice = 0; slice <= rep.slices; slice++) {
                const angle = (slice / rep.slices) * Math.PI * 2; // Angle around the circle
                const x = -r * Math.sin(angle); // y axis is the reference axis
                const y = r * Math.cos(angle);
    
                // Add vertex position
                positions.push(x, y, 0); // Z = 0 for XY plane
    
                // Add vertex color
                colors.push(currentColor.r, currentColor.g, currentColor.b);

                uvs.push(x+0.5, y +0.5); // Using X as U and Y as V
            }

            //console.log("layer " + stack + " color: " + currentColor.r + " " + currentColor.g + " " + currentColor.b);
        }
    
        // Generate indices for triangles
        for (let stack = 0; stack < rep.stacks; stack++) {
            for (let slice = 0; slice < rep.slices; slice++) {
                const first = stack * (rep.slices + 1) + slice;
                const second = first + rep.slices + 1;
    
                // Triangle 1
                indices.push(first, second, first + 1);
    
                // Triangle 2
                indices.push(second, second + 1, first + 1);
            }
        }
    
        // Set the buffers
        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3)
        );
        geometry.setAttribute(
            'color',
            new THREE.Float32BufferAttribute(colors, 3)
        );
        geometry.setAttribute(
            'uv',
            new THREE.Float32BufferAttribute(uvs, 2)
        ); // Add UV attribute
        geometry.setIndex(indices);

        geometry.computeVertexNormals();
    
        // Create the material
        material.vertexColors = true;

        // Create and return the mesh
        return new THREE.Mesh(geometry, material);
    }

    createSphere(node,material){

        const radius = node.representations[0].radius;
        const slices = node.representations[0].slices;
        const stacks = node.representations[0].stacks;
        let phistart = node.representations[0].phistart * Math.PI / 180;
        let philength = node.representations[0].philength * Math.PI / 180;
        let thetastart = node.representations[0].thetastart * Math.PI / 180;
        let thetalength = node.representations[0].thetalength * Math.PI / 180;

        const geometry = new THREE.SphereGeometry(radius, slices, stacks, phistart, philength, thetastart, thetalength);

        const sphere = new THREE.Mesh(geometry, material);

        return sphere;
    }
    createTriangle(node,material){
        const point1 = node.representations[0].xyz1;
        const point2 = node.representations[0].xyz2;
        const point3 = node.representations[0].xyz3;
       //create material
        const geometry = new THREE.BufferGeometry();
       
        const vertices = new Float32Array([
            point1[0], point1[1], point1[2],
            point2[0], point2[1], point2[2],
            point3[0], point3[1], point3[2]
        ]);

        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        // Calculate UV coordinates
        const v1v2 = [
            point2[0] - point1[0],
            point2[1] - point1[1],
            point2[2] - point1[2]
        ]; // Vector from point1 to point2

        const v1v3 = [
            point3[0] - point1[0],
            point3[1] - point1[1],
            point3[2] - point1[2]
        ]; // Vector from point1 to point3

        const v1v2Length = Math.sqrt(v1v2[0] ** 2 + v1v2[1] ** 2 + v1v2[2] ** 2);

        // Project v1v3 onto v1v2 to get the UV "s" coordinate of the third vertex
        const dotProduct = v1v3[0] * v1v2[0] + v1v3[1] * v1v2[1] + v1v3[2] * v1v2[2];
        const s3 = dotProduct / v1v2Length; // UV "s" coordinate for the third vertex

        // Calculate the perpendicular distance from point3 to the line formed by point1 and point2
        const crossProduct = [
            v1v3[1] * v1v2[2] - v1v3[2] * v1v2[1],
            v1v3[2] * v1v2[0] - v1v3[0] * v1v2[2],
            v1v3[0] * v1v2[1] - v1v3[1] * v1v2[0]
        ];
        const crossLength = Math.sqrt(crossProduct[0] ** 2 + crossProduct[1] ** 2 + crossProduct[2] ** 2);
        const t3 = crossLength / v1v2Length; // UV "t" coordinate for the third vertex

        // UV coordinates for the triangle
        const uvs = new Float32Array([
            0, 0,         // First vertex: UV (0, 0)
            v1v2Length, 0, // Second vertex: UV (v1v2Length, 0)
            s3, t3        // Third vertex: UV (s3, t3)
        ]);

        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

        geometry.setIndex([0, 1, 2]);

        geometry.computeVertexNormals();

        const triangle = new THREE.Mesh(geometry, material);

        return triangle;
    }
    
    createRectangle(node,material){
        const point1 = node.representations[0].xy1;
        const point2 = node.representations[0].xy2;

        // Calculate width and height based on the distance between the points
        const width = Math.abs(point2[0] - point1[0]);
        const height = Math.abs(point2[1] - point1[1]);

        // Determine the center of the rectangle
        const centerX = (point1[0] + point2[0]) / 2;
        const centerY = (point1[1] + point2[1]) / 2;

        // Create the geometry for the rectangle, we dont need to check if parts_x and y are null cuz if they are default values used
        const geometry = new THREE.PlaneGeometry(width, height, node.representations[0].parts_x, node.representations[0].parts_y);
        // Create the mesh
        const mesh = new THREE.Mesh(geometry, material);
        // Position the mesh at the center point
        mesh.position.set(centerX, centerY, 0);

        return mesh;
    }

    /**
     * Creates a primitive mesh based on the attributes passed
     * @param {*} node map containing the type and corresponding attributes
     * @param {THREE.Material} material material to be used on the mesh
     * @param {boolean} castshadows whether the mesh should cast shadow
     * @param {boolean} receiveshadows wether the mesh should receive shadow
     * @returns the mesh created
     */
    createPrimitive(node, material, castshadows, receiveshadows){
        let primitiveMesh = null;
        switch(node.subtype){
            case "rectangle":
                primitiveMesh =  this.createRectangle(node,material); break;
            case "triangle" :
                primitiveMesh =  this.createTriangle(node,material); break;
            case "box": 
                primitiveMesh =  this.createBox(node,material); break;
            case "cylinder":   
                primitiveMesh =  this.createCylinder(node,material); break;
            case "sphere":
                primitiveMesh = this.createSphere(node,material); break;
            case "nurbs":
                primitiveMesh = this.createNurbs(node,material); break;
            case "polygon":
                primitiveMesh = this.createPolygon(node,material); break;
            default:
                console.log("Unimplemented primitive: " + node.subtype);
        }
        if(primitiveMesh){
            // set the cast shadow and receive shadow attributes if defined
            if (castshadows){
                primitiveMesh.castShadow = castshadows;
            }
            if (receiveshadows){
                primitiveMesh.receiveShadow = receiveshadows;
            }
        }

        return primitiveMesh;
    }
}


export { MyPrimitiveBuilder };