import * as THREE from 'three';

class MyOutdoorDisplay extends THREE.Object3D {
    constructor(app,game , size){
        super();
        this.app = app;
        this.game = game;
        this.size = size;

        this.playerLaps = 0;
        this.enemyLaps = 0;
        this.elapsedTime = 0;
        this.windDirection = "";
        this.vouchers = 0;
        this.gameRunning = true;

        this.isUpdating = false; // Lock for async update
        this.pendingUpdate = false; // Flag to signal if another update is needed

        this.init();
    }

    createDisplay(displayMaterial){
        const group = new THREE.Group();

        // Create the frame
        const frameGeometry = new THREE.BoxGeometry(this.size * 1.1, this.size * 0.7, this.size * 0.05);
        const frameMaterial = new THREE.MeshPhongMaterial({ color: 0x95a5a6 });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.z = -0.05 * this.size/2 - 1;
        group.add(frame);

        // Create the display surface as a plane
        const displayGeometry = new THREE.PlaneGeometry(this.size, this.size * 0.6, 200, 200);

        const displayMesh = new THREE.Mesh(displayGeometry, displayMaterial);
        this.displayMeshes.push(displayMesh);
        group.add(displayMesh);

        return group;
    }

    init() {

        this.displayMeshes = [];

        // Create canvas for dynamic text rendering
        this.textCanvas = this.createTextCanvas();
        
        // Create height map from text canvas
        this.heightMap = this.createHeightMap(this.textCanvas);
        
        this.displayMaterial = new THREE.ShaderMaterial({
            uniforms: {
                baseColor: { value: new THREE.Color(0xccffe5) },
                textColor: { value: new THREE.Color(0x99ff99) },
                heightMap: { value: this.heightMap },
                textTexture: { value: new THREE.CanvasTexture(this.textCanvas) },
                reliefDepth: { value: 2 },
                time: { value: 0.0 }
            },
            vertexShader: `
                uniform sampler2D heightMap;
                uniform float reliefDepth;
                uniform float time;
                
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    
                    // Sample height map for displacement
                    vec4 heightValue = texture2D(heightMap, vUv);
                    float displacement = heightValue.r * reliefDepth;
                    
                    // Calculate displaced position
                    vec3 newPosition = position + normal * displacement;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 baseColor;
                uniform vec3 textColor;
                uniform sampler2D textTexture;
                uniform sampler2D heightMap;
                
                varying vec2 vUv;
                
                void main() {
                    // Sample height map for lighting calculation
                    vec4 heightValue = texture2D(heightMap, vUv);
                    
                    // Basic lighting calculation
                    float light = 0.5 + heightValue.r * 0.5;
                    
                    // Sample text texture
                    vec4 textSample = texture2D(textTexture, vUv);
                    
                    // Mix base color and text color based on text texture
                    vec3 finalColor = mix(baseColor, textColor, textSample.r) * light;
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        });

        // create a post
        const postmaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
        const postgeometry = new THREE.CylinderGeometry(10,10, 400, 32,32,false);
        const postMesh = new THREE.Mesh(postgeometry, postmaterial);
        this.add(postMesh);

        const display1 = this.createDisplay(this.displayMaterial);
        display1.position.set(0,200,15);
        this.add(display1);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 5, 5);
        this.add(dirLight);
    }

    createTextCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
    
        // Set background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        // Configure text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial'; // Adjust font size for display
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
    
        // Add slight text shadow for better depth effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
    
        // Define text content
        const gameProgress = "Game Progress";
        const timeText = `TIME: ${this.formatTime(this.elapsedTime)}`;
        const gameOnText = `${this.playerLaps} vs ${this.enemyLaps}`;
        const gameState = this.gameRunning ? '⏸ RUNNING' : '⏵ PAUSED';
        const objectiveText = `OBJECTIVE: 1 lap`;
        const windDirection = this.windDirection || ""; // Handle empty string
        const windStrings = {
            N: "⮙ North",
            S: "⮛ South",
            E: "⮚ East",
            W: "⮘ West",
            "": "" // Empty string maps to no arrow
        };
        const windArrow = windStrings[windDirection];
        const vouchersWindText = `VOUCHERS: ${this.vouchers}          WIND: ${windArrow}`;
    
        // Draw text
        const lineHeight = 80;
        let currentY = 100;
    
        ctx.fillText(gameProgress, canvas.width / 2, currentY);
        currentY += lineHeight;
    
        ctx.fillText('-----------------------------------------', canvas.width / 2, currentY);
        currentY += lineHeight;
    
        ctx.fillText(timeText, canvas.width / 2, currentY);
        currentY += lineHeight;
    
        ctx.fillText('-----------------------------------------', canvas.width / 2, currentY);
        currentY += lineHeight;
    
        ctx.fillText(gameOnText, canvas.width / 2, currentY);
        currentY += lineHeight;
    
        ctx.fillText('-----------------------------------------', canvas.width / 2, currentY);
        currentY += lineHeight;
    
        ctx.fillText(objectiveText, canvas.width / 2, currentY);
        currentY += lineHeight;
    
        ctx.fillText('-----------------------------------------', canvas.width / 2, currentY);
        currentY += lineHeight;
    
        ctx.fillText(vouchersWindText, canvas.width / 2, currentY);
    
        // Remove shadow settings after drawing
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    
        return canvas;
    }

    createHeightMap(textCanvas) {
        // Create a texture from the canvas
        const texture = new THREE.CanvasTexture(textCanvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        return texture;
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    async updateScreenAsync() {
        if (this.isUpdating) {
            this.pendingUpdate = true; // Signal that another update is needed
            return;
        }

        this.isUpdating = true;

        try {
            // Simulate asynchronous rendering delay (optional)
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Update text canvas
            this.textCanvas = this.createTextCanvas();

            // Update textures
            this.displayMaterial.uniforms.textTexture.value = new THREE.CanvasTexture(this.textCanvas);
            this.displayMaterial.uniforms.heightMap.value = this.createHeightMap(this.textCanvas);
            this.displayMaterial.uniforms.time.value = this.elapsedTime;

        } finally {
            this.isUpdating = false;

            // Handle pending update if it exists
            if (this.pendingUpdate) {
                this.pendingUpdate = false;
                this.updateScreenAsync();
            }
        }
    }


    // Update the display with new data
    update({ playerLaps, enemyLaps, elapsedTime, windDirection, vouchers, gameRunning}){

        const shouldUpdate =
            (elapsedTime !== undefined && this.formatTime(this.elapsedTime) !== this.formatTime(elapsedTime)) ||
            (gameRunning !== undefined && this.gameRunning !== gameRunning) ||
            (windDirection !== undefined && this.windDirection !== windDirection) ||
            (vouchers !== undefined && this.vouchers !== vouchers) ||
            (playerLaps !== undefined && this.playerLaps !== playerLaps) ||
            (enemyLaps !== undefined && this.enemyLaps !== enemyLaps);

        if (!shouldUpdate) {
            return; // No changes, skip updating
        }

        // Only update properties if they are defined
        if (elapsedTime !== undefined) {
            this.elapsedTime = elapsedTime;
        }
        if (gameRunning !== undefined) {
            this.gameRunning = gameRunning;
        }
        if (windDirection !== undefined) {
            this.windDirection = windDirection;
        }
        if (vouchers !== undefined) {
            this.vouchers = vouchers;
        }
        if(enemyLaps !== undefined){
            this.enemyLaps = enemyLaps;
        }
        if(playerLaps !== undefined){
            this.playerLaps = playerLaps;
        }

        this.updateScreenAsync();
    }
}

export { MyOutdoorDisplay };