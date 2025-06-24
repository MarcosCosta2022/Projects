import * as THREE from 'three';
import { MySceneData } from './MySceneData.js';

class MyFileReader  {

    /**
       constructs the object
    */ 
    constructor(onSceneLoadedCallback) {
      this.data = new MySceneData();
      this.errorMessage = null;
      this.onSceneLoadedCallback = onSceneLoadedCallback;
    }

    open(jsonfile)  {
      fetch(jsonfile)
        .then((res) => {
            if (!res.ok) {
                throw new Error (`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
          this.readJson(data);
          this.onSceneLoadedCallback(this.data);
        })
        .catch((error) =>
            console.error("Unable to fetch data:", error));
    };

	/**
	 * Read the json file and loads the data
	 */
	readJson(data) {
		try {
			let rootElement = data["yasf"];
			if (rootElement === null || rootElement === undefined) {
				throw new Error("root element 'yasf' is null or undefined");
			}
			this.loadGlobals(rootElement);
			this.loadTextures(rootElement);
			this.loadMaterials(rootElement);
			this.loadCameras(rootElement);
			this.loadNodesAndLODS(rootElement);
			this.loadGame(rootElement);
		}
		catch (error) {
			this.errorMessage = error;
		}
	}

	/**
	 * checks if any unknown node is child a given element
	 * @param {*} parentElem 
	 * @param {Array} list an array of strings with the valid node names
	 */
	checkForUnknownNodes(parentElem, list) {
		// for each of the elem's children
		for (let i=0; i< parentElem.children.length; i++) {	
			let elem = parentElem.children[i]
			// is element's tag name not present in the list?
			if (list.includes(elem.tagName) === false) {
				// unkown element. Report!
				throw new Error("unknown json element '" + elem.tagName + "' descendent of element '" + parentElem.tagName + "'")
			}
		}
	}

	/**
	 *  checks if any unknown attributes exits at a given element
	 * @param {*} elem 
	 *  @param {Array} list an array of strings with the valid attribute names	  
	*/
	checkForUnknownAttributes(elem, list) {
		// for each elem attributes
		for (let attrib in elem) {
			if (list.includes(attrib) === false) {
				// report!
				console.log(elem);
				throw new Error("unknown attribute '" + attrib + "' in element '" + elem + "'")
			}
		}
	}

	toArrayOfNames(descriptor) {
		let list = []
		for (let i=0; i < descriptor.length; i++) {
			const attr = descriptor[i];
			list.push(attr.name);
		}
		return list 
	}

	/**
	 * returns the index of a string in a list. -1 if not found
	 * @param {Array} list an array of strings
	 * @param {*} searchString the searched string
	 * @returns the zero-based index of the first occurrence of the specified string, or -1 if the string is not found
	 */
	indexOf(list, searchString) {
		if(Array.isArray(list)) {
			return list.indexOf(searchString)
		}
		return -1;
	}

	/**
	 * extracts the color (rgba) from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {String} attributeName the attribute name
	 * @param {Boolean} required if the attribte is required or not
	 * @returns {THREE.Color} the color encoded in a THREE.Color object
	 */
	getRGBA(element, attributeName, required) {
		if (required == undefined) required = true;
		
		if (element == null) {
			throw new Error("element is null."); 
		}
		if (attributeName == null) {
			throw new Error("rgba attribute name is null."); 
		}
			
		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element.id + "': rgba value is null for attribute '" + attributeName + "' in element '" + element.id + "'."); 
			}
			return null;
		}

		// check if the number of components is correct
		const mapLength = Object.keys(value).length;
		if (mapLength !== 4) {
			throw new Error("attribute '" + attributeName + "': invalid " + mapLength + " number of components for a rgba.");
		}

		return this.getVectorN(value, ["r", "g", "b", "a"]);
	}

	/**
	 * extracts the color (rgba) from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {String} attributeName the attribute name
	 * @param {Boolean} required if the attribte is required or not
	 * @returns {float[]} the color encoded in a float array [r, g, b]
	 */
	getRGB(element, attributeName, required) {

		//console.log("getRGB for " + attributeName);

		if (required == undefined) required = true;
		
		if (element == null) {
			throw new Error("element is null."); 
		}
		if (attributeName == null) {
			throw new Error("rgb attribute name is null."); 
		}
			
		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element.id + "': rgb value is null for attribute '" + attributeName + "' in element '" + element.id + "'."); 
			}
			return null;
		}

		// check if the number of components is correct
		const mapLength = Object.keys(value).length;
		if (mapLength !== 3) {
			throw new Error("attribute '" + attributeName + "': invalid " + mapLength + " number of components for a rgb.");
		}

		return this.getVectorN(value, ["r", "g", "b"]);
	}

	/**
	 * extracts the color (rgbintensity) from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {String} attributeName the attribute name
	 * @param {Boolean} required if the attribte is required or not
	 * @returns {float[]} the color encoded in a float array [r, g, b]
	 */
	getRGBIntensity(element, attributeName, required) {
		if (required == undefined) required = true;
		
		if (element == null) {
			throw new Error("element is null."); 
		}
		if (attributeName == null) {
			throw new Error("rgba attribute name is null."); 
		}
			
		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element.id + "': rgbintensity value is null for attribute '" + attributeName + "' in element '" + element.id + "'."); 
			}
			return null;
		}

		// check if the number of components is correct
		const mapLength = Object.keys(value).length;
		if (mapLength !== 4) {
			throw new Error("attribute '" + attributeName + "': invalid " + mapLength + " number of components for a rgbintensity.");
		}

		return this.getVectorN(value, ["r", "g", "b", "intensity"]);
	}

	/**
	 * returns a rectangle2D from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {String} attributeName the attribute name 
	 * @param {boolean} required if the attribte is required or not
	 * @returns {Array} an array object with 4 elements: x1, y1, x2, y2
	 */
	getRectangle2D(element, attributeName, required) {
		
		if (required == undefined) required = true;
		
		if (element == null) {
			throw new Error("element is null.");
		}
		if (attributeName == null) {
			throw new Error("rectangle2D attribute name is null."); 
		}
			
		let value = element.getAttribute(attributeName);
		if (value == null) {
			if (required) {
				throw new Error("element '" + element.id + ": rectangle2D value is null for attribute " + attributeName + "."); 
			}
			return null;
		}
		
		let  temp = value.split(' ');
		if (temp.length != 4) {
			throw new Error("element '" + element.id + ": invalid " + temp.length + " number of components for a rectangle2D, in attribute " + attributeName + "."); 
		}
		
		let rect = {};
		rect.x1 = parseFloat(temp[0]);
		rect.y1 = parseFloat(temp[1]);
		rect.x2 = parseFloat(temp[2]);
		rect.y2 = parseFloat(temp[3]);
		return rect;
	}

	getVectorN(value, keys) {
		let vector = new Array();
		for (let i = 0; i < keys.length; ++i) {
			const key = keys[i];
			const component = value[key];
			if (component === null || component === undefined) {
				throw new Error("element '" + value + "': vector" + keys.length + " value is null for '" + key);
			}
			vector.push(component);
		}
		return vector;
	}

	/**
	 * returns a vector3 from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName the attribute name 
	 * @param {*} required if the attribte is required or not
	 * @returns {THREE.vector3} the vector3 encoded in a THREE.Vector3 object
	 */
	getVector3(element, attributeName, required) {
		if (required == undefined) required = true;
		
		if (element == null) {
			throw new Error("element is null."); 
		}
		if (attributeName == null) {
			throw new Error("vector3 attribute name is null."); 
		}
			
		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element.id + "': vector3 value is null for attribute '" + attributeName + "' in element '" + element.id + "'."); 
			}
			return null;
		}

		return this.getVectorN(value, ["x", "y", "z"]);
	}

	/**
	 * returns a vector2 from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName the attribute name 
	 * @param {*} required if the attribte is required or not
	 * @returns {THREE.vector3} the vector2 encoded in a THREE.Vector3 object
	 */
	getVector2(element, attributeName, required) {
		
		if (required == undefined) required = true;
		
		if (element == null) {
			throw new Error("element is null."); 
		}
		if (attributeName == null) {
			throw new Error("vector3 attribute name is null."); 
		}
			
		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element.id + ": vector2 value is null for attribute " + attributeName + "."); 
			}
			return null;
		}
		
		return this.getVectorN(value, ["x", "y"]);
	}
	/**
	 * returns an item from an element for a particular attribute and checks if the item is in the list of choices
	 * @param {*} element the xml element
	 * @param {*} attributeName the
	 * @param {*} choices the list of choices
	 * @param {*} required if the attribte is required or not
	 * @returns {String} the item
	 */
	getItem (element, attributeName, choices, required) {
		
		if (required == undefined) required = true;
		
		if (element == null) {
			throw new Error("element is null."); 
		}
		if (attributeName == null) {
			throw new Error("item attribute name is null."); 
		}
			
		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element.id + ": item value is null for attribute " + attributeName + "."); 
			}
			return null;		
		}
		
		value = value.toLowerCase();
		let index = this.indexOf(choices, value);
		if (index < 0) {
			throw new Error("element '" + element.id + ": value '" + value + "' is not a choice in [" + choices.toString() + "]"); 
		}
		
		return value;
	}
	
	/**
	 * returns a string from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName the attribute name
	 * @param {*} required if the attribte is required or not
	 * @returns {String} the string
	 */
	getString (element, attributeName, required) {
		
		if (required == undefined) required = true;
		
		if (element == null) {
			throw new Error("element is null."); 
		}
		if (attributeName == null) {
			throw new Error("string attribute name is null."); 
		}
			
		let value = element[attributeName];
		if (value == null && required) {
			//console.log(element);
			throw new Error("element '" + element.id + "': string value is null for attribute '" + attributeName + "'."); 
		}
		return value;
	}
	
	/**
	 * checks if an element has a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName 
	 * @returns {boolean} if the element has the attribute
	 */
	hasAttribute (element, attributeName) {
		if (element == null) {
			throw new Error("element is null."); 
		}
		if (attributeName == null) {
			throw new Error("string attribute name is null."); 
		}
			
		let value = element.getAttribute(attributeName);
		return (value != null);
	}
	
	/**
	 * returns a boolean from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName the 
	 * @param {*} required if the attribte is required or not
	 * @returns {boolean} the boolean value
	 */
	getBoolean(element, attributeName, required) {
		if (required == undefined) required = true;

		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element + ": in element '" + element + "' bool value is null for attribute '" + attributeName + "'."); 
			}
			return null;
		}
		if (typeof value !== "boolean") {
			throw new Error("element '" + element + ": in element '" + element + "' attribute '" + attributeName + "' should be bool but is '" + (typeof value) + "'")
		}

		return value
	}
	
	/**
	 * returns a integer from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName the 
	 * @param {*} required if the attribte is required or not
	 * @returns {Integer} the integer value
	 */
	getInteger(element, attributeName, required) {
		if (required == undefined) required = true;

		let value = element[attributeName];
		if (value == null) {
      if (required) {
        throw new Error("element '" + element + ": in element '" + element + "' integer value is null for attribute '" + attributeName + "'."); 
      }
      return null;
		}
    if (!Number.isInteger(value)) {
			throw new Error("element '" + element + ": in element '" + element + "' attribute '" + attributeName + "' should be integer but is '" + (typeof value) + "'")
    }

		return value
	}
	
	/**
	 * returns a float from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName the 
	 * @param {*} required if the attribte is required or not
	 * @returns {Float} the float value
	 */
	getFloat(element, attributeName, required) {
		if (required == undefined) required = true;

		let value = element[attributeName];
		if (value == null) {
      if (required) {
        throw new Error("element '" + element + ": in element '" + element + "' float value is null for attribute '" + attributeName + "'."); 
      }
      return null;
		}
    if (typeof value !== "number") {
			throw new Error("element '" + element + ": in element '" + element + "' attribute '" + attributeName + "' should be float but is '" + (typeof value) + "'")
    }

		return value
	}

	/*
   * TODO: Fix commet
		Load a xml attributes item based on a descriptor:
		Example: options = {elem: elem, descriptor: descriptor, extras: [["type", "pointlight"]]}
		where elem is a xml element, descriptor is an array of all the attributes description and extras are extra
		attributes to add to the resulting object.

		Each attribute descriptor is an object with the following properties:
		- name: the name of the attribute
		- type: the type of the attribute (string, boolean, integer, float, vector3, vector2, rgba, rectangle2D, item)
		- required: true if the attribute is required, false otherwise
		- default: the default value if the attribute is not required and not present in the xml element
		- choices: an array of choices if the type is item

	*/
  	loadJsonItem(options, checkUnknownAttributes = true) {
		// create an empty object
		let obj = {}

		if (options === null || options === undefined) {
			throw new Error("unable to load json item because arguments are null or undefined");
		}

		if (options.elem === null || options.elem === undefined) {
			throw new Error("unable to load json item because json element is null or undefined");
		}
				
		if (options.descriptor === null || options.descriptor === undefined) {
			throw new Error("unable to load json item because descriptor to parse element '" + options.elem.id + "' is null or undefined");
		}

		if (checkUnknownAttributes && options.elem.id !== null && options.elem.id !== undefined) {
			throw new Error("unable to load json item because id is already set in the item");
		}

		// Add the id to the element if the descriptor requires it
		for (let i in options.descriptor) {
			const attr = options.descriptor[i];
			if (attr.name == "id") {
				options.elem["id"] = options.key;
			}
		}

		// append extra parameters if any
		for (let i=0; i < options.extras.length; i++) {
			let extra = options.extras[i]
			obj[extra[0]] = extra[1]
			//console.log("extra: " + extra[0] + " = " + extra[1])
		}

		if (checkUnknownAttributes)
			this.checkForUnknownAttributes(options.elem, this.toArrayOfNames(options.descriptor))

		// for each descriptor, get the value
		for (let i=0; i < options.descriptor.length; i++) {
			let value = null;
			let descriptor = options.descriptor[i]
			if (descriptor.type==="string")  {
				value = this.getString(options.elem, descriptor.name, descriptor.required);
      		}
			else if (descriptor.type==="boolean") {
				value = this.getBoolean(options.elem, descriptor.name, descriptor.required);
      		}
			else if (descriptor.type==="integer") {
				value = this.getInteger(options.elem, descriptor.name, descriptor.required);	
      		}
			else if (descriptor.type==="float") {
				value = this.getFloat(options.elem, descriptor.name, descriptor.required);	
      		}
			else if (descriptor.type==="vector3") {
				value = this.getVector3(options.elem, descriptor.name, descriptor.required);
      		}
			else if (descriptor.type==="vector2") {
				value = this.getVector2(options.elem, descriptor.name, descriptor.required);
      		}
			else if (descriptor.type==="rgba") {
				value = this.getRGBA(options.elem, descriptor.name, descriptor.required);
      		}
			else if (descriptor.type==="rgb"){
				value = this.getRGB(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type==="rgbint"){
				value = this.getRGBIntensity(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type==="rectangle2D") {
				value = this.getRectangle2D(options.elem, descriptor.name, descriptor.required);
      		}
			else if (descriptor.type === "subelement"){
				value = this.loadJsonItem({
					key: descriptor.name,
					elem: options.elem[descriptor.name],
					descriptor: this.data.descriptors[descriptor.descriptor],
					extras: [["type", descriptor.name]]
				})
			}
			else if (descriptor.type==="item") {
				value = this.getItem(options.elem, descriptor.name, descriptor.choices, descriptor.required);
      		}
			else if (descriptor.type==="list") {
				value = [];
				for (let key in options.elem[descriptor.name]) {
					const elem = options.elem[descriptor.name][key];
					let fakeElem = {
						"value" : elem
					}
					const newObj = this.getVector3(fakeElem, "value", true);
					value.push(newObj);
				}
				//console.log(value);
			}else {
				throw new Error("element '" + options.elem + " invalid type '" + descriptor.type + "' in descriptor");
			} 

			// if the value is null and the attribute is not required, then use the default value
			if (value == null && descriptor.required == false && descriptor.default != undefined) {
				value = descriptor.default;
			}
			
			// store the value in the object
			obj[descriptor.name] = value;
		}
		// return the object
		//console.log("here")
		//console.log(obj);
		return obj;
  	}		
	
	loadJsonItems(parentElemen, tagName, descriptor, extras, addFunc) {
		for (let elem in parentElemen) {
			// check if the element name is camel case
			if (elem !== elem.toLowerCase()) {
				console.warn("Element with identifier containing uppercase letters: " + elem);
			}

			let obj = this.loadJsonItem({
				key: elem,
				elem: parentElemen[elem],
				descriptor: descriptor,
				extras: extras
			});
			addFunc.bind(this.data)(obj);
		}
	}

	/*
	 * Load globals element
	 * 
	 */
  	loadGlobals(rootElement) {
		let globals = rootElement["globals"];

		if (globals === null || globals === undefined) {
			throw new Error("globals element is null or undefined");
		}

		this.data.setGlobals(this.loadJsonItem({
			key: "globals",
			elem: globals,
			descriptor: this.data.descriptors["globals"],
			extras: [["type", "globals"]]
		}));
  	}

	/*
	 * Load fog element
	 * 
	 */
	loadFog(rootElement) {
		let fog = rootElement["fog"];

		if (fog === null || fog === undefined) {
			throw new Error("fog element is null or undefined");
		}

			this.data.setFog(this.loadJsonItem({
		key: "fog",
		elem: fog,
		descriptor: this.data.descriptors["fog"],
		extras: [["type", "fog"]]
		}))
	}

	/**
	 * Load skybox element
	 */
	loadSkybox(rootElement) {
		let skybox = rootElement["skybox"];

		if (skybox === null || skybox === undefined) {
			console.error("skybox element is null or undefined in yasf file");
			return;
		}

		this.data.setSkybox(this.loadJsonItem({
			key: "skybox",
			elem: skybox,
			descriptor: this.data.descriptors["skybox"],
			extras: [["type", "skybox"]]
		}));
	}

	/**
	 * Load the textures element
	 * @param {*} rootElement 
	 */
	loadTextures(rootElement) {
		let elem = rootElement["textures"];

		const descriptor = this.data.descriptors["texture"].slice();

		for (let tex in elem) {
			// get tex nummber of attributes
			const texAttrs = elem[tex];
			let highestMipmap = -1;

			// check if the texture name is camel case
			if (tex !== tex.toLowerCase()) {
				console.warn("Texture with identifier containing uppercase letters: " + tex);
			}

			for(let mm = 7; mm >= 0; mm--){ // get N - highest mipmap level
				const mipmapN = texAttrs["mipmap" + mm];
				if(mipmapN != null && mipmapN != undefined){
					highestMipmap = mm;
					break;
				}
			}

			let additionalAttributes = [];
			// add attributes to the descriptor based on the elementLength
			for (let i = 0 ; i < highestMipmap +1; i++){
				additionalAttributes.push({
					name: "mipmap" + i,
					type: "string"
				});
			}

			// add aditional attributes to the descriptor
			let newDescriptor = descriptor.concat(additionalAttributes);

			let obj = this.loadJsonItem({
				key: tex,
				elem: texAttrs,
				descriptor: newDescriptor,
				extras: [["type", "texture"], ["highestMipmap", highestMipmap]]
			});
			this.data.addTexture(obj);
		}
	}

	/**
	 * Load the materials element
	 * @param {*} rootElement 
	 */
	loadMaterials(rootElement) {
		let elem = rootElement["materials"];
		this.loadJsonItems(elem, 'material', this.data.descriptors["material"], [["type", "material"]], this.data.addMaterial)
	}

	/**
	 * Load the cameras element
	 * @param {*} rootElement 
	 */
	loadCameras(rootElement) {
		let camerasElem = rootElement["cameras"];

		for (let key in camerasElem) {
			let elem = camerasElem[key];
			if (key == "initial") {
				this.data.setActiveCameraId(elem);
				continue;
			}

			// check if the camera name is camel case
			if (key !== key.toLowerCase()) {
				console.warn("Camera with identifier containing uppercase letters: " + key);
			}

			let camType = elem["type"];
			if (camType == "orthogonal") {
				this.data.addCamera(this.loadJsonItem({
				key: key,
				elem: elem,
				descriptor: this.data.descriptors["orthogonal"],
				extras: [["type", "orthogonal"]]
				}));
			}
			else if (camType == "perspective") {
				this.data.addCamera(this.loadJsonItem({
				key: key,
				elem: elem,
				descriptor: this.data.descriptors["perspective"],
				extras: [["type", "perspective"]]
				}));
			}
			else {
				throw new Error("Unrecognized camera type '" + camType + "' in camera '" + key + "'");
			}
    	}
	}

	loadBallonsNodesIds(data){
		// check if data is an array of strings
		for( let index in data){
			let elem = data[index];
			this.data.addBallonId(elem);
		}
	}

	/**
	 * Load the nodes element
	 * @param {*} rootElement 
	 */
	loadNodesAndLODS(rootElement) {
		let graphElem = rootElement["graph"];
		this.graph = graphElem;

		for (let key in graphElem) {
			let elem = graphElem[key];

			if (key == "rootid") {
				this.data.setRootId(elem);
				continue;
			}else if(key == "balloons"){
				this.loadBallonsNodesIds(elem);
				continue;
			}else if(key == "obstacle"){
				this.data.setObstacleNodeId(elem);
				continue;
			}else if(key == "powerup"){
				this.data.setPowerUpNodeId(elem);
				continue;
			}

			// check if the name is in camel case
			if(key !== key.toLowerCase()){
				console.warn(elem["type"] + " with identifier container upper case letters: " + key);
			}

			if (elem["type"] === "node") {
				this.loadNode(key, elem);
			}else if (elem["type"] === "lod"){
				this.loadLOD(key, elem);
			}else{
				throw new Error("Unrecognized element type '" + elem["type"] + "' in element '" + key + "'");
			}
		}
	}

	loadLOD(id, lodElement) {
		let lodType = lodElement["type"];

		// get if node previously added (for instance because it was a child ref in other node)
		let obj = this.data.getLOD(id);
		if (obj == null) {
			// otherwise add a new node
			obj = this.data.createEmptyLOD(id);		
		}

		// load nodes references
		let nodesList = lodElement["lodNodes"];

		if (nodesList == null) {
			throw new Error("Invalid LOD nodes list in LOD: " + id);
		}

		// nodes list is of the format [ {nodeId: "nodeId", minDist: ff}, ...]
		let lowestMinDistNode = nodesList[0];
		for(let i in nodesList){
			let node = nodesList[i];
			let nodeId = node["nodeId"];
			let minDist = node["mindist"];
			if (nodeId === null || nodeId === undefined) {
				throw new Error("lod " + id + " has an invalid noderef");
			}
			if(!this.isRefValid(nodeId)){
				throw new Error("lod " + id + " has a noderef to a non-existing node '" + nodeId + "'");
			}
			if (this.graph[nodeId].type !== "node"){ // check if the node referenced is indeed a node
				throw new Error("lod " + id + " has a noderef to a non-node '" + nodeId + "' with type '" + this.graph[nodeId].type + "'");
			}
			// add a node ref: if the node does not exist
			// create an empty one and reference it.
			let reference = this.data.getNode(nodeId);
			if (reference === null) {
				// does not exist, yet. create it!
				reference = this.data.createEmptyNode(nodeId);
			}
			// reference it.
			this.data.addNodeToLOD(obj, reference, minDist)
		}

		obj.loaded = true;
	}
	
	/**
	 * Load the data for a particular node elemment
	 * @param {*} nodeElement the xml node element
	 */
	loadNode(id, nodeElement) {
    	let nodeType = nodeElement["type"];
	
		// get if node previously added (for instance because it was a child ref in other node)
		let obj = this.data.getNode(id);
		if (obj == null) {
			// otherwise add a new node
			obj = this.data.createEmptyNode(id);		
		}
		
		// load transformations
		let transforms =  nodeElement["transforms"];
		if (transforms !== null && transforms !== undefined) {
			this.loadTransforms(obj, transforms);
		}
	
		// load material refeences
		let materialsRef = nodeElement["materialref"];
		if (materialsRef != null) {
			if (materialsRef["materialId"] === null || materialsRef["materialId"] === undefined) {
				throw new Error("node " + id + " has a materialref but not a materialId");
			}
				
			let materialId = this.getString(materialsRef, "materialId");
			// make the material a map
			let material = this.data.getMaterial(materialId);
			if (material === null || material === undefined) {
				throw new Error("node " + id + " has a materialref to a non-existing material '" + materialId + "'");
			}
			obj.material = material;
		}

		// load cast and receive shadows
		obj.castshadows = this.getBoolean(nodeElement, "castshadows", false);
		obj.receiveshadows = this.getBoolean(nodeElement, "receiveshadows", false);

		// load children (primitives or other node references)
		let children = nodeElement["children"];
		if (children == null) {
			throw new Error("in node " + id + ", a children node is required");
		}
		this.loadNodeChildren(obj, children);
		//console.log(obj);
		obj.loaded = true;
	}
	
	/**
	 * Load the transformations for a particular node element
	 * @param {*} obj the node object
	 * @param {*} transformsElement the transforms xml element
	 * @returns 
	 */
	loadTransforms(obj, transformsElement) {
		for (let i in transformsElement) {
			const transform = transformsElement[i];
			const transformType = transform["type"];
			if (!["translate", "rotate", "scale"].includes(transformType)) {
				return "unrecognized transformation " + transformType + ".";
			}
			if (transformType == "translate") {
				let translate = this.getVector3(transform, "amount");	
				// add a translation
				obj.transformations.push({type: "T", translate: translate});		
			}
			else if (transformType == "rotate") {
				let factor = this.getVector3(transform, "amount");
				// add a rotation
				obj.transformations.push({type: "R", rotation: factor});		
			}
			else if (transformType == "scale") {
				let factor = this.getVector3(transform, "amount");
				// add a scale
				obj.transformations.push({type: "S", scale: factor});
			}
		}
	}
	
	/**
	 * Load the children for a particular node element
	 * @param {*} nodeObj the node object
	 * @param {*} childrenElement the xml children element
	 */
	loadNodeChildren(nodeObj, childrenElement) {

		let addedPrimitive = false;
		let addedLods = false;
		let addedNodes = false;

		for (let child in childrenElement) {
			let childElement = childrenElement[child];

			// if it's the list of node references
			if(child === "nodesList"){
				for(let i in childElement){
					let id = childElement[i];
					if (id === null || id === undefined) {
						throw new Error("node " + nodeObj.id + " has an invalid noderef");
					}else if(!this.isRefValid(id)){
						throw new Error("nodeList within node " + nodeObj.id + " has a noderef to a non-existing node '" + id + "'");
					}else if (this.graph[id].type !== "node"){ // check if the node referenced is indeed a node
						throw new Error("nodeList within node " + nodeObj.id + " has a noderef to a non-node '" + id + "' with type '" + this.graph[nodeId].type + "'");
					}
					// add a node ref: if the node does not exist
					// create an empty one and reference it.
					let reference = this.data.getNode(id);
					if (reference === null) {
						// does not exist, yet. create it!
						reference = this.data.createEmptyNode(id);
					}
					// reference it.
					this.data.addChildToNode(nodeObj, reference)
				}
				addedNodes = true;
				continue;
			}

			if (child === "lodsList"){
				for(let i in childElement){
					let id = childElement[i];
					if (id == null) {
						throw new Error("node " + nodeObj.id + " has an invalid noderef");
					}else if(!this.isRefValid(id)){
						throw new Error("lodsList within node " + nodeObj.id + " has a reference to a non-existing lod '" + id + "'");
					}else if(this.graph[id].type !== "lod"){ // check if the lod referenced is indeed a lod
						throw new Error("lodsList within node " + nodeObj.id + " has a reference to a non-lod '" + id + "' with type '" + this.graph[nodeId].type + "'");
					}
					// add a node ref: if the node does not exist
					// create an empty one and reference it.
					let reference = this.data.getLOD(id);
					if (reference === null) {
						// does not exist, yet. create it!
						reference = this.data.createEmptyLOD(id);
					}
					// reference it.
					this.data.addChildToNode(nodeObj, reference)
				}
				addedLods = true;
				continue;
			}

			const nodeType = childElement["type"]; // get child type (node, primitive, light)

			// check if the identifier is in camel case
			if (child !== child.toLowerCase()){
				console.warn("Primitive with identifier containing upper case letters: "+ child);
			}

			if (this.data.primitiveIds.includes(nodeType)) { // if child is a primitive
				if (addedPrimitive) { // if already added a primitive
					throw new Error("node " + nodeObj.id + " has more than one primitive child.");
				}
				let primitiveObj = this.data.createEmptyPrimitive();
				this.loadPrimitive(childElement, primitiveObj, nodeType);
				this.data.addChildToNode(nodeObj, primitiveObj);
				addedPrimitive = true;
			}
			else if (this.data.lightIds.includes(nodeType)) { // if child is a light
				let lightObj = this.loadLight(child, childElement, nodeType)					
				this.data.addChildToNode(nodeObj, lightObj)
			}
			else {
				throw new Error("unrecognized child type '" + nodeType + "'.");
			}
		}
	}

	isRefValid(nodeId) {
		return this.graph[nodeId] !== null && this.graph[nodeId] !== undefined;
	}


	/**
	 * Loads a light object into a new object
	 * @param {*} elem 
	 * @returns 
	 */
	loadLight(id, elem, lightType) {
		let descriptor = this.data.descriptors[lightType];
		let obj = this.loadJsonItem({
			elem: elem,
			key: id,
			descriptor: descriptor,
			extras: [["type", lightType]]
		});
		return obj;
	}

	/**
	 * For a given primitive element, loads the available representations into the primitive object
	 * @param {XML element} parentElem 
	 * @param {*} primitiveObj the primitive object to load data into
	 */
	loadPrimitive(parentElem, primitiveObj, primType) {
		const descriptor = this.data.descriptors[primType];

		const obj = this.loadJsonItem({
			elem: parentElem,
			descriptor: descriptor,
			extras: [["type", "primitive"], ["subtype", primType],["parentID", parentElem.id]]
		})

		primitiveObj.subtype = primType;
		primitiveObj.representations.push(obj);

		return;
	}

	loadGame(rootElement){
		let gameElem = rootElement["game"];

		if (gameElem === null || gameElem === undefined) {
			throw new Error("game element is null or undefined");
		}

		this.loadTrack(gameElem);
		this.loadRoutes(gameElem);
		this.loadBallons(gameElem);
	}

	loadBallons(gameElem){
		let ballonsElem = gameElem["balloons"];

		if (ballonsElem === null || ballonsElem === undefined) {
			return;
		}

		for (let key in ballonsElem) {
			let elem = ballonsElem[key];
			this.loadBallon(key, elem);
		}
	}

	loadBallon(id, ballonElem){
		let ballon = this.loadJsonItem({
			key: id,
			elem: ballonElem,
			descriptor: this.data.descriptors["ballon"],
			extras: [["type", "ballon"]]
		});
		this.data.addBallonData(id, ballon);
	}

	loadRoutes(gameElem){
		let routesElem = gameElem["routes"];

		if (routesElem === null || routesElem === undefined) {
			return;
		}

		for (let key in routesElem) {
			let elem = routesElem[key];
			this.loadRoute(key, elem);
		}
	}

	loadRoute(id, routeElem){
		let route = [];
		// route is a list of keyframes (position, rotation and time)
		for(let key in routeElem){
			let keyframe = routeElem[key];
			const data = this.loadJsonItem({
				key: key,
				elem: keyframe,
				descriptor: this.data.descriptors["keyframe"],
				extras: [["type", "keyframe"]]
			});
			route.push(data);
		}

		this.data.addRoute(id, route);
	}

	loadTrack(rootElement){
		let trackElem = rootElement["track"];
		
		if (trackElem === null || trackElem === undefined) {
			return;
		}
		this.loadPath(trackElem["path"]);
		this.loadObstacles(trackElem);
		this.loadPowerUps(trackElem);
		this.loadTrackMaterial(trackElem["materialref"]);
	}

	loadCollidables(objects){ // objects or powerups
		let collidables = [];

		for(let ind in objects){
			const object = objects[ind];

			const collidable = {};
			collidable["position"] = this.getVector3(object, "position");
			collidable["scale"] = this.getVector3(object, "scale");
			collidables.push(collidable);
		}

		return collidables;
	}

	loadObstacles(trackElem){
		const obstaclesElem = trackElem["obstacles"];

		if(obstaclesElem == null){
			console.error("No obstacles specified");
			return
		}

		this.data.setObstaclesData(this.loadCollidables(obstaclesElem));
	}

	loadPowerUps(trackElem){
		const powerUpsElem = trackElem["powerups"];

		if(powerUpsElem == null){
			console.error("No power ups specified")
			return
		}

		this.data.setPowerUpsData(this.loadCollidables(powerUpsElem));
	}

	loadPath(pathElem){
		let path = {};

		// get points
		let pointsVectors = [];
		const pointsElems = pathElem["points"];
		// for each points get Vector2
		for(let i in pointsElems){
			const pointElem = pointsElems[i];
			const pointVector = this.getVector2({
				"point": pointElem
			}, "point");
			pointsVectors.push(pointVector);
		}
		
		path["points"] = pointsVectors;
		path["width"] = this.getFloat(pathElem , "width");
		path["segments"] = this.getInteger(pathElem, "segments");

		this.data.setPath(path);
	}
	
	loadTrackMaterial(materialElem){
		if(materialElem === null || materialElem === undefined){
			return; //  no material specified
		}

		let materialId = this.getString(materialElem, "materialId");
		// get the material from the id
		let material = this.data.getMaterial(materialId);
		if (material === null) {
			throw new Error("track has a materialref to a non-existing material '" + materialId + "'");
		}
		this.data.setTrackMaterial(material);
	}
	
}

export { MyFileReader };
