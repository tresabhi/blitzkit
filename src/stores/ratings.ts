import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Region } from '../constants/regions';

interface Ratings {
  /**
   * When null, the current season is used unless there ain't one in which case
   * we do whatever lol
   */
  region: Region;
}

export const useRatings = create<Ratings>()(
  devtools(
    persist(
      (set) => ({
        region: 'com',
      }),
      {
        name: 'ratings',
      },
    ),
  ),
);
