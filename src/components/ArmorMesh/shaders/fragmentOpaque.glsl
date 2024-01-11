// split shaders due to https://github.com/FarazzShaikh/THREE-CustomShaderMaterial/issues/48

varying vec3 vCSMViewPosition;
uniform float thickness;
uniform float penetration;
uniform float ricochet;
uniform float caliber;
uniform float normalization;
uniform bool canRichochet;
uniform bool canSplash;

void main() {
  vec3 normalizedNormal = normalize(vNormal);
  vec3 normalizedViewPosition = normalize(vCSMViewPosition);
  float dotProduct = dot(normalizedNormal, -normalizedViewPosition);
  float angle = acos(dotProduct);

  float penetrationChance = -1.0;
  bool threeCaliberRule = caliber > 3.0 * thickness;

  if (canRichochet && !threeCaliberRule && angle >= ricochet) {
    // auto ricochet angle and three caliber rule not met
    penetrationChance = 0.0;
  } else {
    bool twoCaliberRule = caliber > 2.0 * thickness;
    float finalNormalization = twoCaliberRule ? (normalization * 1.4 * caliber) / (2.0 * thickness) : normalization;
    float effectiveArmor = thickness / cos(angle - finalNormalization);
    float penetrationRandomRadius = penetration * 0.05;
    float penetrationDifference = effectiveArmor - penetration;

    if (penetrationDifference > penetrationRandomRadius) {
        // even with a +5% buff, can't penetrate
      penetrationChance = 0.0;
    } else if (penetrationDifference < -penetrationRandomRadius) {
        // event with a -5% nerf, can penetrate
      penetrationChance = 1.0;
    } else {
        // penetration gradiant
      penetrationChance = 1.0 - (penetrationDifference + penetrationRandomRadius) / (2.0 * penetrationRandomRadius);
    }
  }

  if (canSplash) {
    float h = mix(20.0 / 360.0, 1.0 / PI, penetrationChance);
    float s = 1.0;
    float v = 1.0;
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(h + K.xyz) * 6.0 - K.www);
    vec3 rgb = v * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), s);

    csm_DiffuseColor = vec4(rgb, 1.0);
  } else {
    float h = mix(0.0, 1.0 / PI, penetrationChance);
    float s = 1.0;
    float v = 1.0;
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(h + K.xyz) * 6.0 - K.www);
    vec3 rgb = v * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), s);

    csm_DiffuseColor = vec4(rgb, 1.0);
  }
}