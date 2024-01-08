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

export const DATA =
  'C:/Program Files (x86)/Steam/steamapps/common/World of Tanks Blitz/Data';
export const DOI = {
  vehicleDefinitions: 'XML/item_defs/vehicles',
  strings: 'Strings',
  tankParameters: '3d/Tanks/Parameters',
  smallIcons: 'Gfx/UI/BattleScreenHUD/SmallTankIcons',
  bigIcons: 'Gfx/UI/BigTankIcons',
  flags: 'Gfx/Lobby/flags',
  '3d': '3d',
  bigShellIcons: 'Gfx/Shared/tank-supply/ammunition/big',
  moduleIcons: 'Gfx/UI/ModulesTechTree',
  collisionMeshes: '3d/Tanks/CollisionMeshes',
} as const;

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
