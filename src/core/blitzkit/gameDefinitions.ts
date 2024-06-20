import { asset } from './asset';
import { fetchCdonLz4 } from './fetchCdonLz4';

export interface GameDefinitions {
  version: string;
  nations: string[];
}

export const gameDefinitions = fetchCdonLz4<GameDefinitions>(
  asset('definitions/game.cdon.lz4'),
);
