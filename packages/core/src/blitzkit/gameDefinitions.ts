import { GameDefinitions } from '../protos';
import { asset } from './asset';

export async function fetchGameDefinitions() {
  const response = await fetch(asset('definitions/game.pb'));
  const buffer = await response.arrayBuffer();
  const array = new Uint8Array(buffer);

  return GameDefinitions.deserializeBinary(array).toObject();
}
