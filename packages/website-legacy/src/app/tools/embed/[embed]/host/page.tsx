'use client';

import { Code, Heading } from '@radix-ui/themes';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { PageWrapper } from '../../../../../components/PageWrapper';
import {
  configurations,
  extractEmbedConfigDefaults,
} from '../../../../../constants/embeds';
import * as EmbedState from '../../../../../stores/embedState';

export interface EmbedPreviewControllerProps {
  configKey: string;
}

export default function Page({
  params,
}: {
  params: { embed: keyof typeof configurations };
}) {
  const searchParams = useSearchParams();
  // TODO: check for this? idk lol
  const stateParam = searchParams.get('state')!;
  const config = configurations[params.embed];
  const initialState = useMemo(
    () => ({
      ...extractEmbedConfigDefaults(config),
      ...(JSON.parse(stateParam) as EmbedState.EmbedState),
    }),
    [params.embed],
  );

  return (
    <EmbedState.Provider data={initialState}>
      <PageWrapper>
        <Heading>
          <Code>{params.embed}</Code>
        </Heading>

        <Code color="gray">
          <pre>{JSON.stringify(initialState, null, 2)}</pre>
        </Code>
      </PageWrapper>
    </EmbedState.Provider>
  );
}
