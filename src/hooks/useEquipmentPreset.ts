import { equipmentDefinitions } from '../core/blitzrinth/equipmentDefinitions';
import { useAwait } from './useAwait';

export function useEquipmentPreset(preset: string) {
  const awaitedEquipmentDefinitions = useAwait(equipmentDefinitions);
  return awaitedEquipmentDefinitions.presets[preset];
}
