import type { MetadataAccessor } from 'packages/core/src';
import { remoteMetadata } from './metadata.remote';
import { socketMetadata } from './metadata.socket';

let accessor: MetadataAccessor;

if (import.meta.env.SSR) {
  accessor = socketMetadata;
} else {
  accessor = remoteMetadata;
}

export const metadata = accessor;
