import { writeFile } from 'fs/promises';
import { tankDefinitions } from '../src/core/blitzkrieg/tankDefinitions';

console.log('Building sitemap...');

const awaitedTankDefinitions = await tankDefinitions;
const values = Object.values(awaitedTankDefinitions);
const sitemap = values
  .map((tank) => `https://blitz-krieg.vercel.app/tools/tankopedia/${tank.id}`)
  .join('\n');

await writeFile('public/sitemap.txt', sitemap);

console.log(`Built sitemap for ${values.length} tanks`);
