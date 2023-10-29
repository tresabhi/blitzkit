import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Region } from '../constants/regions';

export type RatingsType = 'neighbors' | 'league';

interface Ratings {
  type: RatingsType;
  /**
   * When null, the current season is used unless there ain't one in which case
   * we do whatever lol
   */
  season: number | null;
  region: Region;
  league: number;
}

export const useRatings = create<Ratings>()(
  devtools(
    persist(
      (set) => ({
        type: 'league',
        season: null,
        league: 0,
        region: 'com',
      }),
      {
        name: 'ratings',
      },
    ),
  ),
);
