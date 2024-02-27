varying vec3 vNormal;
varying vec3 vViewPosition;

uniform float thickness;
uniform float penetration;
uniform float caliber;
uniform float ricochet;
uniform float normalization;
uniform vec2 resolution;

uniform sampler2D spacedArmorBuffer;
uniform highp sampler2D spacedArmorDepth;

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
      remainingPenetration -= spacedArmorBufferFragment.r * penetration;
    }

    float delta = finalThickness - remainingPenetration;
    float randomization = remainingPenetration * 0.05;

    penetrationChance = clamp(1.0 - (delta + randomization) / (2.0 * randomization), 0.0, 1.0);
  }

  vec3 color = vec3(1.0, splashChance * 0.392, 0.0);
  gl_FragColor = vec4(0.0, penetrationChance, 0.0, 1.0);
  gl_FragColor = vec4(color, (1.0 - penetrationChance) * 0.5);
}