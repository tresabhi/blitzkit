varying vec3 vViewPosition;
uniform float thickness;
uniform float penetration;
uniform float ricochet;
uniform float caliber;
uniform float normalization;

void main() {
  vec3 normalizedNormal = normalize(vNormal);
  vec3 normalizedViewPosition = normalize(vViewPosition);
  float cosAngle = dot(normalizedNormal, -normalizedViewPosition);
  float angle = acos(cosAngle);

  float penetrationChance = 0.0;
  bool twoCaliberRule = caliber > 2.0 * thickness;
  bool threeCaliberRule = caliber > 3.0 * thickness;
  float finalNormalization = twoCaliberRule ? (normalization * 1.4 * caliber) / (2.0 * thickness) : normalization;

  float effectiveArmor = thickness / cos(angle - finalNormalization);

  if(angle < ricochet) {
    // no auto-ricochet, resume checks
    if(effectiveArmor <= penetration || threeCaliberRule) {
      penetrationChance = 1.0;
    }
  }

  csm_FragColor *= vec4(1.0, 0.0, 0.0, (1.0 - penetrationChance) * 0.5);
}