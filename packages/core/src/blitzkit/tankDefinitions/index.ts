import { TankDefinitions } from '../../protos';
import { asset } from '../asset';

export async function fetchTankDefinitions() {
  const response = await fetch(asset('definitions/tanks.pb'));
  const buffer = await response.arrayBuffer();
  const array = new Uint8Array(buffer);

  return TankDefinitions.deserializeBinary(array).toObject();
}

export * from './constants';
