import * as THREE from 'three';

/**
 *  Contains the content of a loaded scene
 *  Credits: Alexandre Valle (alexandre.valle@fe.up.pt)
 *  Version: 2023-10-13
 * 
 *  DO NOT CHANGE THIS FILE. IT WILL BE MODIFIED OR REPLACED DURING EVALUATION
 * 
 *  USAGE: you can read the contents of the file and use it to create the scene objects 
 *  in MyContents.js or in other classes called from MyContents.js
 */

class MySceneData  {

    constructor() {
      this.globals = null;
      this.fog = null;

      this.materials = []
      this.lights = [];
      this.textures = [];
      
      this.cameras = [];
      this.activeCameraId = null;
      
      this.nodes = [];
      this.lods = [];
      this.rootId = null;
  
      this.descriptors = [];

      this.customAttributeName = "custom"

      this.descriptors["globals"] = [
        {name: "background", type: "rgb" },
        {name: "ambient", type: "rgbint"},
        {name: "fog", type: "subelement", descriptor: "fog"},
        {name: "skybox", type: "subelement", descriptor: "skybox"}
      ]
  
      this.descriptors["fog"] = [
        {name: "color", type: "rgb" },
        {name: "near", type: "float"},
        {name: "far", type: "float"},
      ]

      this.descriptors["skybox"] = [
        {name: "size" , type: "vector3"},
        {name: "center", type: "vector3"},
        {name: "emissive", type: "rgb"},
        {name: "intensity", type: "float"},
        {name: "front", type: "string"},
        {name: "back", type: "string"},
        {name: "up", type: "string"},
        {name: "down", type: "string"},
        {name: "left", type: "string"},
        {name: "right", type: "string"}
      ]

      this.descriptors["texture"] = [
        {name: "id", type: "string" },
        {name: "filepath", type: "string"},
        {name: "isVideo", type: "boolean"}
      ]

      this.descriptors["material"] = [
        {name: "id", type: "string"},
        {name: "color", type: "rgb"},
        {name: "specular", type: "rgb"},
        {name: "shininess", type: "float"},
        {name: "emissive", type: "rgb"},
        {name: "transparent", type: "boolean"}, // added these two
        {name: "opacity", type: "float"},
        {name: "wireframe", type: "boolean", required: false, default: false},
        {name: "shading", type: "boolean", required: false, default: false},
        {name: "twosided", type: "boolean", required: false, default: false},
        {name: "bumpref", type: "string", required: false, default: null}, // bump map is to be used in later classes
        {name: "bumpscale", type: "float", required: false, default: 1.0},
        {name: "specularref", type: "string", required: false, default: null}, // bump map is to be used in later classes
        {name: "textureref", type: "string",required: false, default: null}, // The color map. May optionally include an alpha channel. The texture map color is modulated by the diffuse color. Default null.
        {name: "texlength_s", type: "float", required: false, default: 1.0},
        {name: "texlength_t", type: "float", required: false, default: 1.0}
      ]

    this.descriptors["orthogonal"] = [ // compatible
      {name: "id", type: "string"},
      {name: "type", type: "string"},
      {name: "near", type: "float"},
      {name: "far", type: "float"},
      {name: "location", type: "vector3"},
      {name: "target", type: "vector3"},
      {name: "left", type: "float"},
      {name: "right", type: "float"},
      {name: "bottom", type: "float"},
      {name: "top", type: "float"},
    ]

    this.descriptors["perspective"] = [ // compatible
      {name: "id", type: "string"},
      {name: "type", type: "string"},
      {name: "angle", type: "float"},
      {name: "near", type: "float"},
      {name: "far", type: "float"},
      {name: "location", type: "vector3"},
      {name: "target", type: "vector3"}
    ]

        /*
            In the following primitives, distance is to be used with LODs (later classes)
        */
		this.descriptors["rectangle"] = [
      {name: "type", type: "string"},
			{name: "xy1", type: "vector2"},
			{name: "xy2", type: "vector2"},
      {name: "parts_x", type: "integer", required: false, default: 1},
			{name: "parts_y", type: "integer", required: false, default: 1}
      //{name: "distance", type: "float", required: false, default: 0.0}, // The distance at which to display this level of detail. Default 0.0.  
		]

    this.descriptors["billboard"] = [
      {name: "type", type: "string"},
			{name: "xy1", type: "vector2"},
			{name: "xy2", type: "vector2"},
      {name: "parts_x", type: "integer", required: false, default: 1},
			{name: "parts_y", type: "integer", required: false, default: 1}
      //{name: "distance", type: "float", required: false, default: 0.0}, // The distance at which to display this level of detail. Default 0.0.  
		]

		this.descriptors["triangle"] = [
      {name: "type", type: "string"},
			{name: "xyz1", type: "vector3"},
			{name: "xyz2", type: "vector3"},
			{name: "xyz3", type: "vector3"},  
		]

    this.descriptors["box"] = [
      {name: "type", type: "string"},
			{name: "xyz1", type: "vector3"},
			{name: "xyz2", type: "vector3"},
			{name: "parts_x", type: "integer", required: false, default: 1},
			{name: "parts_y", type: "integer", required: false, default: 1},
      {name: "parts_z", type: "integer", required: false, default: 1}
      ///{name: "distance", type: "float", required: false, default: 0.0}, // The distance at which to display this level of detail. Default 0.0.  
    ]

    this.descriptors["cylinder"] = [
      {name: "type", type: "string"},
      {name: "base", type: "float"},
      {name: "top", type: "float"},
      {name: "height", type: "float"},
      {name: "slices", type: "integer"},
      {name: "stacks", type: "integer"},
      {name: "capsclose", type: "boolean", required: false, default: false},
      {name: "thetastart", type: "float", required: false, default: 0.0},
      {name: "thetalength", type: "float", required: false, default: 360}
      //{name: "distance", type: "float", required: false, default: 0.0}, // The distance at which to display this level of detail. Default 0.0.  
    ]

    /*
        // to be used in final classes of TP2 or in TP3
    this.descriptors["model3d"] = [
      {name: "type", type: "string"},
			{name: "filepath", type: "string"},
      {name: "distance", type: "float", required: false, default: 0.0}, // The distance at which to display this level of detail. Default 0.0.  
		]
      */


		this.descriptors["sphere"] = [
      {name: "type", type: "string"},
			{name: "radius", type: "float"},
			{name: "slices", type: "integer"},
			{name: "stacks", type: "integer"},
      {name: "thetastart", type: "float", required: false, default: 0.0},
      {name: "thetalength", type: "float", required: false, default: 180},
      {name: "phistart", type: "float", required: false, default: 0.0},
      {name: "philength", type: "float", required: false, default: 360}
      //{name: "distance", type: "float", required: false, default: 0.0}, // The distance at which to display this level of detail. Default 0.0.  
		]
        

    this.descriptors["nurbs"] = [
      {name: "type", type: "string"},
			{name: "degree_u", type: "integer"},
			{name: "degree_v", type: "integer"},
      {name: "parts_u", type: "integer"},
      {name: "parts_v", type: "integer"},
      //{name: "distance", type: "float", required: false, default: 0.0}, // The distance at which to display this level of detail. Default 0.0.  
      {name: "controlpoints", type: "list", listOf: "vector3"}
		]

    this.descriptors["polygon"] = [ // compatible
      {name: "type", type: "string"},
      {name: "radius", type: "float"},
      {name: "stacks", type: "integer"},
      {name: "slices", type: "integer"},
      {name: "color_c", type: "rgb"},
      {name: "color_p", type: "rgb"},
    ]

		this.descriptors["spotlight"] = [
       {name: "type", type: "string"},//
			 {name: "id", type: "string" },//
			 {name: "color", type: "rgb"},
			 {name: "position", type: "vector3"}, 	
			{name: "target", type: "vector3"}, 		
			{name: "angle", type: "float"},
       {name: "enabled", type: "boolean", required: false, default: true},
			 {name: "intensity", type: "float", required: false, default: 1.0},
			 {name: "distance", type: "float", required: false, default: 1000},
			 {name: "decay", type: "float", required: false, default: 2.0},
			{name: "penumbra", type: "float", required: false, default: 1.0},
			 {name: "castshadow", type: "boolean", required: false, default: false},
       {name: "shadowfar", type: "float", required: false, default: 500.0},
       {name: "shadowmapsize", type: "integer", required: false, default: 512},
		]

		this.descriptors["pointlight"] = [
      {name: "type", type: "string"},
      {name: "id", type: "string" },
      {name: "color", type: "rgb"},
      {name: "position", type: "vector3"}, 
      {name: "enabled", type: "boolean", required: false, default: true},
      {name: "intensity", type: "float", required: false, default: 1.0},
      {name: "distance", type: "float", required: false, default: 1000},
      {name: "decay", type: "float", required: false, default: 2.0},
			{name: "castshadow", type: "boolean", required: false, default: false},
      {name: "shadowfar", type: "float", required: false, default: 500.0},
      {name: "shadowmapsize", type: "integer", required: false, default: 512},		
		]

		this.descriptors["directionallight"] = [
      {name: "type", type: "string"},
      {name: "id", type: "string" },
      {name: "color", type: "rgb"},
      {name: "position", type: "vector3"},
      {name: "enabled", type: "boolean", required: false, default: true},
			{name: "intensity", type: "float", required: false, default: 1.0},
			{name: "castshadow", type: "boolean", required: false, default: false},
      {name: "shadowleft", type: "float", required: false, default: -5.0},
      {name: "shadowright", type: "float", required: false, default: 5.0}, 
      {name: "shadowbottom", type: "float", required: false, default: -5.0},
      {name: "shadowtop", type: "float", required: false, default: 5.0}, 
      {name: "shadowfar", type: "float", required: false, default: 500.0},
      {name: "shadowmapsize", type: "integer", required: false, default: 512},
		]

      this.descriptors["keyframe"] = [
        {name: "position", type: "vector3"},
        {name: "rotationY", type: "float"},
        {name: "time", type: "float"}
      ]

      this.descriptors["ballon"] =[
        {name : "model", type: "string"},
        {name : "route", type: "string"}
      ]

      this.primaryNodeIds = ["globals", "fog" ,"textures", "materials", "cameras", "graph"]

      this.primitiveIds = ["cylinder", "rectangle", "triangle", "sphere", "nurbs" , "box", "model3d", "skybox", "polygon" , "billboard"]

      this.lightIds = ["spotlight", "pointlight", "directionallight"]


      // extra structures from the game
      // extra structures from the game
      this.powerupNodeId = null;
      this.obstacleNodeId = null;
      this.ballonNodesIds = [];

      this.obstaclesData = [];
      this.powerUpsData = [];
      this.trackMaterial = null;
      this.path = null; // includes points, width, segments
      this.routes = {};
      this.ballonsData = {};
  }

  setPowerUpsData(data){
    this.powerUpsData = data;
  }

  setObstaclesData(data){
    this.obstaclesData = data;
  }

  addObstacle(obstacle){
    this.obstaclesData.push(obstacle);
  }

  addBallonData(id, data){
    if (this.ballonsData[id] !== undefined) throw new Error("Ballon with id " + id + " already exists")
    this.ballonsData[id] = data;
  }

  addRoute(id, route){
    if (this.routes[id] !== undefined) throw new Error("Route with id " + id + " already exists")
    this.routes[id] = route;
  }

  addBallonId(id){
    console.log("added ballon id: " + id)
    this.ballonNodesIds.push(id);
  }

  setObstacleNodeId(id){
    this.obstacleNodeId = id;
  }

  setPowerUpNodeId(id){
    this.powerupNodeId = id;
  }

  setPath(path){

    this.path = path
  }

  setTrackMaterial(material){
    this.trackMaterial = material;
  }


    createCustomAttributeIfNotExists(obj) {
        if (obj[this.customAttributeName] === undefined || obj[this.customAttributeName] === null) obj[this.customAttributeName] = {}
    }

    setGlobals(globals) {
        this.globals = globals;
        this.createCustomAttributeIfNotExists(globals)
        console.debug("added globals " + JSON.stringify(globals));
    }

    getGlobals() {
        return this.globals;
    }

    setFog(fog) {
        this.fog = fog;
        this.createCustomAttributeIfNotExists(fog)
        console.debug("added fog " + JSON.stringify(fog));
    }

    getFog() {
        return this.fog;
    }

    setSkybox(skybox) {
        this.skybox = skybox;
        this.createCustomAttributeIfNotExists(skybox)
        console.debug("added skybox " + JSON.stringify(skybox));
    }

    setRootId(rootId) {
        console.debug("set graph root id to '" + rootId + "'");
        this.rootId = rootId;
    }

    getMaterial(id) {
        let value = this.materials[id]
        if (value === undefined) return null
        return value
    }

    addMaterial(material) {
        let obj = this.getMaterial(material.id); 
        if (obj !== null && obj !== undefined) {
            throw new Error("inconsistency: a material with id " + material.id + " already exists!");		
        }
        this.materials[material.id] = material;
        material.clones = [];
        this.createCustomAttributeIfNotExists(material)
        console.debug("added material " + JSON.stringify(material));
    };

    addTexture(texture) {
        let obj = this.getTexture(texture.id); 
        if (obj !== null && obj !== undefined) {
            throw new Error("inconsistency: a texture with id " + texture.id + " already exists!");		
        }
        this.textures[texture.id] = texture;
        this.createCustomAttributeIfNotExists(texture)
        console.debug("added texture" + JSON.stringify(texture))
    };

    getTexture(id) {
        let value = this.textures[id]
        if (value === undefined) return null
        return value
    };

    setActiveCameraId(id) {
        console.debug("set active camera id to '" + id + "'");
        return this.activeCameraId = id;
    }

    getCamera(id) {
        let value = this.cameras[id]
        if (value === undefined) return null
        return value
    };

    setActiveCamera(id) {
        this.activeCameraId = id;
    }

    addCamera(camera) {
        if (camera.type !== "orthogonal" && camera.type !== "perspective") {
          throw new Error("inconsistency: unsupported camera type " + camera.type + "!");
        }

        let obj = this.getCamera(camera.id);
        if (obj !== null && obj !== undefined) {
            throw new Error("inconsistency: a camera with id " + camera.id + " already exists!");
        }
        this.cameras[camera.id] = camera
        this.createCustomAttributeIfNotExists(camera)
        console.debug("added camera " + JSON.stringify(camera))
    }

    getLight(id) {	
        let value = this.lights[id]
        if (value === undefined) return null
        return value
    }

    addLight(light) {
        var obj = this.getLight(light.id);
        if (obj !== null && obj !== undefined) {
            throw new Error("inconsistency: a light with id " + light.id + " already exists!");		
        }
        this.lights[light.id] = light;
        this.createCustomAttributeIfNotExists(light)
        console.debug("added light " + JSON.stringify(light));
    }

    getNode(id) {	
        let value = this.nodes[id];
        if (value === undefined) return null
        return value
    }

    createEmptyNode(id) {
        let obj = this.getNode(id) 
        if (obj !== null && obj !== undefined) {
            throw new Error("inconsistency: a node with id " + id + " already exists!");		
        }

        obj = {id: id, transformations: [], material:null, children: [], loaded: false, type:"node", castshadows: null, receiveshadows: null};
        this.addNode(obj);
        return obj;
    }

    addNode(node) {
        let obj = this.getNode(node.id) 
        if (obj !== null && obj !== undefined) {
            throw new Error("inconsistency: a node with id " + node.id + " already exists!");		
        }
        this.nodes[node.id] = node;
        this.createCustomAttributeIfNotExists(node)
        console.debug("added node " + JSON.stringify(node));
    };

    addChildToNode(node, child) {

        if (child === undefined) {
            throw new Error("inconsistency: undefined child add to node!");		
        }

        if (node.children === undefined) {
            throw new Error("inconsistency: a node has an undefined array of children!");		
        }
        node.children.push(child)
        this.createCustomAttributeIfNotExists(child)
        console.debug("added node child" + JSON.stringify(child));
    }

    getLOD(id) {
      let value = this.lods[id]
      if (value === undefined) return null
      return value
    }

    createEmptyLOD(id){
      let obj = this.getLOD(id)
      if (obj !== null && obj !== undefined) {
          throw new Error("inconsistency: a node with id " + id + " already exists!");		
      }

      obj = {id: id, type : "lod", loaded: false, lodnodes: []}
      this.addLOD(obj)
      return obj;
    }

    addLOD(lod) {
      let obj = this.getLOD(lod.id)
      if (obj !== null && obj !== undefined) {
          throw new Error("inconsistency: a lod with id " + lod.id + " already exists!");
      }
      this.lods[lod.id] = lod;
      this.createCustomAttributeIfNotExists(lod)
      console.debug("added lod " + JSON.stringify(lod));
    }

    addNodeToLOD(lod, node, distance) {
      if (node === undefined) {
          throw new Error("inconsistency: undefined node add to lod!");
      }

      if (lod.lodnodes === undefined) {
          throw new Error("inconsistency: a lod has an undefined array of nodes!");
      }

      lod.lodnodes.push({node: node, dist: distance})
      this.createCustomAttributeIfNotExists(node)
      console.debug("added lod node" + JSON.stringify(node));
    }


    createEmptyPrimitive() {
      let obj = { type : "primitive", subtype: null, representations: [], loaded : false}
      return obj
    }

    
    async onLoadFinished(app, contents) {
        console.info("------------------ consolidating data structures ------------------");

        console.debug("consolidating scene graph root...");
        const root = this.getNode(this.rootId);
        if (root === null) {
            console.error("root node is null");
            return;
        }
      
        console.debug("consolidating camera...");
        const camera = this.getCamera(this.activeCameraId);
        if (camera === null) {
            console.error("Starting camera invalid : " + this.activeCameraId);
        }

        console.debug("consolidating shadow attributes...");
        if (root) this.checkConflictingAttributes(root);

        console.debug("consolidating materials...");
        // load the materials and wait for them to be done
        await this.consolidateMaterials();
    }
    
    /**
     * Traverse the scene graph and check if the attributes receiveshadows and castshadows are correctly set
     * @param {*} node node to check
     * @param {*} castshadows parent castshadows attribute
     * @param {*} receiveshadows parent receiveshadows attribute
     */
    checkConflictingAttributes(node, castshadows = null, receiveshadows = null) {
      // once castshadows is set to true, all children must have it set to true or not defined
      // create a warning if a child of a node has castshadows set to false but the node has it set to true

      // check if this node has conflicting attributes
      if (castshadows && node.castshadows === false) {
        console.error("Node " + node.id + " has castshadows set to false but ancestor has it set to true");
        // correct the child to null in case its referenced by multiple nodes
        node.castshadows = null;
      }
      if (receiveshadows && node.receiveshadows === false) {
        console.error("Node " + node.id + " has receiveshadows set to false but ancestor has it set to true");
        // correct the child to null in case its referenced by multiple nodes
        node.receiveshadows = null;
      }

      const childCast = node.castshadows || castshadows;
      const childRec = node.receiveshadows || receiveshadows;


      for(let i = 0; i <node.children.length; i++) {
        let child = node.children[i];
        if (child.type === "node") {
          this.checkConflictingAttributes(child, childCast, childRec);
        }
      }
    }

    getColorFromRGB(rgb) {
      const color = new THREE.Color(rgb[0], rgb[1], rgb[2]);
      color.convertSRGBToLinear();
      return color;
    }

    /**
     * Load the textures that are used by the materials
     * @returns a promise that resolves when all textures are loaded
     */
    loadUsedTextures() {
      const promises = [];
  
      for (let id in this.textures) {
          let texture = this.textures[id];
          if (texture.used && !texture.loaded) {
              promises.push(this.loadTextureWithPromise(id)); // make them all load in parallel
          }
      }
  
      return Promise.all(promises); // wait for all textures to load
  }
  
  /**
   * Load a texture with a promise (asynchronous)
   * @param { string } id   the id of the texture
   * @param { number } length_s 
   * @param { number } length_t
   * @param { string } materialId
   * @returns 
   */
  loadTextureWithPromise(id, length_s = 1, length_t = 1, materialId = null) {
    return new Promise((resolve, reject) => {
        try {
            let texture = this.getTexture(id);
            if (texture === null) {
                console.error("Texture " + id + " not found for material " + materialId);
                resolve(null); // resolve with null if texture not found
                return;
            }

            let Nmipmaps = texture.highestMipmap + 1;
            let textureObj;
            if (texture.isVideo) {
                // load video texture
                textureObj = this.loadVideoTexture(texture.filepath);
                texture.loaded = true;
                texture.texObj = textureObj;
                resolve(textureObj);
            } else {
                const textureLoader = new THREE.TextureLoader();
                textureLoader.load(
                    texture.filepath,
                    (loadedTexture) => {
                        // Handle mipmaps
                        if (Nmipmaps > 0) {
                            this.loadMipMaps(loadedTexture, texture, Nmipmaps).then(() => {
                                texture.texObj = loadedTexture;
                                texture.loaded = true;
                                console.log("Loaded texture " + id);
                                resolve(loadedTexture);
                            });
                        } else {
                            loadedTexture.generateMipmaps = true;
                            texture.texObj = loadedTexture;
                            texture.loaded = true;
                            console.log("Loaded texture " + id);
                            resolve(loadedTexture);
                        }
                    },
                    undefined,
                    (err) => {
                        console.error("Failed to load texture " + id, err);
                        reject(err); // reject on error
                    }
                );
              }
        } catch (error) {
            reject(error); // reject in case of unexpected errors
        }
    });
  }

  /**
   * Asynchronously load the mipmaps of a texture
   * @param { THREE.Texture } loadedTexture 
   * @param { Object } textureData
   * @param { number } Nmipmaps
   * @returns 
   */
  async loadMipMaps(loadedTexture, textureData, Nmipmaps) {
    //initialize the mipmaps array
    loadedTexture.generateMipmaps = false;
    loadedTexture.mipmaps = [];

    // load first mipmap to get the size
    const mipmap0Path = textureData.mipmap0;
    await this.loadMipmapPromise(loadedTexture, 0, mipmap0Path);

    // if there is only one mipmap, return
    if (Nmipmaps === 1) { 
        textureData.texObj = loadedTexture;
        textureData.loaded = true;
        return loadedTexture;
    }

    // get the size of the first mipmap
    const width = loadedTexture.mipmaps[0].width;
    const height = loadedTexture.mipmaps[0].height;

    const mipmapPromises = [];
    for (let i = 1; i < Nmipmaps; i++) {
        const mipmapnPath = textureData["mipmap" + i];
        mipmapPromises.push(this.loadMipmapPromise(loadedTexture, i, mipmapnPath, width, height));
    }
    await Promise.all(mipmapPromises)
    textureData.texObj = loadedTexture;
    textureData.loaded = true;
    return loadedTexture;
  }
  
  /**
   * Asynchronously load a mipmap texture and store it in the parent texture
   * @param { THREE.Texture } parentTexture  the parent texture
   * @param { number } level  the mipmap level
   * @param { string } path  the path to the mipmap texture
   * @param { number } width  the width of the parent texture
   * @param { number } height  the height of the parent texture
   * @returns  a promise that resolves when the mipmap is loaded
   */
  loadMipmapPromise(parentTexture, level, path, width = 0, height = 0){
      return new Promise((resolve, reject) => { // load the mipmap
          new THREE.TextureLoader().load(
              path, // path to the mipmap texture
              (mipmapTexture) => { // after loading the mipmap

                  // create a canvas to store the mipmap
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  const img = mipmapTexture.image;

                  const canvasWidth = width? Math.floor(Math.min(width / Math.pow(2, level), width)) : img.width;
                  const canvasHeight = height? Math.floor(Math.min(height / Math.pow(2, level), height)) : img.height;
  
                  // set the canvas size to the size corresponding to the mipmap level
                  canvas.width = canvasWidth;
                  canvas.height = canvasHeight;
                  
                  // Resize and draw the image onto the canvas
                  ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvasWidth, canvasHeight);
  
                  // store the canvas in the parent texture
                  parentTexture.mipmaps[level] = canvas;
                  console.debug("Added mipmap level " + level + " to texture.");
                  resolve(); // finish the promise
              },
              undefined,
              (err) => {
                  console.error("Failed to load mipmap " + path, err);
                  reject(err);
              }
          );
      });
  }

  loadVideoTexture(videoSrc) {
    // Create a video element dynamically
    const video = document.createElement('video');
    video.src = videoSrc;
    video.crossOrigin = 'anonymous'; // Allow cross-origin video loading if needed
    video.loop = true; // Set video to loop if desired
    video.muted = true; // Mute the video if needed
    
    video.play();

    // Create a VideoTexture from the video element
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.colorSpace = THREE.SRGBColorSpace;

    return videoTexture;
  }


  getLoadedTexture(id){
    if (id === null || id === undefined) return null;
    let texture = this.getTexture(id);
    if (texture === null || texture === undefined) return null;
    if (!texture.loaded) return null;
    return texture.texObj;
  }

  createMaterial(spec) {
      let material;

      const color = this.getColorFromRGB(spec.color);
      const emissive = this.getColorFromRGB(spec.emissive);
      const specular = this.getColorFromRGB(spec.specular);
      const texlength_s = spec.texlength_s || 1.0;
      const texlength_t = spec.texlength_t || 1.0;
      const bumpscale = spec.bumpscale || 1.0;

      // create the material based on the specifications
      material = new THREE.MeshPhongMaterial({
          color: color,
          emissive: emissive,
          specular: specular,
          shininess: spec.shininess,
          transparent: spec.transparent,
          opacity: spec.opacity,  
          wireframe: spec.wireframe,
          flatShading: spec.shading,
          side: spec.twosided ? THREE.DoubleSide : THREE.FrontSide,
          bumpScale: bumpscale
      });

      if (spec.textureref !== null && spec.textureref !== undefined) {
        material.map = this.getLoadedTexture(spec.textureref);
        material.map.repeat.set(texlength_s, texlength_t);
      }

      if (spec.bumpref !== null && spec.bumpref !== undefined) {
        material.bumpMap = this.getLoadedTexture(spec.bumpref);
        material.bumpMap.repeat.set(texlength_s, texlength_t);
      }

      if (spec.specularref !== null && spec.specularref !== undefined) {
        material.specularMap = this.getLoadedTexture(spec.specularref);
        if (material.specularMap !== null)
          material.specularMap.repeat.set(texlength_s, texlength_t);
      }

      return material;
  }

  signalUsedTextures() {
    for (let id in this.materials) {
      let materialElem = this.materials[id];
      if (materialElem.textureref !== null && materialElem.textureref !== undefined) {
          let texture = this.textures[materialElem.textureref];
          if (texture !== null && texture !== undefined) {
              texture.used = true;
          }
      }
      if (materialElem.bumpref !== null && materialElem.bumpref !== undefined) {
          let texture = this.textures[materialElem.bumpref];
          if (texture !== null && texture !== undefined) {
              texture.used = true;
          }
      }
      if (materialElem.specularref !== null && materialElem.specularref !== undefined) {
          let texture = this.textures[materialElem.specularref];
          if (texture !== null && texture !== undefined) {
              texture.used = true;
          }
      }
    }  
  }

  configureTextures() {
    for (let id in this.textures) {
      let texture = this.textures[id];
      if (texture !== null && texture !== undefined) {
          if (texture.texObj !== null && texture.texObj !== undefined) {
              texture.texObj.wrapS = THREE.RepeatWrapping;
              texture.texObj.wrapT = THREE.RepeatWrapping;
          }
      }
    }
  }
  

  consolidateMaterials() {
      return new Promise((resolve, reject) => {

        // determine which textures are used by marking the textures referenced in materials
        this.signalUsedTextures();

        // load only the used textures
        const texturePromise = this.loadUsedTextures();

        // once all the textures are finished loading 
        texturePromise.then(() => { 
          this.configureTextures(); // set repeat on the textures

          for (let id in this.materials) { // create the materials
            let materialElem = this.materials[id];
            let material = this.createMaterial(materialElem);
            materialElem.matObj = material;
          }

          resolve();
        });
      });
  }
}
export { MySceneData };

