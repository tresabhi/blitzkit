import * as TankopediaEphemeral from '../stores/tankopediaEphemeral';

export function useTankModelDefinition() {
  return TankopediaEphemeral.use((state) => state.model);
}
