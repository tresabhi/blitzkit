import { config } from 'dotenv';
import { argv } from 'process';
import { circleFlags } from './circleFlags';
import { buildDefinitions } from './definitions';
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

if (!targets && !allTargets) throw new Error('No target(s) specified');

if (allTargets || targets?.includes('definitions')) {
  await buildDefinitions();
}

if (
  allTargets ||
  targets?.includes('bigTankIcons') ||
  targets?.includes('smallTankIcons')
) {
  await buildTankIcons(
    allTargets || targets?.includes('bigTankIcons'),
    allTargets || targets?.includes('smallTankIcons'),
  );
}

if (allTargets || targets?.includes('scratchedFlags')) {
  await buildScratchedFlags();
}

if (allTargets || targets?.includes('circleFlags')) {
  await circleFlags();
}

if (allTargets || targets?.includes('tankModels')) {
  await buildTankModels();
}

if (allTargets || targets?.includes('shellIcons')) {
  await buildShellIcons();
}

if (allTargets || targets?.includes('moduleIcons')) {
  await buildModuleIcons();
}

if (allTargets || targets?.includes('tankArmor')) {
  await buildTankArmors();
}
