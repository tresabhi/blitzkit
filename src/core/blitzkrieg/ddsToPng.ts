import { execFile } from 'child_process';
import { existsSync } from 'fs';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { uniqueId } from 'lodash';
import { promisify } from 'util';

export async function clearDdsToPng() {
  await rm('temp/ddsToPng/images', { force: true, recursive: true });
}

const execFilePromise = promisify(execFile);
let downloadStatus: Promise<void> | undefined = undefined;

export async function ddsToPng(ddsBuffer: Buffer) {
  const id = uniqueId();
  await mkdir('temp/ddsToPng/images', { recursive: true });

  if (
    !existsSync('temp/ddsToPng/texconv.exe') &&
    downloadStatus === undefined
  ) {
    console.log('texconv.exe not found, downloading...');

    downloadStatus = new Promise<void>(async (resolve, reject) => {
      const releaseResponse = await fetch(
        'https://api.github.com/repos/microsoft/DirectXTex/releases/latest',
      );
      const releaseData = (await releaseResponse.json()) as {
        assets: { browser_download_url: string; name: string }[];
      };
      const asset = releaseData.assets.find(
        (asset) => asset.name === 'texconv.exe',
      );

      if (!asset) throw new Error('Could not find texconv.exe');

      const downloadResponse = await fetch(asset.browser_download_url);
      const downloadData = await downloadResponse.arrayBuffer();

      await writeFile(
        'temp/ddsToPng/texconv.exe',
        new Uint8Array(downloadData),
      );

      resolve();
    });
  }

  await downloadStatus;

  return new Promise<Buffer>(async (resolve, reject) => {
    await writeFile(`temp/ddsToPng/images/${id}.dds`, ddsBuffer);
    await execFilePromise('temp/ddsToPng/texconv.exe', [
      '-ft',
      'png',
      '-o',
      'temp/ddsToPng/images',
      `temp/ddsToPng/images/${id}.dds`,
    ]);

    const pngBuffer = await readFile(`temp/ddsToPng/images/${id}.png`);

    resolve(pngBuffer);
    rm(`temp/ddsToPng/images/${id}.dds`);
    // rm(`temp/ddsToPng/images/${id}.png`);
  });
}
