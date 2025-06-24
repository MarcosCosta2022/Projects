import {CGFobject, CGFtexture} from '../../lib/CGF.js';
import {MyFlower} from "./MyFlower.js";

/**
* MyGarden class, representing a garden with flowers.
* @constructor
 * @param scene - reference to MyScene object
 * @param m - number of flowers in the x direction
 * @param n - number of flowers in the z direction
*/

export class MyGarden extends CGFobject {
    constructor(scene, m, n) {
        super(scene);

        this.m = m;
        this.n = n;

        this.flowers = []; // Initialize an empty array
        this.positions = [];

        let petalsTexture1 = new CGFtexture(this.scene, "textures/petal.jpg");
        let petalsTexture2 = new CGFtexture(this.scene, "textures/petal2.jpg");
        let petalsTexture3 = new CGFtexture(this.scene, "textures/petal3.jpg");
        let petalsTexCoords1 = [
            0.33, 0.939, 
            0.156, 0.228, 
            0.615, 0.084, 
            0.814, 0.492,
        ];
        let petalsTexCoords2 = [
            0.491, 0.908, 
            0.168, 0.365, 
            0.491, 0.077, 
            0.814, 0.365,
        ];
        let petalsTexCoords3 = [
            0.511, 0.729, 
            0.275, 0.372, 
            0.511, 0.148, 
            0.747, 0.372,
        ];
        let petalsTexArray = [petalsTexture1, petalsTexture2, petalsTexture3];
        let petalsTexCoordsArray = [petalsTexCoords1, petalsTexCoords2, petalsTexCoords3];

        let receptacleTexture1 = new CGFtexture(this.scene,  "textures/receptacle.jpg");
        let receptacleTex1Center = [0.456, 0.432];
        let receptacleTex1Radius = 0.587 - 0.328;
        let receptacleTexture2 = new CGFtexture(this.scene, "textures/receptacle2.jpg");
        let receptacleTex2Center = [0.493, 0.508];
        let receptacleTex2Radius = 0.59 - 0.395;

        let stemTexture = new CGFtexture(this.scene, "textures/stem.jpg");
        let leavesTexture = new CGFtexture(this.scene, "textures/leaf.jpg");
        let leavesTexCoords = [
            0.495, 0.934, 
            0.128, 0.542, 
            0.495, 0.092, 
            0.862, 0.542,
        ];

        for (let i = 0; i < this.m; i++) {
            for (let j = 0; j < this.n; j++) {
                // Create a new flower and add it to the array

                // Generate a random number between -20 and -60 for the top rotation degree
                let topRotDegree = -20 - Math.random() * (60 - 20);
                let topRotAngle = topRotDegree * (Math.PI / 180); // Convert degrees to radians

                let petalColors = [
                    [0.3, 0.3, 1, 1], // Blue
                    [1, 0.75, 0.8, 1], // Pink
                    [0.5, 0, 0.5, 1], // Purple
                    [1, 0.3, 0.3, 1], // Red
                    [1, 0.5, 0, 1], // Orange
                    [1, 1, 0, 1], // Yellow
                    [0.93, 0.51, 0.93, 1], // Orchid
                    [0.54, 0.17, 0.89, 1], // Indigo
                ];
                // Select a random color
                let randomPetalColorIndex = Math.floor(Math.random() * petalColors.length);
                let randomPetalColor = petalColors[randomPetalColorIndex];

                let stemColors = [
                    [0, 0.5, 0, 1], // Dark Green
                    [0, 1, 0, 1], // Green
                    [0.3, 0.7, 0.3, 1], // Light Green
                    [0.33, 0.42, 0.18, 1], // Olive Green
                    [0.5, 1, 0.2, 1], // Yellow Green
                ];

                // Select a random stem color
                let randomStemColorIndex = Math.floor(Math.random() * stemColors.length);
                let randomStemColor = stemColors[randomStemColorIndex];

                let receptacleColors = [
                    [0.545, 0.271, 0.075], // Brown
                    [0.396, 0.263, 0.129], // Dark Brown
                    [0.184, 0.31, 0.31], // Dark Green
                    [0.678, 1.0, 0.184], // Light Green
                ];

                // Select a random receptacle color
                let randomReceptacleColorIndex = Math.floor(Math.random() * receptacleColors.length);
                let randomReceptacleColor = receptacleColors[randomReceptacleColorIndex];
                // the receptacle texture is randomly selected, and then the coresponing texture center and radius are used
                let receptacleTexture = Math.random() < 0.5 ? receptacleTexture1 : receptacleTexture2;
                let receptacleTexCenter = receptacleTexture === receptacleTexture1 ? receptacleTex1Center : receptacleTex2Center;
                let receptacleTexRadius = receptacleTexture === receptacleTexture1 ? receptacleTex1Radius : receptacleTex2Radius;

                // Generate a random number between 0.5 and 1.5 for the receptacle radius
                let randomReceptacleRadius = 0.5 + Math.random() * (1.5 - 0.5);

                // Generate a random number between 3 and 7 for the external radius
                let randomExternalRadius = 3 + Math.random() * (7 - 3);

                // Generate a random number between 6 and 15 for the number of petals
                let randomPetalsNum = Math.floor(6 + Math.random() * (15 - 6 + 1));
                // the petals texture is randomly selected, and then the coresponing texture coordinates are used
                let petalsTexture = petalsTexArray[Math.floor(Math.random() * petalsTexArray.length)];
                let petalsTexCoords = petalsTexCoordsArray[petalsTexArray.indexOf(petalsTexture)];

                // Generate a random number between 0.1 and 0.25 for the stem radius
                let randomStemRadius = 0.1 + Math.random() * (0.25 - 0.1);
                // Generate a random number between 4 and 7 for the stem size
                let randomStemSize = 4 + Math.random() * 3;

                let minPetalsRotAngle = 20 * (Math.PI / 180); // Convert 20 degrees to radians
                let maxPetalsRotAngle = 40 * (Math.PI / 180); // Convert 40 degrees to radians
                let minPetalsUnionAngle = 30 * (Math.PI / 180); // Convert 30 degrees to radians
                let maxPetalsUnionAngle = 50 * (Math.PI / 180); // Convert 50 degrees to radians


                let flower = new MyFlower(
                    this.scene,
                    topRotAngle,
                    randomExternalRadius,
                    randomPetalsNum,
                    randomPetalColor,
                    Array.from(
                        { length: randomPetalsNum },
                        () => minPetalsRotAngle + Math.random() * (maxPetalsRotAngle - minPetalsRotAngle)
                    ), // Generate a random rotation angle for each petal
                    Array.from(
                        { length: randomPetalsNum },
                        () => minPetalsUnionAngle + Math.random() * (maxPetalsUnionAngle - minPetalsUnionAngle)
                    ), // Generate a random union angle for each petal
                    petalsTexture,
                    petalsTexCoords,
                    randomReceptacleRadius,
                    randomReceptacleColor,
                    receptacleTexture,
                    receptacleTexCenter,
                    receptacleTexRadius,
                    randomStemRadius,
                    randomStemColor,
                    randomStemSize,
                    stemTexture,
                    leavesTexture,
                    leavesTexCoords
                );

                this.flowers.push(flower);

                // Generate a random offset for the x and z coordinates
                let offsetX = Math.random() - this.m / 2;
                let offsetZ = Math.random() - this.n / 2;

                this.positions.push([offsetX + i, 0, offsetZ + j]);

                flower.updateCenterByTransl((offsetX + i)*3, 0, (offsetZ + j)*3);
            }
        }

        this.initBuffers();
    }

    updateFlowersByTranslating(x, y, z) {
        for (let i = 0; i < this.m; i++) {
            for (let j = 0; j < this.n; j++) {
                let flower = this.flowers[i * this.n + j];
                flower.updateCenterByTransl(x, y, z);
            }
        }
    }

    updateFlowersByScaling(x, y, z) {
        for (let i = 0; i < this.m; i++) {
            for (let j = 0; j < this.n; j++) {
                let flower = this.flowers[i * this.n + j];
                flower.updateCenterByScale(x, y, z);
            }
        }
    }

    getFlowers() {
        return this.flowers;
    }

    display() {
        for (let i = 0; i < this.m; i++) {
            for (let j = 0; j < this.n; j++) {
                this.scene.pushMatrix();
                // Use the stored positions for translation
                let pos = this.positions[i * this.n + j];
                this.scene.translate(pos[0] *3, 0, pos[2] *3);
                this.flowers[i * this.n + j].display();
                this.scene.popMatrix();
            }
        }
    }
}


