import * as THREE from 'three';


/**
 *  This class contains the contents of out application
 */
class MyTrack extends THREE.Object3D {
    constructor(app, path, segments, width,material, textlength_s = 1 , textlength_t = 1) {
        super();
        this.app = app;
        
        this.path = path;
        this.segments = segments;
        this.width = width;
        this.material = material;
        this.textlength_s = textlength_s;
        this.textlength_t = textlength_t;

        this.closedCurve = true;

        this.mesh = null;

        this.buildCurve();
    }

    getWidth(){
        return this.width;
    }

    /**
     * Creates the necessary elements for the curve
     */
    buildCurve() {
        // Create the curve
        const curve = new THREE.CatmullRomCurve3(this.path, this.closedCurve);

        // calculate radius based on the width
        this.radius = this.width / (2 * Math.sin(Math.PI / 3));

        this.geometry = new THREE.TubeGeometry(
            curve,
            this.segments,
            this.radius,
            3
        );

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.receiveShadow = true;
        /*
        //this.wireframe = new THREE.Mesh(geometry, this.wireframeMaterial);

        //let points = this.path.getPoints(this.segments);
        //let bGeometry = new THREE.BufferGeometry().setFromPoints(points);

        // Create the final object to add to the scene
        //this.line = new THREE.Line(bGeometry, this.lineMaterial);

        this.curve = new THREE.Group();

        this.mesh.visible = this.showMesh;
        this.wireframe.visible = this.showWireframe;
        this.line.visible = this.showLine;

        this.curve.add(this.mesh);
        this.curve.add(this.wireframe);
        this.curve.add(this.line);
        */
        this.mesh.rotation.x = Math.PI / 2; // facineg up
        this.mesh.scale.z = 0.5; // halve the height to make it look like a road/plataform
        this.mesh.position.y = -(this.radius * Math.cos(Math.PI / 3))*this.mesh.scale.z; // so that the tracks base is contained in the y=0 plane
        this.add(this.mesh);

        this.meshSegments = this.getMeshSegments();

        // Add the finish line
        const finishLineTexture = this.app.contents.finishLineTexture;
        const finishLineMaterial = new THREE.MeshPhongMaterial({
            map: finishLineTexture,
            emissiveMap: finishLineTexture,
        });
        const rectangle = new THREE.PlaneGeometry(this.width - 10, 10);
        const finishLine = new THREE.Mesh(rectangle, finishLineMaterial);

        // Calculate the forward direction based on meshSegments
        const forward = this.meshSegments[1].clone().sub(this.meshSegments[0]);
        forward.y = 0; // Flatten to the XZ plane
        forward.normalize();

        // Calculate a perpendicular direction for alignment
        const perpendicular = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        // Use the perpendicular vector to determine the rotation angle
        const referenceVector = new THREE.Vector3(1, 0, 0); // Along the X-axis
        const angle = referenceVector.angleTo(perpendicular);
        const cross = referenceVector.clone().cross(perpendicular); // Check rotation direction
        const signedAngle = cross.y < 0 ? -angle : angle; // Adjust for direction

        // Rotate and position the finish line
        finishLine.rotation.x = -Math.PI / 2; // Align to XZ plane
        finishLine.rotation.z = signedAngle; // Rotate to be perpendicular to forward vector
        finishLine.position.copy(this.meshSegments[0]); // Place at the start
        finishLine.position.y = 0.1; // Slightly raise above the ground

        this.add(finishLine);


        this.debugSegments();

        // adapt material to track
        if(this.material.map){ // if it has a texture
            const ratio = this.totalLength/(this.width*3);
            this.material.map.repeat.set(ratio*3 / this.textlength_s,3 / this.textlength_t);
            this.material.map.wrapS = THREE.RepeatWrapping;
            this.material.map.wrapT = THREE.RepeatWrapping;
        }
    }

    debugSegments(){
        const segmentPoints = this.meshSegments.map(v => [v.x, 1, v.z]).flat(); // Extract x, y, z and flatten
        const vertices = new Float32Array(segmentPoints);

        // Create a geometry from the vertices
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        // Use a basic material for visualization
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

        // Create line segments from the geometry and material
        const lineSegments = new THREE.Line(geometry, material);

        // Add to your scene
        this.add(lineSegments);
    }

    getMeshSegments(){
        this.mesh.updateMatrixWorld();

        let points = this.mesh.geometry.attributes.position.array;
        let segmentPoints = [];
        let index;
        const transformationMatrix = this.mesh.matrixWorld;

        let totalLength = 0;

        for(index = 0; index < points.length; index+=12){
            const point = new THREE.Vector3(points[index], points[index+1], points[index+2]);
            // aply the transformation matrix of the mesh 
            point.applyMatrix4(transformationMatrix)
            point.y =0;
            segmentPoints.push(point);

            if(index != 0){
                // calculate distance to previous segmentPoint
                const distance = segmentPoints[index/12-1].distanceTo(point);
                totalLength += distance;
            }
        }

        this.totalLength = totalLength;

        return segmentPoints;
    }

    getDistanceBetweenSegmentAndPoint(segmentPoint1, segmentPoint2, point) {
        // Create 2D points using x and z coordinates consistently
        const sp1_2d = new THREE.Vector2(segmentPoint1.x, segmentPoint1.z);
        const sp2_2d = new THREE.Vector2(segmentPoint2.x, segmentPoint2.z);
        const point_2d = new THREE.Vector2(point.x, point.z);
    
        // Calculate the vector representing the line segment
        const lineVec = sp2_2d.clone().sub(sp1_2d);
        
        // Vector from segment start to the point
        const pointVec = point_2d.clone().sub(sp1_2d);
        
        // Project pointVec onto lineVec
        const lineLength = lineVec.length();
        const lineDirection = lineVec.clone().normalize();
        
        // Calculate the projection of pointVec onto the line
        const projection = pointVec.dot(lineDirection);
        
        // Check if the projection is outside the segment
        if (projection < 0) {
            // Closest point is the start of the segment
            return {
                distance: point_2d.distanceTo(sp1_2d),
                closestPoint: segmentPoint1.clone()
            };
        } else if (projection > lineLength) {
            // Closest point is the end of the segment
            return {
                distance: point_2d.distanceTo(sp2_2d),
                closestPoint: segmentPoint2.clone()
            };
        }
        
        // Calculate the closest point on the line segment
        const closestPoint2D = sp1_2d.clone().add(
            lineDirection.multiplyScalar(projection)
        );
        
        // Convert back to 3D point
        const closestPoint3D = new THREE.Vector3(
            closestPoint2D.x,
            0,
            closestPoint2D.y
        );
        
        // Return the distance and closest point
        return {
            distance: point_2d.distanceTo(closestPoint2D),
            closestPoint: closestPoint3D
        };
    }

    getClosestPoint(point){
        let minDistance = Infinity;
        let closestPoint = null;
        
        let index;
        for(index = 0; index < this.meshSegments.length-1; index+=1){
            const {distance: dis, closestPoint: cp} = this.getDistanceBetweenSegmentAndPoint(this.meshSegments[index], 
                this.meshSegments[index+1], point);
            if (dis < minDistance){
                minDistance = dis;
                closestPoint = cp;
            }
        }

        return {distance: minDistance, closestPoint: closestPoint}
    }

    getClosestSegment(point){
        let minDistance = Infinity;
        let segmentPoint1 = null;
        let segmentPoint2 = null;
        
        let index;
        for(index = 0; index < this.meshSegments.length-1; index+=1){
            const {distance: dis, closestPoint: cp} = this.getDistanceBetweenSegmentAndPoint(this.meshSegments[index], 
                this.meshSegments[index+1], point);
            if (dis < minDistance){
                minDistance = dis;
                segmentPoint1 = this.meshSegments[index].clone();
                segmentPoint2 = this.meshSegments[index+1].clone();
            }
        }

        return {distance: minDistance, point1 : segmentPoint1, point2 : segmentPoint2}
    }

    getStartingPositions(dist = null) {
        if(dist === null){
            dist = this.width/4;
        }

        // Calculates the two positions that are `dist` away from the starting point,
        // perpendicular to the track at the starting point
        const startingPoint = this.meshSegments[0].clone();
        const secondPoint = this.meshSegments[1].clone();
        
        // Get forward vector
        const forwardVector = secondPoint.sub(startingPoint).normalize();
        
        // Get the perpendicular vector in the xz plane
        const perpendicular = forwardVector.clone();
        const temp = perpendicular.x; // Swap x and z components
        perpendicular.x = perpendicular.z;
        perpendicular.z = temp;
        perpendicular.z *= -1; // To ensure perpendicular direction is correct
        
        // Calculate right and left positions without mutating startingPoint
        const right = startingPoint.clone().add(perpendicular.clone().multiplyScalar(dist));
        const left = startingPoint.clone().add(perpendicular.clone().multiplyScalar(-dist));
    
        return { right, left };
    }
    

    getForwardVector(position){
        // get closest segment
        const {distance, point1, point2} = this.getClosestSegment(position);

        // calculate vector
        let forward = point2.sub(point1);
        forward.normalize();

        return forward;
    }
}

export { MyTrack };