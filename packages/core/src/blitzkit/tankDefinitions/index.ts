import { fetchPB } from '../../protobuf';
import { TankDefinitions } from '../../protos';
import { asset } from '../asset';

export function fetchTankDefinitions() {
  return fetchPB(asset('definitions/tanks.pb'), TankDefinitions);
}

export * from './constants';
