import { asset, fetchCdonLz4 } from '@blitzkit/core';

export type CamouflageDefinitions = Record<
  number,
  {
    id: number;
    name: string;
    tankName?: string;
    tankNameFull?: string;
  }
>;

export const camouflageDefinitions = fetchCdonLz4<CamouflageDefinitions>(
  asset('definitions/camouflages.cdon.lz4'),
);
