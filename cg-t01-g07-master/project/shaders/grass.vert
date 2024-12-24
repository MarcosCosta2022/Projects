#ifdef GL_ES
precision highp float;
#endif

uniform mat4 uMVMatrix; // Model-View matrix
uniform mat4 uPMatrix; // Projection matrix
uniform float time; // Current time

attribute vec3 aPosition; // Vertex position
varying vec3 vPosition; // Pass position to fragment shader

const float PI = 3.1415926535897932384626433832795;

void main() {
    vec3 newPosition = aPosition;

    if (cos(time) * sin(aPosition.y) * aPosition.y < 0.0) {
        newPosition.z += cos(time) * sin(aPosition.y) * aPosition.y * 0.8;
    }
    else {
        newPosition.z += cos(time) * sin(aPosition.y) * aPosition.y;
    }

    vPosition = newPosition; // Set the varying variable

    // Transform the vertex position and output it
    gl_Position = uPMatrix * uMVMatrix * vec4(newPosition, 1.0);
}