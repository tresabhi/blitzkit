import { ThreeEvent } from '@react-three/fiber';
import { Vector2 } from 'three';
import { applyPitchYawLimits } from '../blitz/applyPitchYawLimits';
import { normalizeAngleRad } from '../math/normalizeAngleRad';
import { hasEquipment } from './hasEquipment';
import { modelTransformEvent } from './modelTransform';

export function tankTransformHandlers() {
  const position = new Vector2();
  const delta = new Vector2();
  let pitch = 0;
  let yaw = 0;

  function onPointerDown(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();

    if (isTurret) {
      position.set(event.clientX, event.clientY);
      yaw = protagonist.yaw;
      pitch = protagonist.pitch;

      mutateTankopediaTemporary((draft) => {
        draft.controlsEnabled = false;
      });
      mutateTankopediaTemporary((draft) => {
        draft.shot = undefined;
        draft.highlightArmor = undefined;
      });
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
  }
  async function handlePointerMove(event: PointerEvent) {
    const duel = duelStore.getState();
    const hasImprovedVerticalStabilizer = await hasEquipment(
      122,
      duel.protagonist.tank.equipment,
      duel.protagonist.equipmentMatrix,
    );
    const boundingRect = canvas.getBoundingClientRect();

    delta.set(event.clientX, event.clientY).sub(position);
    position.set(event.clientX, event.clientY);

    [pitch, yaw] = applyPitchYawLimits(
      pitch,
      yaw + delta.x * (Math.PI / boundingRect.width),
      gunModelDefinition.pitch,
      turretModelDefinition.yaw,
      hasImprovedVerticalStabilizer,
    );
    modelTransformEvent.emit({ pitch, yaw });
  }
  function handlePointerUp() {
    mutateDuel((draft) => {
      draft.protagonist.pitch = normalizeAngleRad(pitch);
      draft.protagonist.yaw = normalizeAngleRad(yaw);
    });
    mutateTankopediaTemporary((draft) => {
      draft.controlsEnabled = true;
    });
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }

  return { onPointerDown };
}
