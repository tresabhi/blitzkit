'use client';

import { Code, Text } from '@radix-ui/themes';
import PageWrapper from '../../../../../components/PageWrapper';
import { configurations } from '../../configurations';

export interface EmbedPreviewControllerProps {
  configKey: string;
}

export default function Page({
  params,
  searchParams,
}: {
  params: { embed: keyof typeof configurations };
  searchParams: { state: string };
}) {
  return (
    <PageWrapper>
      <Text>{params.embed}</Text>

      <Text></Text>
      <Code color="gray">
        <pre>{JSON.stringify(JSON.parse(searchParams['state']), null, 2)}</pre>
      </Code>
    </PageWrapper>
  );
}
