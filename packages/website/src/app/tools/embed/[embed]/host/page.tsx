'use client';

import { Code, Heading } from '@radix-ui/themes';
import { useMemo } from 'react';
import { PageWrapper } from '../../../../../components/PageWrapper';
import * as EmbedState from '../../../../../stores/embedState';
import { configurations } from '../../configurations';
import { extractEmbedConfigDefaults } from '../../utilities';

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
  const config = configurations[params.embed];
  const initialState = useMemo(
    () => ({
      ...extractEmbedConfigDefaults(config),
      ...(JSON.parse(searchParams.state) as EmbedState.EmbedState),
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
