import { TankCatalogComponent } from '@protos/blitz_static_tank_component';
import { BlitzkitAllTanksComponent } from '@protos/blitzkit_static_all_tanks_component';
import { SocketCatalogAccessor } from 'packages/core/src';
import { remoteCatalog } from 'packages/website-ue/src/core/blitz/remoteCatalog';

const data = await remoteCatalog
  .get('BlitzKitAllTanksEntity.blitzkit_all_tanks')
  .then((components) =>
    components.get(BlitzkitAllTanksComponent, 'blitzkitAllTanksComponent'),
  );

export function Page() {
  const tankCatalog = new SocketCatalogAccessor(data.tanks);

  const content = tankCatalog
    .get('TankEntity.A92_M60')
    .get(TankCatalogComponent, 'tankCatalogComponent');

  return <pre children={JSON.stringify(content, null, 2)} />;
}
