#define PI 3.1415926535897932384626433832795

varying vec3 vViewPosition;
varying vec3 vNormal;
uniform float thickness;
uniform float maxThickness;

void main() {
  float angle = acos(dot(vNormal, -normalize(vViewPosition)));
  gl_FragColor = vec4(angle / (PI / 2.0), thickness / maxThickness, 0.0, 1.0);
}