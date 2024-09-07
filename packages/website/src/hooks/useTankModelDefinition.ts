'use client';

import * as TankopediaEphemeral from '../../packages/website/src/stores/tankopediaEphemeral';

export function useTankModelDefinition() {
  return TankopediaEphemeral.use((state) => state.model);
}
