import { ConsumableEntry, ProvisionEntry } from '@blitzkit/core';
import { GunDefinition, TankDefinition } from './tankDefinitions';

export function checkConsumableProvisionInclusivity(
  consumableProvision: ConsumableEntry | ProvisionEntry,
  tank: TankDefinition,
  gun: GunDefinition,
) {
  const included =
    !consumableProvision.gameMode &&
    consumableProvision.include?.every((rule) => {
      switch (rule.type) {
        case 'tier':
          return rule.min <= tank.tier && tank.tier <= rule.max;

        case 'ids':
          return rule.ids.includes(tank.id);

        case 'nation':
          return rule.nations.includes(tank.nation);

        case 'category':
          throw new SyntaxError('Category filtering found in include rule');
      }
    });
  const excluded =
    consumableProvision.gameMode ||
    consumableProvision.exclude?.some((rule) => {
      switch (rule.type) {
        case 'tier':
          return rule.min <= tank.tier && tank.tier <= rule.max;

        case 'ids':
          return rule.ids.includes(tank.id);

        case 'nation':
          return rule.nations.includes(tank.nation);

        case 'category':
          return rule.categories.some((category) => {
            switch (category) {
              case 'clip':
                return gun.type !== 'regular';
            }
          });
      }
    });

  return (
    !consumableProvision.gameMode &&
    consumableProvision.include?.length > 0 &&
    included &&
    !excluded
  );
}
