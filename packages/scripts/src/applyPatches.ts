import { assertSecret } from '@blitzkit/core';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { parse as parsePath } from 'path';
import ProgressBar from 'progress';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { dvp } from '../../../submodules/blitzkit-closed/src/dvp';
import { readStringDVPL } from '../src/core/blitz/readStringDVPL';
import { DATA } from './buildAssets/constants';
import { readYAMLDVPL } from './core/blitz/readYAMLDVPL';
import { writeDVPL } from './core/blitz/writeDVPL';

const versionTextFile = await readStringDVPL(`${DATA}/version.txt`);
const currentVersion = versionTextFile
  .split(' ')[0]
  .split('.')
  .slice(0, 3)
  .join('.');

console.log(`Installing patches for ${currentVersion}...`);

let patchIndex = 1;
while (true) {
  const response = await fetch(
    `${assertSecret(
      import.meta.env.WOTB_DLC_CDN,
    )}/dlc/s${currentVersion}_${patchIndex}.yaml`,
  );

  if (response.status === 200) {
    console.log(`Applying patch ${patchIndex}...`);

    const data = parseYaml(await response.text());
    const dvpm = await fetch(
      `${assertSecret(import.meta.env.WOTB_DLC_CDN)}/dlc/${data.dx11}`,
    ).then((response) => response.arrayBuffer());
    const dvpd = await fetch(
      `${assertSecret(import.meta.env.WOTB_DLC_CDN)}/dlc/${data.dx11.replace(
        '.dvpm',
        '.dvpd',
      )}`,
    ).then((response) => response.arrayBuffer());
    const files = await dvp(dvpm, dvpd);
    const bar = new ProgressBar(
      `Patching ${files.length} files :bar`,
      files.length,
    );

    await Promise.all(
      files.map(async ({ path, data }) => {
        const { dir } = parsePath(path);
        const dirPath = `${DATA}/${dir}`;

        if (!existsSync(dirPath)) {
          await mkdir(dirPath, { recursive: true });
        }

        await writeFile(
          `${DATA}/${path}`,
          new Uint8Array(writeDVPL(Buffer.from(data))),
        );

        bar.tick();
      }),
    );

    if ('dynamicContentLocalizationsDir' in data) {
      console.log('Found dynamic content localizations; patching...');

      const localizationsResponse = await fetch(
        `${assertSecret(import.meta.env.WOTB_DLC_CDN)}/dlc/${
          data.dynamicContentLocalizationsDir
        }/en.yaml`,
      );
      const newStrings = parseYaml(await localizationsResponse.text());
      const oldStrings = await readYAMLDVPL<Record<string, string>>(
        `${DATA}/Strings/en.yaml`,
      );
      const patchedStrings = { ...oldStrings, ...newStrings };
      const patchedContent = stringifyYaml(patchedStrings);

      await writeFile(
        `${DATA}/Strings/en.yaml`,
        new Uint8Array(writeDVPL(Buffer.from(patchedContent))),
      );
    }

    patchIndex++;
  } else break;
}
