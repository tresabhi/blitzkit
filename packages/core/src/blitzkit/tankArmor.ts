import { fetchPB } from '../protobuf';
import { TankArmor } from '../protos';
import { asset } from './asset';

export function fetchTankArmor(id: string) {
  return fetchPB(asset(`tanks/${id}/armor.pb`), TankArmor);
}
