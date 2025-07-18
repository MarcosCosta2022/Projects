import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { NURBSSurface } from 'three/addons/curves/NURBSSurface.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

/**
 *  This class contains the contents of out application
 */
class MyNurbsBuilder  {
    /**
       constructs the object
       @param {MyApp} app The application object
    */

    constructor(app) {
        this.app = app
    }

    build(controlPoints, degree1, degree2, samples1, samples2, material) {
        const knots1 = []
        const knots2 = []

        // build knots1 = [ 0, 0, 0, 1, 1, 1 ];
        for (var i = 0; i <= degree1; i++) {
            knots1.push(0)
        }

        for (var i = 0; i <= degree1; i++) {
            knots1.push(1)
        }


        // build knots2 = [ 0, 0, 0, 0, 1, 1, 1, 1 ];
        for (var i = 0; i <= degree2; i++) {
            knots2.push(0)
        }

        for (var i = 0; i <= degree2; i++) {
            knots2.push(1)
        }

        let stackedPoints = []
        for (var i = 0; i < controlPoints.length; i++) {
            let row = controlPoints[i]
            let newRow = []

            for (var j = 0; j < row.length; j++) {
                let item = row[j]
                newRow.push(new THREE.Vector4(item[0],
                item[1], item[2], item[3]));
            }
            stackedPoints[i] = newRow;
        }
        const nurbsSurface = new NURBSSurface( degree1, degree2,
                                     knots1, knots2, stackedPoints );

        const geometry = new ParametricGeometry( getSurfacePoint,
                                                 samples1, samples2 );

        return geometry;

        function getSurfacePoint( u, v, target ) { // what is this ???
            return nurbsSurface.getPoint( u, v, target );
        }
    }

    createPoints(geometry, size = 0.1, color = 0xffffff) {
        // Create a BufferGeometry to hold the points
        const pointsGeometry = new THREE.BufferGeometry();

        // Get the positions from the provided geometry
        const positions = geometry.attributes.position.array;

        // Create a Float32Array to hold the point positions
        const pointPositions = new Float32Array(positions.length);
        for (let i = 0; i < positions.length; i++) {
            pointPositions[i] = positions[i];
        }

        // Set the position attribute of the points geometry
        pointsGeometry.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));

        // Create a PointsMaterial
        const pointsMaterial = new THREE.PointsMaterial({ size, color });

        // Create and return the Points object
        return new THREE.Points(pointsGeometry, pointsMaterial);
    }

    createControlPoints(controlPoints, size = 0.1, color = 0xff0000) {
        // Create a BufferGeometry to hold the control points
        const pointsGeometry = new THREE.BufferGeometry();

        // Flatten the controlPoints array to get a single array of positions
        const controlPointsArray = [];
        for (const row of controlPoints) {
            for (const point of row) {
                controlPointsArray.push(point[0], point[1], point[2]); // Assuming point is of the form [x, y, z, w]
            }
        }

        // Set the position attribute of the points geometry
        pointsGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(controlPointsArray), 3));

        // Create a PointsMaterial
        const pointsMaterial = new THREE.PointsMaterial({ size, color });

        // Create and return the Points object
        return new THREE.Points(pointsGeometry, pointsMaterial);
    }

}


export { MyNurbsBuilder };