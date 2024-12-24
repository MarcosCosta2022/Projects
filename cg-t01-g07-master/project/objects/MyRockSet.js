import {CGFobject, CGFappearance} from '../../lib/CGF.js';
import {MyRock} from './MyRock.js';


export class MyRockSet extends CGFobject {
	constructor(scene, height, appearance = null, isStatic = false) {
		super(scene);

        // randomize the piramid inclination bwtween 0.7 and 1.4
        this.inclination = 0.7 + Math.random()*0.7;
        if (isStatic && height == 3){
            this.inclination =1.136;
        }

        //console.log("Inclination = " + this.inclination);

        this.height = height;
        // init rocks
        this.rocks = [];
        this.scales = [];
        this.rotations = [];

        // the upper layer is one rock
        // each subsequent layer is a square of rocks with side +2 rocks of the previous layer
        for (let i = height - 1; i >= 0; i--){
            let side = 2*i + 1;
            for (let r = 0; r < side*side; r++){
                this.rocks.push(new MyRock(scene, 9, 5));
                // Generate a random scale factor for each rock

                // generate overall scale factor for the rock
                let scale = 0.5 + Math.random();
                
                this.scales.push([
                    scale + Math.random()*0.5,
                    scale + Math.random()*0.5,
                    scale + Math.random()*0.5
                ]);
                
                this.rotations.push(Math.random()*Math.PI*2);
            }
        }
        if (isStatic && height == 3){
            this.scales = [
                [3, 1.3, 3],
                [1.4981583660726385, 1.728744367774365, 1.577253955173184],
                [1.9948209994147907, 1.9726957352440961, 1.7624170195689628],
                [1.6341042135306263, 1.6226656385526859, 1.6113974690784199],
                [1.3507868977643684, 1.325711305770259, 1.6515984029338804],
                [1.9211737974354268, 1.7650107192398823, 1.7104224143225513],
                [1.1890893010335022, 1.202907407136917, 1.4338816550646047],
                [1.1263222711062193, 1.3156870337095337, 0.9224398413848756],
                [1.6428448221961856, 1.4949570006911908, 1.821043526599083],
                [1.2736864181749423, 1.5206458850984592, 1.4012361761048604],
                [1.0807763474326313, 1.247112428232867, 1.096552885982181],
                [0.9120843184247999, 1.0117134187802557, 0.9465696641086998],
                [0.9097734539493365, 0.8371777666615384, 0.8276708339815537],
                [1.730964920204746, 1.4766545582669992, 1.3835579707655334],
                [1.6741111669624127, 1.4012703389404488, 1.7727765637447945],
                [1.1508400795389877, 1.064800755374189, 0.8367545031632047],
                [1.0077234676452806, 0.8287885672207101, 0.9777375593190742],
                [1.3268659400861404, 1.6805942983483173, 1.6865926141619885],
                [1.4027871045337927, 1.7211416179902943, 1.3137366476834473],
                [1.372809963373581, 1.143515421882864, 1.3124014887046016],
                [0.9941571416296775, 1.4409005067924503, 1.411650935559272],
                [1.0797988554747013, 1.4415664280957734, 1.3386672778840358],
                [1.844567764597068, 1.4718840640865978, 1.8129832237539198],
                [1.3983168436542746, 1.5233165334801237, 1.5291261272863619],
                [1.3318180399253459, 1.1845411698710069, 1.3867215152508565],
                [1.419519524015625, 1.141143760330978, 1.3466972344429524],
                [1.4857932241373595, 1.465404922625657, 1.2705719689741417],
                [0.7526455723724041, 0.7991898994081922, 1.206663391919487],
                [1.47612878195753, 1.785989241927916, 1.7391136970031735],
                [1.6119151378357457, 1.439021406382094, 1.435071354944357],
                [1.4538409577617393, 1.3151311477910175, 1.2491181902019064],
                [1.6319318655152317, 1.2440601730700076, 1.3320009285228989],
                [1.0237441296939038, 1.2856932446939418, 0.8364803186803486],
                [1.8328807800436449, 1.6333347605513522, 1.8055510056464077],
                [1.7239924612233544, 1.4359975938735885, 1.3961033260442512],
            ];
            this.rotations = [
                0,
                3.1614013353272425,
                3.1741829895021567,
                5.175918473022905,
                5.708983834187585, 
                3.208659883239087, 
                1.3343495372631229, 
                4.809368386859881, 
                0.8830456131300998, 
                0.20844308061692723,
                1.984539379061454,
                4.674253583898674, 
                4.170995382758486, 
                3.6073908332421416, 
                5.257373926658848,
                5.558359488361392,
                1.9075962364368695,
                2.4344337834457774,
                5.035578142327015,
                6.188130436774983, 
                2.6541533034896507,
                4.043731397196509,
                3.733959530006125,
                5.369026266706502, 
                4.153599828550153, 
                5.45189152215738, 
                0.26148428713672156,
                4.785389538622794, 
                0.446870195627372,
                0.8005343752087875,
                5.633396900399507, 
                1.7679241722884265,
                1.5647741418674403,
                5.9775938325794264,
                4.617504442423732,            
            ]
        }

        var string = "Scales = [\n";

        for(let i = 0; i < this.scales.length; i++){
            string += "[" + this.scales[i][0] + ", " + this.scales[i][1] + ", " + this.scales[i][2] + "],\n";
        }
        string += "];\n";

        //console.log(string);

        string = "Rotations = [\n";

        for(let i = 0; i < this.rotations.length; i++){
            string += this.rotations[i] + ",\n";
        }
        string += "];\n";

        //console.log(string);

        if (appearance == null){
            this.rockAppearance = new CGFappearance(this.scene);
            this.rockAppearance.setAmbient(0.1, 0.1, 0.1, 1);
            this.rockAppearance.setDiffuse(0.6, 0.6, 0.6, 1);
            this.rockAppearance.setSpecular(0.2,0.2,0.2, 1);
            this.rockAppearance.loadTexture('textures/rock4.jpg');
            this.rockAppearance.setTextureWrap('REPEAT', 'REPEAT');
        } else {
            this.rockAppearance = appearance;
        }
	}

    display(){
        // display the rocks
        this.rockAppearance.apply();
        // for each level starting from the top
        let rockIndex = 0;
        for (let level = 0; level < this.height; level++){
            let dy = this.height - level - 1;
            let side = level*2 + 1;
            for (let row = 0; row < side; row++){
                for (let col = 0; col < side; col++){
                    let dx = (col - level) * this.inclination;
                    let dz = (row - level)* this.inclination;
                    this.scene.pushMatrix();
                    this.scene.translate(dx, dy, dz);
                    this.scene.scale(...this.scales[rockIndex]);
                    
                    // rotate the rock
                    this.scene.rotate(this.rotations[rockIndex], 1, 0, 0);

                    this.scene.scale(this.inclination*0.6, 1, this.inclination*0.6);
                    
                    this.rocks[row*side + col].display();
                    this.scene.popMatrix();
                    rockIndex++;
                }
            }
        }
    }


	
}

