import { modelDefinitions } from '../core/blitzrinth/modelDefinitions';
import { useAwait } from './useAwait';

export function useModelDefinitions() {
  return useAwait(modelDefinitions);
}
