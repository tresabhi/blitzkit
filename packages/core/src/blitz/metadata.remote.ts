import { CatalogItem } from '@protos/blitz_items';
import { CatalogItemAccessor } from './catalogItemAccessor';
import { MetadataAccessor } from './metadata';

export class RemoteMetadataAccessor extends MetadataAccessor {
  constructor(private base: string) {
    super();
  }

  async get(item: string) {
    const response = await fetch(`${this.base}/${item}.pb`);

    if (!response.ok) {
      throw new Error(`Item ${item} does not exist in remote metadata`);
    }

    const buffer = new Uint8Array(await response.arrayBuffer());
    const catalogItem = CatalogItem.decode(buffer);

    return new CatalogItemAccessor(catalogItem);
  }

  add() {
    throw new Error('Cannot add items to remote metadata');
  }

  filter(): CatalogItemAccessor[] {
    throw new Error('Cannot filter remote metadata');
  }
}
