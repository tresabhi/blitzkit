import { CatalogItem } from '@protos/blitz_items';
import { CatalogItemsComponent } from '@protos/blitz_static_catalog_items_group_component';
import { BlitzkitAllTanksComponent } from '@protos/blitzkit_static_all_tanks_component';
import { BlitzKitTankCatalogComponent } from '@protos/blitzkit_static_tank_component';
import { CatalogItemAccessor } from './catalogItemAccessor';

export class CatalogAccessor {
  items: Record<string, CatalogItemAccessor> = {};

  constructor(catalogItems: CatalogItem[]) {
    for (const item of catalogItems) {
      if (item.catalog_id in this.items) {
        throw new Error(`Duplicate catalog ID: ${item.catalog_id}`);
      }

      this.items[item.catalog_id] = new CatalogItemAccessor(item);
    }
  }

  get(item: string) {
    if (item in this.items) return this.items[item];
    throw new Error(`Unknown catalog ID: ${item}`);
  }

  add(item: CatalogItemAccessor) {
    this.items[item.id] = item;
    return this;
  }

  getAllTanks() {
    return this.get('CatalogItemsGroupEntity.all_tanks').get(
      CatalogItemsComponent,
      'catalogItemsGroupComponent',
    );
  }

  injectBlitzkit() {
    this.injectBlitzKitTankComponents();
    this.injectBlitzKitAllTanksEntity();

    return this;
  }

  injectBlitzKitTankComponents() {
    for (const item of this.getAllTanks().catalog_items) {
      const tank = this.get(item);
      const value = BlitzKitTankCatalogComponent.encode({
        id: 'TEST',
        set: 'TEST',
      }).finish();

      tank.addComponent('blitzkitTankCatalogComponent', {
        type_url:
          './blitzkit_static_tank_component.BlitzKitTankCatalogComponent',
        value,
      });
    }
  }

  injectBlitzKitAllTanksEntity() {
    const allTanksEntities: BlitzkitAllTanksComponent = { tanks: [] };

    for (const item of this.getAllTanks().catalog_items) {
      allTanksEntities.tanks.push(this.get(item).pack());
    }

    this.add(
      CatalogItemAccessor.fromComponent(
        'BlitzKitAllTanksEntity.blitzkit_all_tanks',
        {
          type_url:
            './blitzkit_static_all_tanks_component.BlitzkitAllTanksComponent',
          value: BlitzkitAllTanksComponent.encode(allTanksEntities).finish(),
        },
      ),
    );
  }
}

export class RemoteCatalogAccessor {
  constructor(private base: string) {}

  async get(item: string) {
    const response = await fetch(`${this.base}/${item}.pb`);

    if (!response.ok) throw new Error(`Unknown catalog ID: ${item}`);

    const buffer = await response.arrayBuffer();
    const catalogItem = CatalogItem.decode(new Uint8Array(buffer));

    return new CatalogItemAccessor(catalogItem);
  }
}
