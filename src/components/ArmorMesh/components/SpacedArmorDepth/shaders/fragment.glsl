varying vec3 vCSMViewPosition;
uniform float thickness;
uniform float maxThickness;

void main() {
  vec3 normalizedNormal = normalize(vNormal);
  vec3 normalizedViewPosition = normalize(vCSMViewPosition);
  float dotProduct = dot(normalizedNormal, -normalizedViewPosition);
  float angle = acos(dotProduct);

  csm_FragColor = vec4(angle / PI, thickness / maxThickness, 0.0, 1.0);
}