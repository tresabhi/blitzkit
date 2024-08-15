import { asset } from './asset';
import { fetchCdonLz4 } from './fetchCdonLz4';

interface GameMode {
  name: string;
  description: string;
}

export interface GameDefinitions {
  version: string;
  nations: string[];
  gameModes: Record<string, GameMode>;
}

export const gameDefinitions = fetchCdonLz4<GameDefinitions>(
  asset('definitions/game.cdon.lz4'),
);
