import { config } from 'dotenv';
import { argv } from 'process';

config();

const allTargets = argv.includes('--all-targets');
const targets = argv
  .find((argument) => argument.startsWith('--target'))
  ?.split('=')[1]
  .split(',');
const production = argv.includes('--production');

import { boosterIcons } from './boosterIcons';
import { camouflageIcons } from './camouflageIcons';
import { circleFlags } from './circleFlags';
import { consumableProvisionIcons } from './consumableProvisionIcons';
import { currencies } from './currencies';
import { definitions } from './definitions';
import { equipmentIcons } from './equipmentIcons';
import { moduleIcons } from './moduleIcons';
import { scratchedFlags } from './scratchedFlags';
import { shellIcons } from './shellIcons';
import { skillIcons } from './skillIcons';
import { tankArmors } from './tankArmors';
import { tankIcons } from './tankIcons';
import { tankModels } from './tankModels';
import { videos } from './videos';

if (!targets && !allTargets) throw new Error('No target(s) specified');

const methods = [
  definitions,
  videos,
  scratchedFlags,
  currencies,
  skillIcons,
  circleFlags,
  shellIcons,
  moduleIcons,
  equipmentIcons,
  consumableProvisionIcons,
  camouflageIcons,
  boosterIcons,
  // tankIcons,
  tankModels,
  tankArmors,
];

for (const method of methods) {
  if (allTargets || targets?.includes(method.name)) await method(production);
}
