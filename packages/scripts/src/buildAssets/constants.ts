import { readdir } from 'fs/promises';
import { argv } from 'process';

const isDepot = argv.includes('--depot');

export const DATA = isDepot
  ? await (async () => {
      const [installationVersion] = await readdir(`../../depots/444202`);
      return `../../depots/444202/${installationVersion}/Data`;
    })()
  : 'C:/Program Files (x86)/Steam/steamapps/common/World of Tanks Blitz/Data';
