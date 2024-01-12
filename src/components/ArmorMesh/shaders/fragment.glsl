uniform bool isExplosive;
uniform bool canSplash;
uniform bool isSpaced;
uniform bool isArmor;
uniform float thickness;
uniform float penetration;
uniform float caliber;
uniform float ricochet;
uniform float normalization;

vec3 zPositive = vec3(0.0, 0.0, 1.0);

void main() {
  float cosAngle = dot(zPositive, vNormal);
  float angle = acos(cosAngle);

  float penetrationChance = -1.0;
  float splashChance = -1.0;
  bool threeCalibersRule = caliber > 3.0 * thickness;

  if (isArmor && !isExplosive && !threeCalibersRule && angle >= ricochet) {
    penetrationChance = 0.0;
    splashChance = 0.0;
  } else {
    bool twoCalibersRule = caliber > 2.0 * thickness;
    float finalNormalization = twoCalibersRule ? (normalization * 1.4 * caliber) / (2.0 * thickness) : normalization;
    float finalThickness = thickness / cos(angle - finalNormalization);

    if (canSplash) {
      if (finalThickness * (5.0 / 11.0) > penetration) {
        penetrationChance = 0.0;
        splashChance = 0.0;
      } else if (finalThickness > penetration) {
        penetrationChance = 0.0;
        splashChance = 1.0;
      } else {
        penetrationChance = 1.0;
        splashChance = 1.0;
      }
    } else {
      if (finalThickness > penetration) {
        penetrationChance = 0.0;
        splashChance = 0.0;
      } else {
        penetrationChance = 1.0;
        splashChance = 0.0;
      }
    }
  }

  if (isSpaced) {
    if (isArmor) {
      if (isExplosive) {
        csm_FragColor = vec4(1.0, 0.0, 1.0, 0.5);
      } else {
        csm_FragColor = vec4(1.0, 0.0, 1.0, (1.0 - penetrationChance) * 0.5);
      }
    } else {
      csm_FragColor = vec4(0.5, 0.0, 1.0, 0.5);
    }
  } else {
    csm_FragColor = vec4(1.0, splashChance * 0.392, 0.0, (1.0 - penetrationChance) * 0.5);
  }
}