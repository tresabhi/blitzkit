import { modelDefinitions } from '../core/blitzkrieg/modelDefinitions';
import { useAwait } from './useAwait';

export function useModelDefinitions() {
  return useAwait(modelDefinitions);
}
