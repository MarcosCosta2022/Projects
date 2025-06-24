import * as THREE from 'three';

/**
 * Class managing player
 */
class MyPlayer { // still not being used
    constructor(match, playerBallon, initialVouchers = 0, penaltyTime = 3){
        this.match = match;
        this.balloon = playerBallon;

        this.velocity = new THREE.Vector3(0,0,0);
        this.verticalAccelaration = 40;
        this.vouchers = initialVouchers;
        this.penaltyTime = penaltyTime;
        this.laps = 0;

        this.dragCoefficient = 0.1;  // Adjust this value to control attrition strength
        this.maxSpeed = 10000;          // Maximum speed cap
        this.minSpeed = 0.01;        // Speed threshold for stopping completely

        // Height limit parameters
        this.maxHeight = 100;                    // Maximum allowed height
        this.heightLimitStartRange = 20;         // Distance below maxHeight where resistance begins
        this.heightLimitResistance = 5.0;        // Strength of the height limit resistance

        // Penalty state
        this.isPenalized = false;
        this.penaltyTimeRemaining = 0;
        this.penaltyDestination = null;

        // create position and bind it to ballon for easier access
        this.position = this.balloon.position
    }

    incrementLaps(){
        this.laps += 1;

        if(this.laps >= this.match.objectiveLaps){
            this.match.gameOver("Player");
        }
    }

    addVoucher(){
        this.vouchers ++;
        this.match.game.outdoorDisplay.update({
            vouchers: this.vouchers
        });
    }

    applyPenalty(position){
        if(this.vouchers> 0){ // exchange a voucher for the penalty
            this.vouchers -=1;
            this.match.game.outdoorDisplay.update({
                vouchers: this.vouchers
            });
            this.velocity.set(0, 0, 0); // stop the ballon and move it immediatly to position
            this.balloon.position.copy(position);
        }else{
            // Initialize penalty state
            this.isPenalized = true;
            this.penaltyTimeRemaining = this.penaltyTime;
            this.penaltyDestination = position.clone();
            // Stop all movement immediately
            this.velocity.set(0, 0, 0);
        }
    }

    getCenterPosition(){
        const center = new THREE.Vector3();
        this.balloon.center.getWorldPosition(center);
        return center;
    }

    getCollisionRadius(){
        return this.balloon.collisionRadius;
    }

    /**
     * stops the ballon and moves it to a given position
     * @param {THREE.Vector3} position destination of the ballon
     */
    reset(position){ 
        this.velocity = new THREE.Vector3(0,0,0);
        this.balloon.position.copy(position);
    }

    // Apply resistance force when approaching height limit

    applyHeightLimit(delta) {
        const currentHeight = this.balloon.position.y;
        const distanceToLimit = this.maxHeight - currentHeight;
        
        // Only apply resistance if we're within the start range and moving upward
        if (distanceToLimit < this.heightLimitStartRange && this.velocity.y > 0) {
            // Calculate resistance factor (0 to 1) based on how close we are to the limit
            const resistanceFactor = 1 - (distanceToLimit / this.heightLimitStartRange);
            
            // Apply exponential resistance force
            const resistanceForce = -this.velocity.y * resistanceFactor * resistanceFactor * this.heightLimitResistance * delta;
            this.velocity.y += resistanceForce;

            // Ensure we never exceed max height
            if (currentHeight > this.maxHeight) {
                this.balloon.position.y = this.maxHeight;
                if (this.velocity.y > 0) {
                    this.velocity.y = 0;
                }
            }
        }
    }

    updateVerticalVelocity(delta){
        // Don't update velocity if penalized
        if (this.isPenalized) return;

        if(this.match.isKeyDown('ArrowUp') || this.match.isKeyDown('w')){
            this.velocity.y += this.verticalAccelaration * delta;
        }
        if(this.match.isKeyDown('ArrowDown') || this.match.isKeyDown('s')){
            this.velocity.y -= this.verticalAccelaration * delta;
        }

        this.velocity.y = THREE.MathUtils.clamp(this.velocity.y, -this.maxSpeed, this.maxSpeed);
    }

    updateHorizontalVelocity(delta){
        const windInfluence = this.match.wind.getWindVector(this.balloon.position);
        windInfluence.multiplyScalar(delta);
        this.velocity.add(windInfluence);

    }

    applyDrag(delta) {
        // Calculate drag force
        const dragForce = this.velocity.clone();
        const speed = dragForce.length();
        
        if (speed > this.minSpeed) {
            // Drag force is proportional to velocity squared
            dragForce.normalize();
            dragForce.multiplyScalar(-this.dragCoefficient * speed * speed * delta);
            this.velocity.add(dragForce);
        } else {
            // Stop completely if moving very slowly
            this.velocity.set(0, 0, 0);
        }
    }

    getHorizontalSpeed(){
        const vector = new THREE.Vector2(this.velocity.x, this.velocity.z);
        return vector.length();
    }

    update(delta){
        // Handle penalty state
        if (this.isPenalized) {
            this.penaltyTimeRemaining -= delta;
            
            if (this.penaltyTimeRemaining <= 0) {
                // Penalty time is over, move to destination and reset penalty state
                this.balloon.position.copy(this.penaltyDestination);
                this.isPenalized = false;
                this.penaltyDestination = null;
                return;
            }
            // While penalized, don't process any other updates
            return;
        }

        // monitor key presses to update vertical speed
        this.updateVerticalVelocity(delta);

        // check wind to update horizontal speed
        this.updateHorizontalVelocity(delta);

        // Apply drag force
        this.applyDrag(delta);

        // aplpy height limit
        this.applyHeightLimit(delta);

        // update player position based on velocity vector
        const playerPosition = this.balloon.position;
        playerPosition.add(this.velocity.clone().multiplyScalar(delta));
        if(playerPosition.y <= 0){
            playerPosition.y = 0;
            this.velocity = new THREE.Vector3(0,0,0); // the ballon stoops
        }

        // update collision bounding volume
        this.balloon.updateVolumes();
    }

}

export {MyPlayer};
