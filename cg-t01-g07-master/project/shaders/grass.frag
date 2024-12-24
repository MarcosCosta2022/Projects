#ifdef GL_ES
precision highp float;
#endif

varying vec3 vPosition;

void main() {
    float gradient = vPosition.y * 0.5 + 0.3; // Adjust the gradient calculation
    vec4 color = vec4(0.13 * gradient, 0.545 * gradient, 0.13 * gradient, 1.0);
    gl_FragColor = color;
}