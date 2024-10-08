import { asset } from './asset';
import { fetchCdonLz4 } from './fetchCdonLz4';

interface GameMode {
  name: string;
}

export interface GameDefinitions {
  version: string;
  nations: string[];
  gameModes: Record<number, GameMode>;
  roles: Record<
    number,
    {
      provisions: number[];
      consumables: number[];
    }
  >;
}

export const gameDefinitions = fetchCdonLz4<GameDefinitions>(
  asset('definitions/game.cdon.lz4'),
);
