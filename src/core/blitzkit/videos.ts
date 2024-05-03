import { asset } from './asset';

export interface VideoDefinitions {
  [id: number]: {
    videos: string[];
    lastUpdated: number;
  };
}

export const videoDefinitions = fetch(asset('definitions/videos.csv'))
  .then((response) => response.text())
  .then((text) =>
    text
      .split('\n')
      .map((line) => {
        const [idString, lastUpdatedString, ...videos] = line
          .split(',')
          .filter(Boolean);
        const id = Number(idString);
        const lastUpdated = Number(lastUpdatedString);
        return { id, videos, lastUpdated };
      })
      .filter(({ videos }) => videos.length > 0)
      .reduce<VideoDefinitions>((accumulator, { id, videos, lastUpdated }) => {
        accumulator[id] = {
          videos,
          lastUpdated,
        };

        return accumulator;
      }, {}),
  );
