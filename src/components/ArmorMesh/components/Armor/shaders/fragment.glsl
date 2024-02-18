#define PI 3.1415926535897932384626433832795

varying vec3 vViewPosition;
varying vec3 vNormal;
uniform bool isExplosive;
uniform bool canRicochet;
uniform bool canSplash;
uniform float thickness;
uniform float penetration;
uniform float caliber;
uniform float ricochetAngle;
uniform float normalization;
uniform sampler2D externalModuleMask;
uniform highp sampler2D spacedArmorDepth;
uniform sampler2D spacedArmorMask;
uniform vec2 resolution;
varying mat4 vProjectionMatrix;
uniform float maxThickness;
uniform bool greenPenetration;
uniform float damage;
uniform float explosionRadius;
uniform bool wireframe;

float depthToDistance(float depth) {
  mat4 projectionMatrixInverse = inverse(vProjectionMatrix);
  vec4 clipPosition = vec4(gl_FragCoord.xy / resolution * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
  vec4 eyePosition = projectionMatrixInverse * clipPosition;
  vec3 NDCPosition = eyePosition.xyz / eyePosition.w;
  float worldDistance = length(NDCPosition);

  return worldDistance;
}

void main() {
  float penetrationChance = -1.0;
  float splashChance = -1.0;

  vec2 screenCoordinates = gl_FragCoord.xy / resolution;
  vec4 externalModuleMaskColor = texture2D(externalModuleMask, screenCoordinates);
  vec4 spacedArmorMaskColor = texture2D(spacedArmorMask, screenCoordinates);
  bool isUnderExternalModule = externalModuleMaskColor.r == 1.0;
  bool isUnderSpacedArmor = spacedArmorMaskColor.a == 1.0;
  float spacedArmorAngle = spacedArmorMaskColor.r * (PI / 2.0);

  float coreArmorangle = acos(dot(vNormal, -normalize(vViewPosition)));
  bool coreArmorThreeCalibersRule = caliber > 3.0 * thickness;
  float spacedArmorNominalThickness = spacedArmorMaskColor.g * maxThickness;
  bool spacedArmorThreeCalibersRule = isUnderSpacedArmor && caliber > 3.0 * spacedArmorNominalThickness;
  bool hasRicochetedSpacedArmor = isUnderSpacedArmor && !spacedArmorThreeCalibersRule && spacedArmorAngle >= ricochetAngle;
  bool hasRicochetedCoreArmor = !hasRicochetedSpacedArmor && !isUnderExternalModule && canRicochet && !coreArmorThreeCalibersRule && coreArmorangle >= ricochetAngle;

  if (hasRicochetedCoreArmor || hasRicochetedSpacedArmor) {
    penetrationChance = 0.0;
    splashChance = 0.0;
  } else {
    // time to chip away at the penetration, one case at a time
    float remainingPenetration = penetration;

    if (isUnderExternalModule) {
      // external modules don't care about angle, they'll reduce penetration by their thickness
      float externalModuleThickness = externalModuleMaskColor.g * maxThickness;
      remainingPenetration -= externalModuleThickness;
    }

    if (isUnderSpacedArmor) {
      // spaced armor on the other hand, does care about angle
      bool spacedArmorTwoCalibersRule = caliber > 2.0 * spacedArmorNominalThickness && spacedArmorNominalThickness > 0.0;
      float finalSpacedArmorNormalization = spacedArmorTwoCalibersRule ? (normalization * 1.4 * caliber) / (2.0 * spacedArmorNominalThickness) : normalization;
      float finalSpacedArmorThickness = spacedArmorNominalThickness / cos(spacedArmorAngle - finalSpacedArmorNormalization);
      remainingPenetration -= finalSpacedArmorThickness;
    }
    remainingPenetration = max(remainingPenetration, 0.0);

    float spacedArmorDepth = texture2D(spacedArmorDepth, screenCoordinates).r;
    float spacedArmorDistance = depthToDistance(spacedArmorDepth);
    float coreArmorDistance = depthToDistance(gl_FragCoord.z);
    float distanceFromSpacedArmor = abs(coreArmorDistance - spacedArmorDistance);
    if (isExplosive) {
      // there is a 50% penetration loss per meter for HE based shells
      remainingPenetration -= 0.5 * remainingPenetration * distanceFromSpacedArmor;
    }

    bool coreArmorTwoCalibersRule = caliber > 2.0 * thickness && thickness > 0.0;
    float finalNormalization = coreArmorTwoCalibersRule ? (normalization * 1.4 * caliber) / (2.0 * thickness) : normalization;
    float finalCoreArmorThickness = thickness / cos(coreArmorangle - finalNormalization);
    float deltaPenetration = finalCoreArmorThickness - remainingPenetration;
    float randomRadius = remainingPenetration * 0.05;

    if (deltaPenetration > randomRadius) {
      // even with a 5% buff to the penetration, can't penetrate
      penetrationChance = 0.0;
    } else if (deltaPenetration < -randomRadius) {
      // even with a 5% nerf, can penetrate
      penetrationChance = 1.0;
    } else {
      // transition area
      penetrationChance = max(1.0 - (deltaPenetration + randomRadius) / (2.0 * randomRadius), 0.0);
    }

    if (canSplash) {
      // only allow splasing if the damage equation deals more than 0 damage
      float nominalArmorThickness = finalCoreArmorThickness - remainingPenetration;
      float finalDamage = 0.5 * damage * (1.0 - distanceFromSpacedArmor / explosionRadius) - 1.1 * nominalArmorThickness;
      splashChance = finalDamage > 0.0 ? 1.0 : 0.0;
    } else {
      splashChance = 0.0;
    }
  }

  vec3 color = vec3(1.0, splashChance * 0.392, 0.0);
  if (greenPenetration || wireframe) {
    gl_FragColor = vec4(mix(color, vec3(0.0, 1.0, 0.0), penetrationChance), wireframe ? 1.0 : 0.5);
  } else {
    gl_FragColor = vec4(color, (1.0 - penetrationChance) * 0.5);
  }
}