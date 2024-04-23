import { mkdir, writeFile } from 'fs/promises';
import { parse as parsePath } from 'path';
import { parse as parseYaml } from 'yaml';
import { readStringDVPL } from '../src/core/blitz/readStringDVPL';
import { writeDVPL } from '../src/core/blitz/writeDVPL';
import { secrets } from '../src/core/blitzkit/secrets';
import { dvp } from '../submodules/closedkrieg/src/dvp';
import { DATA } from './buildAssets/constants';

const versionTextFile = await readStringDVPL(`${DATA}/version.txt.dvpl`);
const currentVersion = versionTextFile
  .split(' ')[0]
  .split('.')
  .slice(0, 3)
  .join('.');

console.log(`Installing patches for ${currentVersion}...`);

let patchIndex = 1;
while (true) {
  const response = await fetch(
    `${secrets.WOTB_DLC_CDN}/dlc/s${currentVersion}_${patchIndex}.yaml`,
  );

  if (response.status === 200) {
    console.log(`Applying patch ${patchIndex}...`);

    const data = parseYaml(await response.text());
    const dvpm = await fetch(`${secrets.WOTB_DLC_CDN}/dlc/${data.dx11}`).then(
      (response) => response.arrayBuffer(),
    );
    const dvpd = await fetch(
      `${secrets.WOTB_DLC_CDN}/dlc/${data.dx11.replace('.dvpm', '.dvpd')}`,
    ).then((response) => response.arrayBuffer());
    const files = await dvp(dvpm, dvpd);

    await Promise.all(
      files.map(async ({ path, data }) => {
        const { dir } = parsePath(path);

        await mkdir(`${DATA}/${dir}`, { recursive: true });
        await writeFile(`${DATA}/${path}.dvpl`, writeDVPL(Buffer.from(data)));
      }),
    );

    patchIndex++;
  } else break;
}
