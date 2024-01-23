varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vZ;
varying mat4 vProjectionMatrix;

void main() {
  vec4 vViewPosition4 = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = vViewPosition4.xyz;
  vZ = -(modelViewMatrix * vec4(position, 1.0)).z;
  vProjectionMatrix = projectionMatrix;
  vNormal = normalMatrix * normal;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}