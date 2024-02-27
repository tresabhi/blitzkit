uniform float thickness;
uniform float penetration;

void main() {
  gl_FragColor = vec4(thickness / penetration, 0.0, 0.0, 1.0);
}