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
import { definitions } from './definitions';
import { equipmentIcons } from './equipmentIcons';
import { moduleIcons } from './moduleIcons';
import { scratchedFlags } from './scratchedFlags';
import { shellIcons } from './shellIcons';
import { tankArmors } from './tankArmors';
import { tankIcons } from './tankIcons';
import { tankModels } from './tankModels';

if (!targets && !allTargets) throw new Error('No target(s) specified');

const methods = [
  tankModels,
  tankArmors,
  definitions,
  tankIcons,
  scratchedFlags,
  circleFlags,
  shellIcons,
  moduleIcons,
  equipmentIcons,
  consumableProvisionIcons,
  camouflageIcons,
  boosterIcons,
];

for (const method of methods) {
  if (allTargets || targets?.includes(method.name)) await method(production);
}
