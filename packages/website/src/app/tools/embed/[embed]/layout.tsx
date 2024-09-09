import { useMemo } from 'react';
import { configurations } from '../../../../constants/embeds';
import * as EmbedState from '../../../../stores/embedState';
import { extractEmbedConfigDefaults } from '../utilities';

export function generateStaticParams() {
  return Object.keys(configurations).map((embed) => ({ embed }));
}

export default function Layout({
  params,
  children,
}: {
  params: { embed: keyof typeof configurations };
  children: React.ReactNode;
}) {
  const config = configurations[params.embed];
  const initialState = useMemo(
    () => extractEmbedConfigDefaults(config),
    [params.embed],
  );

  return (
    <EmbedState.Provider data={initialState}>{children}</EmbedState.Provider>
  );
}
