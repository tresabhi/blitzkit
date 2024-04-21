import { asset } from './asset';

export const videoDefinitions = fetch(asset('definitions/videos.csv'))
  .then((response) => response.text())
  .then((text) =>
    text
      .split('\n')
      .map((line) => {
        const [idString, ...videos] = line.split(',');
        const id = Number(idString);
        return { id, videos };
      })
      .filter(({ videos }) => videos.length > 0)
      .reduce<Record<number, string[]>>((accumulator, { id, videos }) => {
        accumulator[id] = videos;
        return accumulator;
      }, {}),
  );
