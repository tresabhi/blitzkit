import type { MetadataAccessor } from 'packages/core/src';

let accessor: MetadataAccessor;

if (import.meta.env.SSR) {
  accessor = await import('./metadata.socket').then((m) => m.socketMetadata);
} else {
  accessor = await import('./metadata.remote').then((m) => m.remoteMetadata);
}

export const metadata = accessor;
