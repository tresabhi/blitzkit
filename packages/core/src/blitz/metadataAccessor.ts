import { CatalogItem } from '@protos/blitz_items';
import { Metadata } from '@protos/blitz_metadata';
import { CatalogItemsComponent } from '@protos/blitz_static_catalog_items_group_component';
import { BlitzKitAllTankEntities } from '@protos/blitzkit_static_all_tank_entities';
import { BlitzKitTankCatalogComponent } from '@protos/blitzkit_static_tank_component';
import { CatalogItemAccessor } from './catalogItemAccessor';

export class UnpackedMetadataAccessor {
  private items: Record<string, CatalogItemAccessor> = {};

  constructor(metadata: Metadata) {
    for (const item of metadata.catalog_items) {
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

  addCatalogItem(item: CatalogItemAccessor) {
    this.items[item.id] = item;
    return this;
  }

  addCatalogItemWithComponent(
    catalogId: string,
    componentId: string,
    url: string,
    value: Uint8Array,
  ) {
    this.addCatalogItem(
      new CatalogItemAccessor({
        catalog_id: catalogId,
        components: [],
      }).addComponent(componentId, { type_url: url, value }),
    );
  }

  getAllTanks() {
    return this.get('CatalogItemsGroupEntity.all_tanks').get(
      CatalogItemsComponent,
      'catalogItemsGroupComponent',
    );
  }

  injectBlitzkit() {
    this.injectBlitzKitTankComponents();
    this.injectBlitzKitAllTankEntities();

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

  injectBlitzKitAllTankEntities() {
    const allTanksEntities: BlitzKitAllTankEntities = { tanks: [] };

    for (const item of this.getAllTanks().catalog_items) {
      allTanksEntities.tanks.push(this.get(item).pack());
    }

    this.addCatalogItemWithComponent(
      'BlitzKitAllTankEntities.all_tanks',
      'blitzkitAllTankEntitiesComponent',
      './blitzkit_static_all_tank_entities.BlitzKitAllTankEntities',
      BlitzKitAllTankEntities.encode(allTanksEntities).finish(),
    );
  }
}

export class DiscreteMetadataAccessor {
  constructor(private base: string) {}

  async get(item: string) {
    const response = await fetch(`${this.base}/${item}.pb`);

    if (!response.ok) throw new Error(`Unknown catalog ID: ${item}`);

    const buffer = await response.arrayBuffer();
    const catalogItem = CatalogItem.decode(new Uint8Array(buffer));

    return new CatalogItemAccessor(catalogItem);
  }
}
