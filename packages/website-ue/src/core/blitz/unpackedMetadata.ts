import { requestAutoProxyClient, unpackMetadata } from '@blitzkit/closed';
import type { GetPackedMetadataAsyncResponse } from '@blitzkit/closed/src/unreal/protos/auto_legacy_proxy_client';
import { UnpackedMetadataAccessor } from 'packages/core/src';

export const unpackedMetadata = new UnpackedMetadataAccessor(
  await requestAutoProxyClient<GetPackedMetadataAsyncResponse>(
    'GetPackedMetadataAsyncRequest',
  ).then(unpackMetadata),
);
