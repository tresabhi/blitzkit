import { CatalogItem } from '@protos/blitz_items';
import { Metadata } from '@protos/blitz_metadata';
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
