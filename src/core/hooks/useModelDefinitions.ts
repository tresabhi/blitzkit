import usePromise from 'react-promise-suspense';
import { modelDefinitions } from '../blitzkrieg/modelDefinitions';

export function useModelDefinitions() {
  return usePromise(async () => await modelDefinitions, []);
}
