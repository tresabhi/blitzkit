import { clamp } from 'lodash';
import { PitchLimits, YawLimits } from '../blitzkrieg/modelDefinitions';
import { normalizeAngleRad } from '../math/normalizeAngleRad';

export function applyPitchYawLimits(
  pitch: number, // rad
  yaw: number, // rad
  pitchLimits: PitchLimits, // deg
  yawLimits?: YawLimits, // deg
) {
  let newPitch = pitch;
  let newYaw = yaw;

  if (yawLimits) {
    newYaw = normalizeAngleRad(
      clamp(
        newYaw,
        -yawLimits.max * (Math.PI / 180),
        -yawLimits.min * (Math.PI / 180),
      ),
    );
  }

  let lowerPitch = -pitchLimits.max * (Math.PI / 180);
  let upperPitch = -pitchLimits.min * (Math.PI / 180);
  const transition = (pitchLimits.transition ?? 10) * (Math.PI / 180);

  if (pitchLimits.back) {
    const range = pitchLimits.back.range * (Math.PI / 180);
    const yawRotatedAbs = Math.abs(normalizeAngleRad(newYaw - Math.PI));

    if (yawRotatedAbs <= range + transition) {
      if (yawRotatedAbs <= range) {
        // inside range
        lowerPitch = -pitchLimits.back.max * (Math.PI / 180);
        upperPitch = -pitchLimits.back.min * (Math.PI / 180);
      } else {
        // inside transition
        const transitionProgress = (yawRotatedAbs - range) / transition;
        const maxInterpolatedPitch =
          (1 - transitionProgress) * pitchLimits.back.max +
          transitionProgress * pitchLimits.max;
        const minInterpolatedPitch =
          (1 - transitionProgress) * pitchLimits.back.min +
          transitionProgress * pitchLimits.min;

        lowerPitch = -maxInterpolatedPitch * (Math.PI / 180);
        upperPitch = -minInterpolatedPitch * (Math.PI / 180);
      }
    }
  }

  if (pitchLimits.front) {
    const range = pitchLimits.front.range * (Math.PI / 180);
    const yawAbs = Math.abs(normalizeAngleRad(newYaw));

    if (yawAbs <= range + transition) {
      if (yawAbs <= range) {
        // inside range
        lowerPitch = -pitchLimits.front.max * (Math.PI / 180);
        upperPitch = -pitchLimits.front.min * (Math.PI / 180);
      } else {
        // inside transition
        const transitionProgress = (yawAbs - range) / transition;
        const maxInterpolatedPitch =
          (1 - transitionProgress) * pitchLimits.front.max +
          transitionProgress * pitchLimits.max;
        const minInterpolatedPitch =
          (1 - transitionProgress) * pitchLimits.front.min +
          transitionProgress * pitchLimits.min;

        lowerPitch = -maxInterpolatedPitch * (Math.PI / 180);
        upperPitch = -minInterpolatedPitch * (Math.PI / 180);
      }
    }
  }

  newPitch = clamp(newPitch, lowerPitch, upperPitch);

  return [newPitch, newYaw];
}
