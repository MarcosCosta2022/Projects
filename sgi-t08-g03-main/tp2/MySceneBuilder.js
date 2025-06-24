import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import {MySceneData} from './parser/MySceneData.js';
import { MyNurbsBuilder } from './MyNurbsBuilder.js';
import {MyPrimitiveBuilder} from './builders/MyPrimitiveBuilder.js';
import {MyMaterialBuilder} from './builders/MyMaterialBuilder.js';
import { MyLightsBuilder } from './builders/MyLightsBuilder.js';


/**
 *  This class contains the contents of out application
 */
class MySceneBuilder  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */

    constructor(app) {
        this.app = app
        this.nurbbuilder = new MyNurbsBuilder(this.app);
        this.primitivebuilder = new MyPrimitiveBuilder(this.app);
        this.materialbuilder = new MyMaterialBuilder(this.app);
        this.lightsbuilder = new MyLightsBuilder(this.app);

        this.scene = null;
        this.cameras = null;
        this.startingCameraId = null;

        this.ambientLight = null;
        this.axis = null;

        this.wireframe = false;
        this.lights = {};
        this.selectedLightId = null;
        this.selectedLight = null;
        this.isSelectedLightVisible = false;
        this.hasLightHelper = false;

        this.skyboxMaterials = [];
    }
    
    /*
    Updates all the materials in the scene with the specified wireframe value.
    value is the desired wireframe state (true or false). 
    */
    setWireframe(value){ 
        // go through all the materials in the scene
        const materials = this.data.materials;

        for(let key in materials){
            const material = materials[key];
            const clones = material.clones;// Cloned instances of the material
            const wireframeOriginal = material.wireframe; // Original wireframe state  
            for(let i = 0; i < clones.length; i++){
                // Update wireframe property for all clones
                const clone = clones[i];
                clone.wireframe = value || wireframeOriginal;
                clone.needsUpdate = true;
            }
        }

        // go through the skybox materials
        for(let key in this.skyboxMaterials){
            const material = this.skyboxMaterials[key];
            material.wireframe = value;
        }
    }

    updateLightHelper(light){
        if(light.helper){
            //remove it from scene  
            this.scene.remove(light.helper);
            // create a new one
            light.helper = this.lightsbuilder.createLightHelper(light.light);
            if (light.helper){
                this.scene.add(light.helper);
            }
        }
    }

    setLightProperty(lights, property, value, updateHelper = false){
        for(let i = 0; i < lights.length; i++){
            lights[i].light[property] = value;
            if (updateHelper){
                this.updateLightHelper(lights[i]);
            }
        }
    }

    setLightHelper(light,value){
        for(let i = 0; i < light.length; i++){
            let helper = light[i].helper;
            if (helper){
                helper.visible = value;
            }else if (value){ // create the helper if it doesnt exist
                helper = this.lightsbuilder.createLightHelper(light[i].light);
                if (helper){
                    this.scene.add(helper);
                    light[i].helper = helper;
                }
            }
        }
    }

    setShadowMapSize(lights, value){
        for (let i = 0; i < lights.length; i++) {
            const light = lights[i].light;
    
            // Update shadow map size
            light.shadow.mapSize.width = value;
            light.shadow.mapSize.height = value;
            
            this.reCalculateShadowMap(light);
        }    
    }

    reCalculateShadowMap(light){
        light.shadow.camera.updateProjectionMatrix();
        if (light.shadow.map) // delete the shadow map so it can be regenerated
            light.shadow.map.dispose();
        light.shadow.map = null; // Force regeneration of the shadow map
    }


    setShadowFar(light, value){
        for (let i = 0; i < light.length; i++) {
            light[i].light.shadow.camera.far = value;
            
            this.reCalculateShadowMap(light[i].light);
        }
    }

    /*
    Creates a PerspectiveCamera using the given camera configuration.
    camera.angle - Field of view angle (in degrees).
   camera.near - Near clipping plane distance.
   camera.far - Far clipping plane distance.
   camera.location - Camera position as [x, y, z].
   camera.target - Target position as [x, y, z].

    */
    createPerspectiveCamera(camera) {
        const aspect = window.innerWidth / window.innerHeight;
        const angle = camera.angle;
        const near = camera.near;
        const far = camera.far;
        const location = camera.location;

        // Create the PerspectiveCamera object
        const cameraObject = new THREE.PerspectiveCamera(angle, aspect, near, far);
        cameraObject.position.set(location[0], location[1], location[2]);
        // Set the camera target
        const target = new THREE.Vector3(camera.target[0],camera.target[1],camera.target[2]);
        cameraObject.target = target;
        return cameraObject;
    }
/*
    Creates an OrthographicCamera using the given camera configuration.
    camera.near - Near clipping plane distance.
     camera.far - Far clipping plane distance.
    camera.location - Camera position as [x, y, z].
    camera.left - Left clipping plane coordinate.
    camera.right - Right clipping plane coordinate.
    camera.top - Top clipping plane coordinate.
    camera.bottom - Bottom clipping plane coordinate.
    camera.target - Target position as [x, y, z].
*/
    createOrthographicCamera(camera) {
        const aspect = window.innerWidth / window.innerHeight;
        const near = camera.near;
        const far = camera.far;
        const location = camera.location;
          // Adjust the left and right planes based on aspect ratio
        const left = camera.left * aspect;
        const right = camera.right * aspect;
        const top = camera.top;
        const bottom = camera.bottom;

        // Create an OrthographicCamera object
        const cameraObject = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
        cameraObject.position.set(location[0], location[1], location[2]);
         // Set the camera target
        cameraObject.target = new THREE.Vector3(camera.target[0],camera.target[1],camera.target[2]);
        return cameraObject;
    }

    /**
  Creates a set of cameras from the provided configuration objects.
  Stores the created cameras in the `this.cameras` object.
  
  @param {Object} cams - A dictionary of camera configuration objects. Each key represents 
                         a camera name, and the value is an object with camera properties
  */
    createCameras(cams) {
        this.cameras = {}; // Initialize an empty dictionary to store camera objects
        
        // iterate through the keys of the cameras object
        for (let key in cams) {
            let camera = cams[key]; // Access the camera configuration
            
            let cameraObject = null;
             // Determine the type of camera to create
            if(camera.type === "perspective") {
                cameraObject= this.createPerspectiveCamera(camera);
            } else if(camera.type === "orthogonal") {
                cameraObject = this.createOrthographicCamera(camera);
            }
             // Store the created camera in the `this.cameras` object
            if(cameraObject) {
                this.cameras[key] = cameraObject;
            }
        }

        console.log("Cameras created: " + Object.keys(this.cameras));
    }

    /**
     * Contructs a scene based on the given data
     * @param {MySceneData} data
     * @returns {THREE.Scene}
     */
    build(data){
        try{
            console.info("------------------ Building scene ------------------");

            this.data = data; // save the data for later use

            this.scene = new THREE.Scene();

            const globals = data.globals;

            if (!globals) throw new Error("Globals not found in the scene data");
            
            // Configure global scene properties
            this.setBackground(this.scene, globals); //set background
            this.addFog(this.scene, globals); // add fog
            this.addAmbientLight(this.scene, globals);//add ambient lighting
            this.addSkyBox(this.scene, globals);//add skybox

            // Retrieve and process the root node of the scene
            const rootNode = data.nodes[data.rootId];
            if (!rootNode || rootNode.type !== "node"){
                throw new Error("Root node not found or not a node");
            }
            // Create the root node and add it to the scene
            const rootGroup = this.createNode(data.nodes[data.rootId]);
            this.scene.add(rootGroup);
            
            // create the axis for now
            this.axis = new MyAxis(this)
            this.axis.visible = false;
            this.scene.add(this.axis);

            // build the cameras
            this.createCameras(data.cameras);

            // set the starting camera
            this.startingCameraId = data.activeCameraId;

            console.log("Scene successfully built");
            return this.scene;
            
        } catch (e){
            console.error(e);
            return null;
        }
        return null;
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

    getColorFromRGB(rgb) { // simpler than the one above
        const color = new THREE.Color(rgb[0], rgb[1], rgb[2]);
        color.convertSRGBToLinear();
        return color;
    }

     // Sets background to the specified THREE.js scene.
    setBackground(scene,data){
        const backgroundColor = data.background; // Retrieve the background color array
        scene.background = new THREE.Color(backgroundColor[0], backgroundColor[1], backgroundColor[2], THREE.SRGBColorSpace);
    }

     // Adds fog to the specified THREE.js scene.
    addFog(scene,data){
        // Add fog to the scene
        const fogColorVec = data.fog.color;
        const fogColor = this.RGBVectorToStr(fogColorVec);
        const fogNear = data.fog.near;         // Distance where the fog starts
        const fogFar = data.fog.far;        // Distance where the fog fully obscures objects
        scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
    }

    // Adds an ambient light to the specified THREE.js scene.
    addAmbientLight(scene, data){
        const aData = data.ambient;  // Retrieve ambient light data from the global configuration
        const ambientLight = new THREE.AmbientLight(); // Create a new AmbientLight instance
        const color = this.getColorFromRGB([aData[0], aData[1], aData[2]]);// Convert RGB values from `aData` to a THREE.Color instance
        ambientLight.color = color;
        ambientLight.intensity = aData[3];   // Set the light intensity from the fourth value in `aData`
        scene.add(ambientLight); // Add the ambient light to the scene
        this.ambientLight = ambientLight;
    }
    // Adds a sky box to the specified THREE.js scene.
    addSkyBox(scene, data){
        const skyBoxData = data.skybox;

        if (!skyBoxData) return;// If no skybox data is provided, exit early

        // extract relevant data
        const emissive = this.getColorFromRGB(skyBoxData.emissive);// Convert RGB emissive color
        const intensity = skyBoxData.intensity; //Emissive intensity
        const textureIDS = [skyBoxData.right, skyBoxData.left, skyBoxData.up, skyBoxData.down, skyBoxData.front, skyBoxData.back];

        // create a default material in case the texture is not found
        const defaultMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff ,
            side: THREE.BackSide,
            fog: false // so its visible through fog
        });

        // Generate materials for each texture, or use default material if texture is missing
        const materials = textureIDS.map((texturePath) => {
            let texture = new THREE.TextureLoader().load(texturePath);
            if (!texture) {
                // return default material if texture is not found
                console.log("Texture not found: " + texture);
                return defaultMaterial;
            }
            texture.colorSpace = THREE.SRGBColorSpace;
            const material = new THREE.MeshStandardMaterial({
                map: texture,                     // Base color texture
                emissive: emissive,               // Emissive color (e.g., orange)
                emissiveIntensity: intensity,     // Emissive intensity
                side: THREE.BackSide,             // Render the inside of the box
                fog: false,                       // so its visible through fog
              });
            return material;
        });

        // store materials so we can later switch the wireframe
        this.skyboxMaterials = materials;

        // create the skybox geometry
        const size = skyBoxData.size;
        const skyBoxGeometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
        const skyBox = new THREE.Mesh(skyBoxGeometry, materials);

        // Set the skybox position based on the center specified
        skyBox.position.set(skyBoxData.center[0], skyBoxData.center[1], skyBoxData.center[2]);

        // Add the skybox to the scene
        scene.add(skyBox);
    }


    /**
     * Applies a transform to a group
     * @param {THREE.Group | THREE.Object3D} group  the group or object to apply the transform to
     * @param {*} transform  the transform object containing the type and the amount
     */
    applyTransform(group, transform){
           // Check the transformation type and apply accordingly
        if (transform.type === "T"){
            group.position.set(transform.translate[0], transform.translate[1], transform.translate[2]);  // Apply translation by setting the position
        }else if (transform.type === "R"){
            // Apply rotation by converting degrees to radians
            group.rotation.x = transform.rotation[0] * Math.PI / 180;
            group.rotation.y = transform.rotation[1] * Math.PI / 180;
            group.rotation.z = transform.rotation[2] * Math.PI / 180;
        } else if (transform.type === "S"){
            group.scale.set(transform.scale[0], transform.scale[1], transform.scale[2]);
        }
          }

    /**
     * Receives a node that has been already instantiated and the parent attributes and returns if the node needs to be iterated over to modify the group attributes
     * @param {*} node instantiated node
     * @param {*} parentMaterial the material passed by the parent
     * @param {*} parentCastShadow the cast shadow attribute passed by the parent
     * @param {*} parentReceiveShadow the receive shadow attribute passed by the parent
     * @returns 
     */
    isReiterationNeeded(node,parentMaterial,parentCastShadow, parentReceiveShadow){
        // if the node doesnt have it's own material, then we need to iterate over the children
        if (!node.material) return true;

        // if the node has castshadows and receiveshadows attributes defined, then we dont need to iterate over the children
        if (node.castshadow !== null && node.castshadows !== undefined 
            && node.receiveshadow !== null && node.receiveshadow !== undefined) return false;

        // TODO: extend this function to reduce the number of iterations as much as possible
        // for example, checking if the instantiated material is the same as the parent material

        return true; // return true by default
    }

    /**
     * Resolves and returns the attributes for a node in a hierarchical structure, 
     * considering its own properties and those inherited from its parent.
     
    * @param {Object} node - The current node whose attributes are being resolved.

    * @param {Object|null} parentMaterial - The material inherited from the parent node (if any).
    * @param {boolean} parentCastShadow - Indicates if the parent node casts shadows.
    * @param {boolean} parentReceiveShadow - Indicates if the parent node receives shadows.
    */

    resolveAttributes(node, parentMaterial, parentCastShadow, parentReceiveShadow){
        // Initialize the attributes object with default values
        let attributes = {
            material: null,
            castshadows: false,
            receiveshadows: false
        }
         // Extract the shadow properties from the node
        const nodeCastShadow = node.castshadows;
        const nodeReceiveShadow = node.receiveshadows;

        // resolve material
        if (node.material){
            attributes.material = node.material;  // Node's own material takes priority
        }else if (parentMaterial){
            attributes.material = parentMaterial;
        }
        
        // Resolve shadow properties
        if (nodeCastShadow === true || parentCastShadow === true){
            attributes.castshadows = true;
        }else{
            attributes.castshadows = false;
        }
        
        if (nodeReceiveShadow === true || parentReceiveShadow === true){
            attributes.receiveshadows = true;
        }
        else{
            attributes.receiveshadows = false;
        }

        return attributes;
    }

    updateClonesAttributes(parentId, node,object, material = null, castshadows = false, receiveshadows=false){
        // check type if it's a object
        if (object.type === "Group" && node.type == "node"){ // then its a node
            // decide what are the attributes passed to the children
            const {material: mat, castshadows: cast_s, receiveshadows: rec_s} = this.resolveAttributes(node, material, castshadows, receiveshadows);
            // now based on the node.children, update the attributes of the children
            for(let i = 0; i < node.children.length; i++){
                this.updateClonesAttributes(node.id,node.children[i], object.children[i], mat, cast_s, rec_s);
            }
        }else if (object.type === "Mesh" && node.type === "primitive"){ // then its a primitive
            if (material){
                //remake the material for this primitive
                const primitiveMaterial = this.materialbuilder.createMaterialForPrimitive(parentId,node,material);
                object.material = primitiveMaterial;
            }
            // update the cast shadow
            object.castShadow = castshadows;
            // update the receive shadow
            object.receiveShadow = receiveshadows;
        }else if (object.type === "LOD" && node.type === "lod"){
            // update the children of the LOD
            for(let i = 0; i < node.lodnodes.length; i++){
                this.updateClonesAttributes(parentId,node.lodnodes[i].node, object.children[i], material, castshadows, receiveshadows);
            }
        }else if (this.isNodeLight(node)){
            this.saveLight(node.id, object);
        }else{
            console.log("Unexpected object type: " + object.type + " for node type: " + node.type);
        }
    }

    isNodeLight(node){
        return this.data.lightIds.includes(node.type);
    }

    isNodePrimitive(node){
        return node.type === "primitive";
    }

    saveLight(id, light){
        if(this.lights[id] === undefined){
            this.lights[id] = [];
        }
        this.lights[id].push({light:light});
    }

    /**
     * Creates a THREE.js Group for a given node and its children, applying materials, shadows, transformations, 
     * and other attributes recursively.
     * 
     * @param {Object} node - The node to be processed and converted into a THREE.js Group.
     * @param {Object|null} [parentMaterial=null] - The material inherited from the parent node.
     * @param {boolean} [parentCastShadow=false] - Whether shadows are cast by the parent node.
     * @param {boolean} [parentReceiveShadow=false] - Whether shadows are received by the parent node.
     * 
     * @returns {THREE.Group|null} - The created group or `null` if an unexpected node type is encountered.
     */
    createNode(node, parentMaterial= null,parentCastShadow = false, parentReceiveShadow = false){
        // Ensure the node type is valid
        if (node.type !== "node"){
            console.log("Unexpected node type: " + node.id + " with type " + node.type);
            return null;
        }
        
        if (node.instantiated && node.meshGroups[0]){ // if the node is being accessed more than once and it's already instantiated, clone it
            const group = node.meshGroups[0].clone(); // create a clone of the group
            node.meshGroups.push(group); // save the clone
            // update the attributes of group
            this.updateClonesAttributes(node.id,node , group, parentMaterial, parentCastShadow, parentReceiveShadow);
            return group;
        }

        // Resolve attributes (material, castshadows, receiveshadows) using the current node and parent attributes
        let {material, castshadows, receiveshadows} = this.resolveAttributes(node, parentMaterial, parentCastShadow, parentReceiveShadow);

        
        // Create a new THREE.Group to represent the node
        const group = new THREE.Group();
        const children = node.children;// Get the node's children

        // Process each child recursively
        for (let i = 0; i < children.length; i++){
            const child = children[i];

            // create the mesh for the child
            let mesh = null;
            if (child.type === "node"){ // if its a node
                mesh = this.createNode(child, material, castshadows, receiveshadows);
            }else if (this.isNodeLight(child)){ 
                // Handle lights using the light builder
                mesh = this.lightsbuilder.createLight(node.id, child);
                this.saveLight(child.id, mesh); // save the light mesh to be able to toggle it in the gui
            }else if (child.type === "lod"){   // Handle lod nodes
                mesh = this.createLOD(child, material, castshadows, receiveshadows);
            }else if (this.isNodePrimitive(child)){ // handle primitives
                const primitiveMaterial = this.materialbuilder.createMaterialForPrimitive(node.id,child, material);
                mesh = this.primitivebuilder.createPrimitive(child, primitiveMaterial, castshadows, receiveshadows);
            }else{
                console.log("Unexpected child type: " + child.id + " with type " + child.type);
            }
            // add the mesh to the group
            if (mesh) group.add(mesh);
        }
        
        // apply transformations if there is any
        if (node.transformations){
            for(let i = 0; i < Math.min(node.transformations.length, 3); i++){
                const transform = node.transformations[i];
                this.applyTransform(group, transform);
            }
        }

        // add group to the node
        node.meshGroups = [group];
        node.instantiated = true;

        return group;
    }

    /**
 * Creates a Level of Detail (LOD) object based on the given LOD data, materials, and shadow settings.
 * This function constructs the LOD by adding child nodes at different distances.
 * 
 * @param {Object} lod - The LOD configuration containing nodes and their associated distances.
 * @param {Object} material - The material to be applied to the LOD nodes.
 * @param {boolean} castshadows - Whether the LOD nodes should cast shadows.
 * @param {boolean} receiveshadows - Whether the LOD nodes should receive shadows.
 * 
 * @returns {THREE.LOD|null} - The created LOD object, or `null` if the LOD type is invalid.
 */
    createLOD(lod, material, castshadows, receiveshadows){
        // Check if the provided LOD object is valid
        if (lod.type !== "lod"){
            console.log("Unexpected lod type: " + lod.id + " with type " + lod.type);
            return null;
        }

        // Create a new THREE.LOD object to store the different levels of detail
        const lodObj = new THREE.LOD();
        // Iterate through each LOD node defined in the LOD configuration
        for (let key in lod.lodnodes){
            const lodnode = lod.lodnodes[key];// Get the LOD node data
            const noderef = lodnode.node;// Get the reference to the node
            const distance = lodnode.dist;// Get the distance at which this node is visible

             // Create the node using the provided reference and apply material, shadow properties
            const node = this.createNode(noderef, material, castshadows, receiveshadows);
            if (node){
                 // If the node is created successfully, add it to the LOD object at the specified distance
                lodObj.addLevel(node, distance);
            }
        }

        return lodObj;
    }
}


export { MySceneBuilder };