import {
  Consumable,
  ConsumableTankCategoryFilterCategory,
  GunDefinition,
  Provision,
  TankDefinition,
} from '../protos';

export function checkConsumableProvisionInclusivity(
  consumableProvision: Consumable | Provision,
  tank: TankDefinition,
  gun: GunDefinition,
) {
  const included =
    !consumableProvision.gameModeExclusive &&
    consumableProvision.include?.every((rule) => {
      switch (rule.filterType!.$case) {
        case 'tiers':
          return (
            rule.filterType!.value.min <= tank.tier &&
            tank.tier <= rule.filterType!.value.max
          );

        case 'ids':
          return rule.filterType!.value.ids.includes(tank.id);

        case 'nations':
          return rule.filterType!.value.nations.includes(tank.nation);

        case 'categories':
          throw new SyntaxError('Category filtering found in include rule');
      }
    });
  const excluded =
    consumableProvision.gameModeExclusive ||
    consumableProvision.exclude?.some((rule) => {
      switch (rule.filterType!.$case) {
        case 'tiers':
          return (
            rule.filterType!.value.min <= tank.tier &&
            tank.tier <= rule.filterType!.value.max
          );

        case 'ids':
          return rule.filterType!.value.ids.includes(tank.id);

        case 'nations':
          return rule.filterType!.value.nations.includes(tank.nation);

        case 'categories':
          return rule.filterType!.value.categories.some((category) => {
            switch (category) {
              case ConsumableTankCategoryFilterCategory.CLIP:
                return gun.gunType!.$case !== 'regular';
            }
          });
      }
    });

  return (
    !consumableProvision.gameModeExclusive &&
    consumableProvision.include?.length > 0 &&
    included &&
    !excluded
  );
}
