import { fetchPB } from '../protobuf';
import { TankModel } from '../protos';
import { asset } from './asset';

export function fetchTankModel(id: string) {
  return fetchPB(asset(`tanks/${id}/model.pb`), TankModel);
}
