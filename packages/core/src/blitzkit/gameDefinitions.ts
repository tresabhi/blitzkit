import { fetchPB } from '../protobuf';
import { GameDefinitions } from '../protos';
import { asset } from './asset';

export function fetchGameDefinitions() {
  return fetchPB(asset('definitions/game.pb'), GameDefinitions);
}
