import { ConsumableEntry } from './consumablesDefinitions';
import { GunDefinition, TankDefinition } from './tankDefinitions';

export function checkConsumableInclusivity(
  consumable: ConsumableEntry,
  tank: TankDefinition,
  gun: GunDefinition,
) {
  const included = consumable.include.every((rule) => {
    switch (rule.type) {
      case 'tier':
        return rule.min <= tank.tier && tank.tier <= rule.max;

      case 'ids':
        return rule.ids.includes(tank.id);

      case 'category':
        throw new SyntaxError('Category filtering found in include rule');
    }
  });
  const excluded = consumable.exclude?.some((rule) => {
    switch (rule.type) {
      case 'tier':
        return rule.min <= tank.tier && tank.tier <= rule.max;

      case 'ids':
        return rule.ids.includes(tank.id);

      case 'category':
        return rule.categories.some((category) => {
          switch (category) {
            case 'clip':
              return gun.type !== 'regular';
          }
        });
    }
  });

  return included && !excluded;
}
