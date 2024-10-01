import { TankDefinitions } from '../../protos';
import { fetchPB } from '../../types';
import { asset } from '../asset';

export function fetchTankDefinitions() {
  return fetchPB(asset('definitions/tanks.pb'), TankDefinitions);
}

export * from './constants';
