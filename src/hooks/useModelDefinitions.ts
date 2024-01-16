import usePromise from 'react-promise-suspense';
import { modelDefinitions } from '../core/blitzkrieg/modelDefinitions';

export function useModelDefinitions() {
  return usePromise(async () => await modelDefinitions, []);
}
