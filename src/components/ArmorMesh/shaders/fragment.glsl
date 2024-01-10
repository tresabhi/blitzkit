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
  float finalPenetration = penetration;
  float effectiveArmor = thickness / cos(angle - finalNormalization);

  if(angle < ricochet) {
    // no auto-ricochet, resume checks
    if(threeCaliberRule) {
      penetrationChance = 1.0;
    } else {
      float maxRandomPenetrationBuff = finalPenetration * 0.05;
      float penetrationDifference = effectiveArmor - finalPenetration;

      if(penetrationDifference > maxRandomPenetrationBuff) {
        // even with a +5% buff, can't penetrate
        penetrationChance = 0.0;
      } else if(penetrationDifference < -maxRandomPenetrationBuff) {
        // event with a -5% nerf, can penetrate
        penetrationChance = 1.0;
      } else {
        // penetration gradiant
        penetrationChance = 1.0 - (penetrationDifference + maxRandomPenetrationBuff) / (2.0 * maxRandomPenetrationBuff);
      }
    }
  }

  csm_FragColor *= vec4(1.0, 0.0, 0.0, (1.0 - penetrationChance) * 0.5);
}