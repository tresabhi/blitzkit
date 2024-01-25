import { config } from 'dotenv';
import { argv } from 'process';
import { camouflageIcons } from './camouflageIcons';
import { circleFlags } from './circleFlags';
import { consumableProvisionIcons } from './consumableProvisionIcons';
import { definitions } from './definitions';
import { equipmentIcons } from './equipmentIcons';
import { buildModuleIcons } from './moduleIcons';
import { buildScratchedFlags } from './scratchedFlags';
import { buildShellIcons } from './shellIcons';
import { buildTankArmors } from './tankArmors';
import { buildTankIcons } from './tankIcons';
import { buildTankModels } from './tankModels';

config();

const allTargets = argv.includes('--all-targets');
const targets = argv
  .find((argument) => argument.startsWith('--target'))
  ?.split('=')[1]
  .split(',');
const production = argv.includes('--production');

if (!targets && !allTargets) throw new Error('No target(s) specified');

const methods = [
  buildTankModels,
  buildTankArmors,
  definitions,
  buildTankIcons,
  buildScratchedFlags,
  circleFlags,
  buildShellIcons,
  buildModuleIcons,
  equipmentIcons,
  consumableProvisionIcons,
  camouflageIcons,
];

for (const method of methods) {
  if (allTargets || targets?.includes(method.name)) {
    await method(production);
  }
}
