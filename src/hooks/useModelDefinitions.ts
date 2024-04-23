import { modelDefinitions } from '../core/blitzkit/modelDefinitions';
import { useAwait } from './useAwait';

export function useModelDefinitions() {
  return useAwait(modelDefinitions);
}
