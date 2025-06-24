import * as THREE from 'three';

class MyBassReliefDisplay extends THREE.Object3D {
    constructor(app, game, size, captureInterval = 1000) {
        super();
        this.app = app;
        this.game = game;
        this.size = size;
        this.captureInterval = captureInterval;
        this.lastCaptureTime = 0;
        
        this.renderer = this.app.renderer;
        

        // Create a depth texture and render target
        const depthTexture = new THREE.DepthTexture();
        depthTexture.type = THREE.UnsignedShortType; // Use UnsignedShortType or FloatType depending on precision
        depthTexture.format = THREE.DepthFormat;
        this.depthTexture = depthTexture;

        this.colorTexture = new THREE.DepthTexture();

        this.renderTarget = new THREE.WebGLRenderTarget(2048, 2048, {
            texture : this.colorTexture,
            depthTexture: depthTexture
        });

        // Create the display contents first
        this.createDisplayStructure();
        
        // Then setup the camera
        this.setupCamera();
        
        // Finally add debug helpers
        //this.addDebugHelpers();

        // Do the first capture
        this.captureScene();
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(120, 1, 0.1, 3000);
        this.camera.rotateY(Math.PI)
        this.camera.rotateX(-Math.PI/6)
        this.displayScreenGroup.add(this.camera);
    }

    createDisplayStructure() {
        // Create a group for the display elements
        this.displayGroup = new THREE.Group();
        this.add(this.displayGroup);

        // Create material for depth visualization
        this.depthDisplayMaterial = new THREE.ShaderMaterial({
            uniforms: {
                colorMap: { value: null },
                depthMap: { value: null },
                near: { value: 5 },
                far: { value: 2000 },
                attenuation: { value: 0.04 }
            },
            vertexShader: `
                uniform sampler2D depthMap; // Depth texture
                uniform float near;         // Near plane of the camera
                uniform float far;          // Far plane of the camera
                uniform float attenuation;  // Controls the displacement intensity

                varying vec2 vUv;

                float linearizeDepth(float depth) {
                    float z = depth * 2.0 - 1.0; // Convert to NDC space
                    return (2.0 * near * far) / (far + near - z * (far - near));
                }

                void main() {
                    vUv = uv;

                    // Sample depth from the texture
                    float depth = texture2D(depthMap, uv).r;

                    // Linearize the depth value
                    float linearDepth = linearizeDepth(depth);

                    // Invert the depth so far objects appear closer
                    float invertedDepth = far - linearDepth;

                    // Displace the vertex along its normal
                    vec3 displacedPosition = position + normal * invertedDepth * attenuation;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;

                uniform sampler2D colorMap; // RGB image

                void main() {
                    vec4 color = texture2D(colorMap, vUv);
                    gl_FragColor = color;
                }
            `,
            transparent: true
        });

        const displayscreenGroup = new THREE.Group();
        this.displayGroup.add(displayscreenGroup);

        // Frame
        const frameGeometry = new THREE.BoxGeometry(this.size * 1.1, this.size * 0.7, this.size * 0.05);
        const frameMaterial = new THREE.MeshPhongMaterial({ color: 0x95a5a6 });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.z = -0.05 * this.size/2;
        displayscreenGroup.add(frame);

        // Display surface
        const displayGeometry = new THREE.PlaneGeometry(
            this.size, 
            this.size * 0.6,
            200,
            200
        );
        const displayMesh = new THREE.Mesh(displayGeometry, this.depthDisplayMaterial);
        displayMesh.position.z = 0.05;
        displayscreenGroup.add(displayMesh);

        displayscreenGroup.position.z = 14;
        this.displayScreenGroup = displayscreenGroup;

        // Edge frame (to cover protruding parts)
        const frameDepth = this.size * 0.1; // Depth of the frame to cover protrusions
        const edgeFrameThickness = this.size * 0.075; // Thickness of the frame edges

        // Create frame edges
        const edgeFrameMaterial = new THREE.MeshPhongMaterial({ color: 0x7f8c8d }); // Slightly darker than the base frame

        // Top edge
        const topEdgeGeometry = new THREE.BoxGeometry(this.size * 1.1, edgeFrameThickness, frameDepth);
        const topEdge = new THREE.Mesh(topEdgeGeometry, edgeFrameMaterial);
        topEdge.position.y = this.size * 0.31;
        topEdge.position.z = frameDepth/2;
        displayscreenGroup.add(topEdge);

        // Bottom edge
        const bottomEdge = new THREE.Mesh(topEdgeGeometry, edgeFrameMaterial);
        bottomEdge.position.y = -this.size * 0.31;
        bottomEdge.position.z = frameDepth/2;
        displayscreenGroup.add(bottomEdge);

        // Left edge
        const sideEdgeGeometry = new THREE.BoxGeometry(edgeFrameThickness, this.size * 0.7, frameDepth);
        const leftEdge = new THREE.Mesh(sideEdgeGeometry, edgeFrameMaterial);
        leftEdge.position.x = -this.size * 0.51;
        leftEdge.position.z = frameDepth/2;
        displayscreenGroup.add(leftEdge);

        // Right edge
        const rightEdge = new THREE.Mesh(sideEdgeGeometry, edgeFrameMaterial);
        rightEdge.position.x = this.size * 0.51;
        rightEdge.position.z = frameDepth/2;
        displayscreenGroup.add(rightEdge);

        // Post
        const postGeometry = new THREE.CylinderGeometry(10, 10, 400, 32);
        const postMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.y = -200;
        this.displayGroup.add(post);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.displayGroup.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 5, 5);
        this.displayGroup.add(dirLight);
    }

    addDebugHelpers() {
        // Camera helper
        this.cameraHelper = new THREE.CameraHelper(this.camera);
        this.add(this.cameraHelper);
    }

    captureScene() {
        if (!this.renderer){
            console.error("No renderer")
            return;
        }

        const currentRenderTarget = this.renderer.getRenderTarget();

        // Hide the display group during capture
        this.displayGroup.visible = false;

        // Render the scene to the render target
        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.render(this.game.scene, this.camera);

        // Update uniforms with the captured textures
        this.depthDisplayMaterial.uniforms.depthMap.value = this.renderTarget.depthTexture;
        this.depthDisplayMaterial.uniforms.colorMap.value = this.renderTarget.texture;


        // Show the display group again
        this.displayGroup.visible = true;

        this.renderer.setRenderTarget(currentRenderTarget);
    }

    update(deltaTime) {
        const currentTime = performance.now();
        if (currentTime - this.lastCaptureTime >= this.captureInterval) {
            this.captureScene();
            console.log("updated bass-relief screen")
            this.lastCaptureTime = currentTime;
        }
    }

    dispose() {
        if (this.renderTarget) this.renderTarget.dispose();
        
        if (this.cameraHelper) {
            this.app.scene.remove(this.cameraHelper);
            this.cameraHelper.dispose();
        }
    }
}

export { MyBassReliefDisplay };
