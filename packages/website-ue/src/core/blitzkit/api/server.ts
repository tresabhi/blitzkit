import { fetchMetadata } from '@blitzkit/closed';
import { BlitzkitServerAPI, MetadataAccessor } from '@blitzkit/core';

const metadata = await fetchMetadata();
const accessor = new MetadataAccessor(metadata);
export const api = new BlitzkitServerAPI(accessor);
