import { RemoteMetadataAccessor } from 'packages/core/src';

export const remoteMetadata = new RemoteMetadataAccessor(
  '/api/internal/catalog',
);
