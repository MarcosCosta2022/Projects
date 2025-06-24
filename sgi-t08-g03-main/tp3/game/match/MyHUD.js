import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

/**
 *  This class contains the contents of out application
 */
class MyHUD {
    constructor(app, match){
        this.app = app;
        this.match = match;

        this.scene = null;
        this.init();

        this.countdown = 3;
        this.countdownText = null;

        this.visible = true;
    }

    init(){
        this.scene = new THREE.Scene();

        // add ambient light
        const ambientLight = new THREE.AmbientLight("#888888", 1);
        this.scene.add(ambientLight)

        // add the countDown 
        this.countDownMaterial = new THREE.MeshPhongMaterial({color:"red"});
        this.updateCountDownText();


        const compass = this.createCompass();
        this.scene.add(compass);

        function onResize(){ // reposition HUD elements so they stay in their relative positions
            compass.position.set(window.innerWidth/2-140, -window.innerHeight/2+140);
        }

        onResize();

        // manage window resizes
        window.addEventListener('resize', onResize , false );
    }


    //Creates the compass with the player pointer and the wind direction pointer
    createCompass(){
        const compass = new THREE.Group();
        
        // make a circle
        const circleGeo = new THREE.CircleGeometry(80, 30);
        const circleMaterial = new THREE.MeshPhongMaterial({
            map: this.app.contents.compassTexture,
            color: "#ffff33"
        })
        const circleMesh = new THREE.Mesh(circleGeo, circleMaterial);
        compass.add(circleMesh);

        const torusGeo = new THREE.TorusGeometry( 88, 10, 10,80 );
        const torusMaterial = new THREE.MeshPhongMaterial({
            map: this.app.contents.metalTexture
        });
        const torusMesh = new THREE.Mesh(torusGeo, this.app.contents.goldMaterial);
        compass.add(torusMesh);

        // add a point light
        const light = new THREE.PointLight(0xffffff, 10, 1000, 0.2);
        light.position.set(0, 0, 300);
        compass.add(light);

        // add an arrow for players velocity vector
        let pointer = this.compassPointer(new THREE.MeshPhongMaterial({
            color: "#00CC33",
            specular: "#0f0f0f",
            bumpMap: this.app.contents.concreteTexture,
            bumpScale: 0.1
            
        }));
        this.playerPointer = pointer;
        pointer.position.z = 0.02
        compass.add(pointer);

        pointer = this.compassPointer(new THREE.MeshPhongMaterial({
            color: "#99ffff",
            specular: "#0f0f0f",
            bumpMap: this.app.contents.concreteTexture,
            bumpScale: 0.1
            
        }));
        this.windDirectionPointer = pointer;
        pointer.position.z = 0.01
        pointer.visible = false;
        compass.add(pointer);

        // add a center sphere
        const centerSphere = new THREE.SphereGeometry(5,20,20);
        const centerMesh = new THREE.Mesh(centerSphere, torusMaterial);
        compass.add(centerMesh)

        return compass;
    }

    //Creates a pointer for the compass
    compassPointer(material) {
        const group = new THREE.Group();
        const pointerStemWidth = 20;
    
        // Make a triangle for the start of the stem
        let vertices = new Float32Array([
            pointerStemWidth / 2, 0, 0,  // Vertex 1 (top)
            -pointerStemWidth / 2, 0, 0, // Vertex 2 (bottom left)
            0, -20, 0  // Vertex 3 (bottom right)
        ]);
    
        // Add UV mapping for the texture
        let uvs = new Float32Array([
            1, 1,  // UV for Vertex 1
            0, 1,  // UV for Vertex 2
            0.5, 0 // UV for Vertex 3
        ]);
    
        // Create a BufferGeometry and add the vertices and UVs
        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2)); // Add UV attribute
        geometry.computeVertexNormals(); // Automatically calculate normals
    
        // Create the mesh
        let triangle = new THREE.Mesh(geometry, material);
        group.add(triangle);
    
        // Create a second triangle
        vertices = new Float32Array([
            -pointerStemWidth / 2, 0, 0,  // Vertex 1 (top)
            pointerStemWidth / 2, 0, 0, // Vertex 2 (bottom left)
            0, 70, 0  // Vertex 3 (bottom right)
        ]);
    
        // Add UV mapping for the second triangle
        uvs = new Float32Array([
            0, 0,  // UV for Vertex 1
            1, 0,  // UV for Vertex 2
            0.5, 1 // UV for Vertex 3
        ]);
    
        // Create a BufferGeometry and add the vertices and UVs
        geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        geometry.computeVertexNormals();
    
        // Create the mesh
        triangle = new THREE.Mesh(geometry, material);
        group.add(triangle);
    
        return group;
    }
    

    getScene(){
        if(this.visible){
            return this.scene;
        }
        return null;
    }

    toggleHUD(){
        this.visible = !this.visible;
    }

    //Updates the countdown text
    updateCountDownText(){
        if (this.match.game.font) { // if we have a font ready in the game
            // Get the text
            const countDownText = (Math.ceil(this.countdown)).toString();
            // Create a geometry from it
            const geometry = new TextGeometry(countDownText, {
                size: 60,
                font: this.match.game.font
            });
    
            // Center the geometry
            geometry.computeBoundingBox();
            const boundingBox = geometry.boundingBox;
            const textCenter = new THREE.Vector3();
            boundingBox.getCenter(textCenter);
            geometry.translate(-textCenter.x, -textCenter.y, -textCenter.z);
    
            // Transform it into a mesh
            const textMesh = new THREE.Mesh(geometry, this.countDownMaterial);
    
            // Replace the mesh in the HUD
            if (this.countDownText) {
                this.scene.remove(this.countDownText);
            }
            this.countDownText = textMesh;
            this.scene.add(textMesh);
        }

        if (!this.match.onCountDown && this.countDownText){ // remove text if match is already going and there is still a text in the scene
            this.scene.remove(this.countDownText);
            this.countDownText = null;
        }
    }

    //Updates the compass pointers
    updateCompass() {
        const velocity = this.match.player.velocity.clone();
        velocity.y = 0; // we only care about the horizontal speed
    
        if (velocity && velocity.length() > 0) { 
            // Get the angle between the velocity vector and the positive x-axis
            const targetRotation = velocity.angleTo(new THREE.Vector3(0, 0, -1));
    
            // Determine the sign of the rotation (to handle clockwise vs counter-clockwise)
            const cross = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 0, -1), velocity);
            const signedRotation = cross.y > 0 ? targetRotation : -targetRotation;
    
            // Smoothly interpolate to the target rotation
            const currentRotation = this.playerPointer.rotation.z;
            const smoothRotation = THREE.MathUtils.lerp(currentRotation, signedRotation, 0.1);
    
            // Apply the interpolated rotation
            this.playerPointer.rotation.z = smoothRotation;
        }

        // update wind direction pointer
        const windDirection = this.match.wind.getWindVector(this.match.player.position).normalize();
        if (windDirection.length() > 0) {
            this.windDirectionPointer.visible = true;
            const targetRotation = windDirection.angleTo(new THREE.Vector3(0, 0, -1));
            // Determine the sign of the rotation (to handle clockwise vs counter-clockwise)
            const cross = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 0, -1), windDirection);
            const signedRotation = cross.y > 0 ? targetRotation : -targetRotation;

            this.windDirectionPointer.rotation.z = signedRotation;
        } else {
            this.windDirectionPointer.visible = false;
        }


    }

    update(delta){
        if(this.countdown > 0){
            // update countDown
            this.countdown -= delta;
            if (this.countdown <= 0){
                // start match
                this.match.countDownFinished();
            }
            this.updateCountDownText();
        }

        this.updateCompass()
    }

}

export { MyHUD };