attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;
uniform float timeFactor;

varying vec2 vTextureCoord;
uniform sampler2D uSampler3;

void main() {
	vTextureCoord = aTextureCoord;
	vec3 offset = aVertexNormal * 0.1 * texture2D(uSampler3, mod((vTextureCoord+vec2(timeFactor*.005,timeFactor*.005))/2.0, vec2(1.0, 1.0))).b;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + offset, 1.0);
}