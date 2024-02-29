void main() {
  vec4 vViewPosition4 = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * vViewPosition4;
}