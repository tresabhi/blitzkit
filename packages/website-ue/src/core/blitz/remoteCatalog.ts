import { RemoteCatalogAccessor } from 'packages/core/src';
import { api } from '../blitzkit/api';

export const remoteCatalog = new RemoteCatalogAccessor(api('catalog'));
