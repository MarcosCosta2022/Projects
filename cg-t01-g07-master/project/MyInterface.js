import { CGFinterface, dat } from "../lib/CGF.js";

/**
 * MyInterface
 * @constructor
 */
export class MyInterface extends CGFinterface {
  constructor() {
    super();
  }

  init(application) {
    // call CGFinterface init
    super.init(application);

    // init GUI. For more information on the methods, check:
    // https://github.com/dataarts/dat.gui/blob/master/API.md
    this.gui = new dat.GUI();

    //Checkbox element in GUI
    this.gui.add(this.scene, "displayAxis").name("Display Axis");
    this.gui.add(this.scene, "displayNormals").name("Display Normals");
    this.gui.add(this.scene, "displayPlane").name("Display Plane");
    this.gui.add(this.scene, "displayGlobe").name("Display Globe");
    this.gui.add(this.scene, "displayHive").name("Display Hive");
    this.gui.add(this.scene, "displayGrass").name("Display Grass");
    this.gui.add(this.scene, "completeScene").name("Display Complete Scene");
    this.gui.add(this.scene, "followBee").name("Follow Bee");

    this.gui.add(this.scene, "displayPanorama").name("Display Panorama");

    var rockFolder = this.gui.addFolder("Rock Options");
    rockFolder.add(this.scene, "displayRock").name("Display Rock");
    rockFolder.add(this.scene, "displayRockSet").name("Display Rock Set");
    rockFolder.add(this.scene, "regenerateRockSet").name("Redo Rock Set");
    rockFolder.add(this.scene, "displayRockLayout").name("Display Layout");

    var gardenFolder = this.gui.addFolder("Garden Options");
    gardenFolder.add(this.scene, "displayGarden").name("Display Garden");
    gardenFolder.add(this.scene, "gardenM", 1, 10).name("Flower Rows");
    gardenFolder.add(this.scene, "gardenN", 1, 10).name("Flower Columns");
    gardenFolder.add(this.scene, "updateGarden").name("Update Garden");

    var beeFolder = this.gui.addFolder("Bee Options");
    beeFolder.add(this.scene, "displayBee").name("Display Bee");
    //Slider element in GUI
    beeFolder.add(this.scene, "scaleFactor", 0.5, 3).name("Scale Factor");
    beeFolder.add(this.scene, "speedFactor", 0.1, 3).name("Speed Factor");

    this.initKeys();

    return true;
  }

  initKeys() {
    // create reference from the scene to the GUI
    this.scene.gui = this;

    // disable the processKeyboard function
    this.processKeyboard = function () {};
    // create a named array to store which keys are being pressed

    this.activeKeys = {};
  }

  processKeyDown(event) {
    // called when a key is pressed down
    // mark it as active in the array
    this.activeKeys[event.code] = true;
  }

  processKeyUp(event) {
    // called when a key is released, mark it as inactive in the array
    this.activeKeys[event.code] = false;
  }

  isKeyPressed(keyCode) {
    // returns true if a key is marked as pressed, false otherwise
    return this.activeKeys[keyCode] || false;
  }
}
