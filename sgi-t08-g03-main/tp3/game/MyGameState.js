import * as THREE from 'three';

/**
 *  This class represents the state where we show the winner of the game
 */
class MyGameState {

    constructor(app,game) {
        this.app = app;
        this.game = game;
        this.scene = null;
        this.hud = null;
    }

    onKeyDown(key){
        
    }

    onMouseClick(event){
        // do nothing by default
    }

    start(){
        // do nothing by default
    }

    getHUD(){
        return this.hud;
    }

    updateCamerasInApp(){
        this.app.resetCameras(); // replaces camera with default in case the state does overwrite this function
    }

    getScene(){ 
        if(this.scene == null){
            throw Error("Scene must be defined in game state");
        }
        return this.scene; // return the scene, must be defined
    }

    update(delta){ // overwrite to add logic
    }
    
}

export { MyGameState };