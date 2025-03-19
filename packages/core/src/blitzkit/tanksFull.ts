import { fetchPB } from '../protobuf';
import { TanksFull } from '../protos';
import { asset } from './asset';

export function fetchTanksFull() {
  return fetchPB(asset('definitions/tanks-full.pb'), TanksFull);
}
