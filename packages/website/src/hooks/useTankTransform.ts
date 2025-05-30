import {
  I_HAT,
  J_HAT,
  K_HAT,
  TrackDefinition,
  TurretDefinition,
} from '@blitzkit/core';
import { invalidate } from '@react-three/fiber';
import { type RefObject, useEffect } from 'react';
import { Euler, Group, Vector3 } from 'three';
import { degToRad } from 'three/src/math/MathUtils.js';
import { correctZYTuple } from '../core/blitz/correctZYTuple';
import {
  modelTransformEvent,
  type ModelTransformEventData,
} from '../core/blitzkit/modelTransform';
import { Duel } from '../stores/duel';
import { useTankModelDefinition } from './useTankModelDefinition';

export function useTankTransform(
  track: TrackDefinition,
  turret: TurretDefinition,
  turretContainer: RefObject<Group>,
  gunContainer: RefObject<Group>,
) {
  const tankModelDefinition = useTankModelDefinition();
  const duelStore = Duel.useStore();

  useEffect(() => {
    const trackModelDefinition = tankModelDefinition.tracks[track.id];
    const turretModelDefinition = tankModelDefinition.turrets[turret.id];
    const hullOrigin = correctZYTuple(trackModelDefinition.origin);
    const turretOrigin = correctZYTuple(tankModelDefinition.turret_origin);
    const gunOrigin = correctZYTuple(turretModelDefinition.gun_origin);
    const turretPosition = new Vector3();
    const turretRotation = new Euler();
    const gunPosition = new Vector3();
    const gunRotation = new Euler();

    function handleModelTransform(modelTransform?: ModelTransformEventData) {
      const duel = duelStore.getState();
      const yaw = modelTransform?.yaw ?? duel.protagonist.yaw;
      const pitch = modelTransform?.pitch ?? duel.protagonist.pitch;

      gunPosition
        .set(0, 0, 0)
        .sub(hullOrigin)
        .sub(turretOrigin)
        .sub(gunOrigin)
        .applyAxisAngle(I_HAT, pitch)
        .add(gunOrigin)
        .add(turretOrigin)
        .add(hullOrigin);
      gunRotation.set(pitch, 0, 0);
      gunContainer.current?.position.copy(gunPosition);
      gunContainer.current?.rotation.copy(gunRotation);

      if (yaw === undefined) return;

      turretPosition
        .set(0, 0, 0)
        .sub(hullOrigin)
        .sub(turretOrigin)
        .applyAxisAngle(new Vector3(0, 0, 1), yaw);
      turretRotation.set(0, 0, yaw);

      if (tankModelDefinition.initial_turret_rotation) {
        const initialPitch = -degToRad(
          tankModelDefinition.initial_turret_rotation.pitch,
        );
        const initialYaw = -degToRad(
          tankModelDefinition.initial_turret_rotation.yaw,
        );
        const initialRoll = -degToRad(
          tankModelDefinition.initial_turret_rotation.roll,
        );

        turretPosition
          .applyAxisAngle(I_HAT, initialPitch)
          .applyAxisAngle(J_HAT, initialRoll)
          .applyAxisAngle(K_HAT, initialYaw);
        turretRotation.x += initialPitch;
        turretRotation.y += initialRoll;
        turretRotation.z += initialYaw;
      }

      turretPosition.add(turretOrigin).add(hullOrigin);
      turretContainer.current?.position.copy(turretPosition);
      turretContainer.current?.rotation.copy(turretRotation);

      invalidate();
    }

    handleModelTransform();

    modelTransformEvent.on(handleModelTransform);

    const unsubscribes = [
      duelStore.subscribe(
        (state) => state.protagonist.pitch,
        () => handleModelTransform(),
      ),
      duelStore.subscribe(
        (state) => state.protagonist.yaw,
        () => handleModelTransform(),
      ),
      () => modelTransformEvent.off(handleModelTransform),
    ];

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [track, turret]);
}
