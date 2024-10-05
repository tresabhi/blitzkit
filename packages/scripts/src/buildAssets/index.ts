import { config } from 'dotenv';
import { argv } from 'process';

config();

const allTargets = argv.includes('--all-targets');
const targets = argv
  .find((argument) => argument.startsWith('--target'))
  ?.split('=')[1]
  .split(',');

import { boosterIcons } from './boosterIcons';
import { camouflageIcons } from './camouflageIcons';
import { consumableProvisionIcons } from './consumableProvisionIcons';
import { currencies } from './currencies';
import { definitions } from './definitions';
import { equipmentIcons } from './equipmentIcons';
import { flags } from './flags';
import { gameModeBanners } from './gameModeBanners';
import { moduleIcons } from './moduleIcons';
import { shellIcons } from './shellIcons';
import { skillIcons } from './skillIcons';
import { tankArmors } from './tankArmors';
import { tankIcons } from './tankIcons';
import { tankModels } from './tankModels';

if (!targets && !allTargets) throw new Error('No target(s) specified');

const methods = [
  tankModels,
  tankArmors,
  gameModeBanners,
  definitions,
  tankIcons,
  currencies,
  skillIcons,
  flags,
  shellIcons,
  moduleIcons,
  equipmentIcons,
  consumableProvisionIcons,
  camouflageIcons,
  boosterIcons,
];

for (const method of methods) {
  if (allTargets || targets?.includes(method.name)) {
    try {
      await method();
    } catch (error) {
      console.warn(`Failed method ${method.name}; skipping...`, error);
    }
  }
}
