import { fetchMetadata } from '@blitzkit/closed';
import { SocketMetadataAccessor } from 'packages/core/src';

export const socketMetadata = new SocketMetadataAccessor(
  await fetchMetadata(),
).injectBlitzkit();
