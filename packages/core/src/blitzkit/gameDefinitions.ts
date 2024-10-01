import { GameDefinitions } from '../protos';
import { fetchPB } from '../types';
import { asset } from './asset';

export function fetchGameDefinitions() {
  return fetchPB(asset('definitions/game.pb'), GameDefinitions);
}
