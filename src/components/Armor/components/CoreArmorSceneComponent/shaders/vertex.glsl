varying vec3 vNormal;
varying vec3 vViewPosition;
varying mat4 vProjectionMatrix;

void main() {
  vec4 vViewPosition4 = modelViewMatrix * vec4(position, 1.0);

  vViewPosition = vViewPosition4.xyz;
  vProjectionMatrix = projectionMatrix;
  vNormal = normalMatrix * normal;

  gl_Position = projectionMatrix * vViewPosition4;
}