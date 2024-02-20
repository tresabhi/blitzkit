import decompress from 'decompress';
import { existsSync } from 'fs';
import { mkdir, readdir, writeFile } from 'fs/promises';

if (!existsSync('temp')) {
  console.log('Creating temp directory...');
  await mkdir('temp');
}

console.log('Downloading depot downloader...');
await fetch(
  'https://api.github.com/repos/SteamRE/DepotDownloader/releases/latest',
)
  .then(
    (response) =>
      response.json() as Promise<{
        assets: { browser_download_url: string }[];
      }>,
  )
  .then(({ assets }) => fetch(assets[0].browser_download_url))
  .then((response) => response.arrayBuffer())
  .then((arrayBuffer) =>
    writeFile('temp/depotDownloader.zip', Buffer.from(arrayBuffer)),
  );

console.log('Unzipping...');
await decompress('temp/depotDownloader.zip', 'temp/depotDownloader');

console.log(await readdir('temp/depotDownloader'));
