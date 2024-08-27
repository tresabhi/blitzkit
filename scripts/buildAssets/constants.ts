import { readdir } from 'fs/promises';
import { argv } from 'process';

const isDepot = argv.includes('--depot');

export const WOTB_WIN32_DEPOT = 444202;

export const DATA = isDepot
  ? await (async () => {
      const [installationVersion] = await readdir(`depots/${WOTB_WIN32_DEPOT}`);
      return `depots/${WOTB_WIN32_DEPOT}/${installationVersion}/Data`;
    })()
  : 'C:/Program Files (x86)/Steam/steamapps/common/World of Tanks Blitz/Data';
