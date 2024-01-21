import { config } from 'dotenv';
import { argv } from 'process';
import { circleFlags } from './circleFlags';
import { buildConsumableIcons } from './consumableIcons';
import { buildDefinitions } from './definitions';
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

if (allTargets || targets?.includes('definitions')) {
  await buildDefinitions(production);
}

if (allTargets || targets?.includes('tankIcons')) {
  await buildTankIcons(production);
}

if (allTargets || targets?.includes('scratchedFlags')) {
  await buildScratchedFlags(production);
}

if (allTargets || targets?.includes('circleFlags')) {
  await circleFlags(production);
}

if (allTargets || targets?.includes('tankModels')) {
  await buildTankModels(production);
}

if (allTargets || targets?.includes('shellIcons')) {
  await buildShellIcons(production);
}

if (allTargets || targets?.includes('moduleIcons')) {
  await buildModuleIcons(production);
}

if (allTargets || targets?.includes('tankArmor')) {
  await buildTankArmors(production);
}

if (allTargets || targets?.includes('equipmentIcons')) {
  await equipmentIcons(production);
}

if (allTargets || targets?.includes('consumableIcons')) {
  await buildConsumableIcons(production);
}
