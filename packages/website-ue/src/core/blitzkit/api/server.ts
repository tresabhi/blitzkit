import { fetchMetadata } from '@blitzkit/closed';
import {
  assertSecret,
  BlitzkitServerAPI,
  MetadataAccessor,
} from '@blitzkit/core';

const metadata = await fetchMetadata(
  assertSecret(import.meta.env.AUTO_PROXY_ORIGIN),
);
const accessor = new MetadataAccessor(metadata);
export const api = new BlitzkitServerAPI(accessor);
