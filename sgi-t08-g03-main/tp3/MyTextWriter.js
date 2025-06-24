import * as THREE from 'three';

class MyTextWriter {
    constructor(app, fontPath) {
        this.app = app;
        this.fontPath = fontPath;
        this.collumns = 16;
        this.rows = 16;
        this.font = null;
        this.defaultMaterial = null;
        this.pendingMeshes = new Set();
        this.loadFont();
    }

    loadFont() {
        const loader = new THREE.TextureLoader();
        loader.load(this.fontPath, font => {
            this.font = font;
            this.defaultMaterial = new THREE.MeshBasicMaterial({ map: this.font, transparent: true });
            
            // Update all pending meshes with the loaded texture
            this.pendingMeshes.forEach(mesh => {
                this.updateMeshMaterial(mesh);
            });
            this.pendingMeshes.clear();
        });
    }

    updateMeshMaterial(textGroup) {
        textGroup.traverse(child => {
            if (child instanceof THREE.Mesh) {
                // Create a new material instance for each mesh to avoid sharing
                child.material = new THREE.MeshBasicMaterial({ 
                    map: this.font, 
                    transparent: true 
                });
            }
        });
    }

    getASCIICharCoords(char) {
        const code = char.charCodeAt(0);
        if (code < ' '.charCodeAt(0) || code > '~'.charCodeAt(0)) return [0, 0];
        const offset = code - ' '.charCodeAt(0) + 2 * this.collumns;
        return [offset % this.collumns, Math.floor(offset / this.collumns)];
    }

    getCharacterUV(char) {
        const [col, row] = this.getASCIICharCoords(char);
        const uMin = col / this.collumns;
        const uMax = (col + 1) / this.collumns;
        // Flip the v coordinates by swapping vMin and vMax
        const vMax = 1 - (row / this.rows);
        const vMin = 1 - ((row + 1) / this.rows);
        return new THREE.Vector4(uMin, vMin, uMax, vMax);
    }

    createTextMesh(text, size = 1, material = null) {
        const textGroup = new THREE.Group();
        let xPos = 0;

        // Create a temporary material if the texture isn't loaded yet
        const tempMaterial = new THREE.MeshBasicMaterial({ 
            transparent: true,
            color: 0xffffff, // Temporary white color
            opacity: 1,
            blending: THREE.NormalBlending // Ensure normal blending
        });

        // Use either the provided material, default material (if texture is loaded), or temporary material
        const finalMaterial = material || (this.font ? this.defaultMaterial : tempMaterial);

        // Ensure the material supports transparency and uses blending
        finalMaterial.transparent = true;
        finalMaterial.blending = THREE.NormalBlending;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const uv = this.getCharacterUV(char);
            if (!uv) continue;

            const geometry = new THREE.PlaneGeometry(size, size);
            
            // Update UVs for the geometry
            const uvAttribute = new Float32Array([
                uv.x, uv.w,  // bottom-left
                uv.z, uv.w,  // bottom-right
                uv.x, uv.y,  // top-left
                uv.z, uv.y   // top-right
            ]);
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvAttribute, 2));

            const sprite = new THREE.Mesh(geometry, finalMaterial.clone());
            sprite.position.set(xPos + size/2, 0, 0);
            textGroup.add(sprite);
            xPos += size;
        }

        // If the texture hasn't loaded yet, add this mesh to the pending list
        if (!this.font) {
            this.pendingMeshes.add(textGroup);
        }

        return {textMesh: textGroup, dimensions: new THREE.Vector2(xPos, size)};
    }
}

export { MyTextWriter };