import { fetchPB } from '../protobuf';
import { Tanks } from '../protos';
import { asset } from './asset';

export function fetchTanks() {
  return fetchPB(asset('definitions/tanks.pb'), Tanks);
}
