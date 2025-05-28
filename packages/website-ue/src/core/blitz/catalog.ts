import { fetchMetadata } from '@blitzkit/closed';
import { CatalogAccessor } from 'packages/core/src';

export const catalog = new CatalogAccessor(
  await fetchMetadata().then((data) => data.catalog_items),
).injectBlitzkit();
