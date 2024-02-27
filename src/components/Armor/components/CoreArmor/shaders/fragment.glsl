varying vec3 vNormal;
varying vec3 vViewPosition;
varying mat4 vProjectionMatrix;

uniform float thickness;
uniform float penetration;
uniform float caliber;
uniform float ricochet;
uniform float normalization;
uniform vec2 resolution;
uniform bool isExplosive;

uniform highp sampler2D spacedArmorBuffer;
uniform highp sampler2D spacedArmorDepth;

float depthToDistance(float depth) {
  vec4 clipPosition = vec4(gl_FragCoord.xy / resolution * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
  vec4 eyePosition = inverse(vProjectionMatrix) * clipPosition;
  return length(eyePosition.xyz / eyePosition.w);
}

void main() {
  float penetrationChance = -1.0;
  float splashChance = -1.0;

  vec2 screenCoordinates = gl_FragCoord.xy / resolution;
  float angle = acos(dot(vNormal, -vViewPosition) / length(vViewPosition));

  vec4 spacedArmorBufferFragment = texture2D(spacedArmorBuffer, screenCoordinates);
  bool isUnderSpacedArmor = spacedArmorBufferFragment.a != 0.0;

  bool threeCalibersRule = caliber > thickness * 3.0;
  if (!threeCalibersRule && !isUnderSpacedArmor && angle >= ricochet) {
    penetrationChance = 0.0;
  } else {
    bool twoCalibersRule = caliber > thickness * 2.0 && thickness > 0.0;
    float finalNormalization = twoCalibersRule ? ((1.4 * normalization * caliber) / (2.0 * thickness)) : normalization;
    float finalThickness = thickness / cos(angle - finalNormalization);
    float remainingPenetration = penetration;

    if (isUnderSpacedArmor) {
      float spacedArmorThickness = spacedArmorBufferFragment.r * penetration;
      remainingPenetration -= spacedArmorThickness;

      if (isExplosive && remainingPenetration > 0.0) {
        // world space is in meters
        vec4 spacedArmorDepthFragment = texture2D(spacedArmorDepth, screenCoordinates);
        float spacedArmorDistance = depthToDistance(spacedArmorDepthFragment.r);
        float coreArmorDistance = depthToDistance(gl_FragCoord.z);
        float distanceFromSpacedArmor = coreArmorDistance - spacedArmorDistance;

        // there is a 50% penetration loss per meter for HE based shells
        remainingPenetration -= 0.5 * remainingPenetration * distanceFromSpacedArmor;
      }
    }

    remainingPenetration = max(0.0, remainingPenetration);
    float delta = finalThickness - remainingPenetration;
    float randomization = remainingPenetration * 0.05;
    penetrationChance = clamp(1.0 - (delta + randomization) / (2.0 * randomization), 0.0, 1.0);
  }

  vec3 color = vec3(1.0, splashChance * 0.392, 0.0);
  gl_FragColor = vec4(color, (1.0 - penetrationChance) * 0.5);

  // non-trigonometric red-green mixing: https://www.desmos.com/calculator/ceo1oq7l67
  // gl_FragColor = vec4(-pow(penetrationChance, 2.0) + 1.0, -pow(penetrationChance - 1.0, 2.0) + 1.0, 0.0, 0.5);
}