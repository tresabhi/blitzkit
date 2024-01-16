varying vec3 vCSMViewPosition;
varying float vZ;
varying mat4 vProjectionMatrix;

void main() {
  vec4 vViewPosition4 = modelViewMatrix * vec4(position, 1.0);
  vCSMViewPosition = vViewPosition4.xyz;

  vZ = -(modelViewMatrix * vec4(position, 1.0)).z;

  vProjectionMatrix = projectionMatrix;
}