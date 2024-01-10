varying vec3 vCSMViewPosition;

void main() {
  vec4 vViewPosition4 = modelViewMatrix * vec4(position, 1.0);
  vCSMViewPosition = vViewPosition4.xyz;
}