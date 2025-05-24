import {
  MetadataAccessor,
  requestAutoProxyClient,
  unpackMetadata,
} from '@blitzkit/closed';
import type { GetPackedMetadataAsyncResponse } from '@blitzkit/closed/src/unreal/protos/auto_legacy_proxy_client';

export const metadata = new MetadataAccessor(
  await requestAutoProxyClient<GetPackedMetadataAsyncResponse>(
    'GetPackedMetadataAsyncRequest',
  ).then((packed) => unpackMetadata(packed)),
);
