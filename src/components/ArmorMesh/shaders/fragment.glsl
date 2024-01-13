varying vec3 vCSMViewPosition;
uniform bool isExplosive;
uniform bool canSplash;
uniform bool isSpaced;
uniform bool isExternalModule;
uniform float thickness;
uniform float penetration;
uniform float caliber;
uniform float ricochet;
uniform float normalization;

void main() {
  vec3 normalizedNormal = normalize(vNormal);
  vec3 normalizedViewPosition = normalize(vCSMViewPosition);
  float dotProduct = dot(normalizedNormal, -normalizedViewPosition);
  float angle = acos(dotProduct);

  float penetrationChance = -1.0;
  float splashChance = -1.0;
  bool threeCalibersRule = caliber > 3.0 * thickness;

  if (!isExternalModule && !isExplosive && !threeCalibersRule && angle >= ricochet) {
    penetrationChance = 0.0;
    splashChance = 0.0;
  } else {
    bool twoCalibersRule = caliber > 2.0 * thickness;
    float finalNormalization = twoCalibersRule ? (normalization * 1.4 * caliber) / (2.0 * thickness) : normalization;
    float finalThickness = thickness / cos(angle - finalNormalization);
    float delta = finalThickness - penetration;
    float randomRadius = penetration * 0.05;

    if (delta > randomRadius) {
      penetrationChance = 0.0;
    } else if (delta < -randomRadius) {
      penetrationChance = 1.0;
    } else {
      penetrationChance = 1.0 - (delta + randomRadius) / (2.0 * randomRadius);
    }

    if (canSplash) {
      float reducedFinalThickness = finalThickness * (5.0 / 11.0);
      float splashDelta = reducedFinalThickness - penetration;

      if (splashDelta > randomRadius) {
        splashChance = 0.0;
      } else if (splashDelta < -randomRadius) {
        splashChance = 1.0;
      } else {
        splashChance = 1.0 - (splashDelta + randomRadius) / (2.0 * randomRadius);
      }
    } else {
      splashChance = 0.0;
    }
  }

  if (isSpaced) {
    if (isExternalModule) {
      csm_FragColor = vec4(0.5, 0.0, 1.0, 0.5);
    } else {
      if (isExplosive) {
        csm_FragColor = vec4(1.0, 0.0, 1.0, 0.5);
      } else {
        csm_FragColor = vec4(1.0, 0.0, 1.0, (1.0 - penetrationChance) * 0.5);
      }
    }
  } else {
    csm_FragColor = vec4(1.0, splashChance * 0.392, 0.0, (1.0 - penetrationChance) * 0.5);
  }
}