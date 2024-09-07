import { asset } from '../../../../src/core/blitzkit/asset';
import { fetchCdonLz4 } from '../../../../src/core/blitzkit/fetchCdonLz4';

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
