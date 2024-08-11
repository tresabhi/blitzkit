import { useMemo } from 'react';
import * as EmbedState from '../../../../stores/embedState';
import { configurations } from '../configurations';
import { extractEmbedConfigDefaults } from '../utilities';

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
