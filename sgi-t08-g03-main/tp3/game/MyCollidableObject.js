import * as THREE from 'three';

/**
 * Class representing a collidable object with visible bounding box
 */
class MyCollidableObject extends THREE.Object3D {
    constructor() {
        super();
        this.mesh = null;
        this.boundingBox = new THREE.Box3();
        this.boundingVolumes = []; 

        this.colliding = true;
    }

    move(position){
        this.position.copy(position);
        this.updateVolumes();
    }

    clone() {
        // Get the basic Object3D clone
        const clone = super.clone();
        
        // Create new bounding box
        clone.boundingBox = new THREE.Box3();
        
        // Reset bounding volumes array
        clone.boundingVolumes = [];
        
        return clone;
    }

    init(mesh){
        this.mesh = mesh || this;
        this.updateBoundingBox();
        this.boundingVolumes = [];
        this.createSmallerBoundingBoxes();
    }

    createSmallerBoundingBoxes(){
        // for every mesh in "this" create a bounding box
        this.mesh.traverse((child)=>{
            if(child.isMesh){
                // create a bounding box
                const childBoundingBox = new THREE.Box3().setFromObject(child);
                this.boundingVolumes.push({
                    mesh: child,
                    boundingBox: childBoundingBox
                });
            }
        })
    }

    createCollisionHelpers(){
        // update bounding boxes
        this.updateVolumes();

        const helpers = new THREE.Group();

        // create a helper for the bigger box
        const biggerHelper = new THREE.Box3Helper(this.boundingBox, 0x00ff00);
        helpers.add(biggerHelper);

        // create a helper for the smaller boxes
        this.boundingVolumes.forEach(({mesh, boundingBox}) =>{
            if (boundingBox == null){
                console.log("smaller helper is null")
            }else{
                const smallerHelper = new THREE.Box3Helper(boundingBox, 0xff0000);
                helpers.add(smallerHelper);
            }
        })

        return helpers;
    }

    /**
     * Updates the bounding box of the entire mesh/group
     */
    updateBoundingBox() {
        this.boundingBox.setFromObject(this.mesh);
    }

    /**
     * Updates the bounding volumes for each child mesh
     */
    updateBoundingVolumes(){
        this.boundingVolumes.forEach(({mesh, boundingBox}) =>{
            boundingBox.setFromObject(mesh);
        });
    }

    updateVolumes(){
        this.mesh.updateWorldMatrix(true,true);
        this.updateBoundingBox();
        this.updateBoundingVolumes();
    }

    checkForCollisinWithPlayer(other){
        let res = this.checkCollision(other);
        
        let ans = false;
        if (this.colliding == false && res == true){
            ans = true;
        }

        this.colliding = res;

        return ans;
    }

    /**
     * Checks for collision with another MyCollidableObject
     */
    checkCollision(other) {
        if (!this.boundingBox.intersectsBox(other.boundingBox)) {
            return false;
        }

        for (const volumeA of this.boundingVolumes) {
            for (const volumeB of other.boundingVolumes) {
                if (volumeA.boundingBox.intersectsBox(volumeB.boundingBox)) {

                    // inlcde
                    return true;
                }
            }
        }
        return false;
    }
}

export { MyCollidableObject };