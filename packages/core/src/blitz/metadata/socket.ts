import { CatalogItem } from '@protos/blitz_items';
import { Metadata } from '@protos/blitz_metadata';
import { CatalogItemAccessor } from '../catalogItemAccessor';
import { MetadataAccessor } from './abstract';

export class SocketMetadataAccessor extends MetadataAccessor {
  items: Record<string, CatalogItem> = {};

  constructor(metadata: Metadata) {
    super();

    for (const item of metadata.catalog_items) {
      this.items[item.catalog_id] = item;
    }
  }

  async get(item: string) {
    if (item in this.items) return new CatalogItemAccessor(this.items[item]);

    throw new Error(`Item ${item} does not exist in socket metadata`);
  }

  add(item: CatalogItemAccessor) {
    this.items[item.id] = item.pack();
  }

  filter(predicate: (item: string) => boolean) {
    const items: CatalogItemAccessor[] = [];

    for (const item in this.items) {
      if (predicate(item)) {
        items.push(new CatalogItemAccessor(this.items[item]));
      }
    }

    return items;
  }
}
