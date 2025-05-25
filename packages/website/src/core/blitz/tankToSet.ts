import type { TankSetCatalogComponent } from '@protos/blitz_static_tank_set_component';
import type { MetadataAccessor } from 'submodules/blitzkit-closed/src';

export async function tankToSet(metadata: MetadataAccessor, tank: string) {
  for (const [id] of metadata.items) {
    if (!id.startsWith('TankSetEntity')) continue;

    const components = await metadata.get(id);
    const set = await components.get<TankSetCatalogComponent>(
      'tankSetCatalogComponent',
    );

    for (const reward of set.tank_set_rewards) {
      if (!reward.tank_set_reward_on_level) continue;

      for (const rewardOnLevel of reward.tank_set_reward_on_level.reward_list) {
        if (!rewardOnLevel.tank_reward) continue;

        if (rewardOnLevel.tank_reward.tank_catalog_id === tank) {
          return set;
        }
      }
    }
  }

  throw new Error(`Tank ${tank} not found in any set`);
}
