import { RemoteMetadataAccessor } from 'packages/core/src';

export const remoteMetadata = new RemoteMetadataAccessor(
  '/api/metadata/catalog',
);
