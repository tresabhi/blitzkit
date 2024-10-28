import { compositeStatsKeys, fetchTankDefinitions } from '@blitzkit/core';
import strings from '@blitzkit/core/lang/en-US.json';
import { breakdownConfig } from '../../constants/embeds';
import { useEmbedStateCurry } from '../../stores/embedState/utilities';
import { BreakdownEmbedCard, BreakdownEmbedWrapper } from '../TanksEmbed';

export const compositeStatsKeysOptions = compositeStatsKeys.map((value) => ({
  label: strings.common.composite_stats[value],
  value,
}));

const tanks = await fetchTankDefinitions().then((tanks) =>
  Object.values(tanks.tanks),
);

export function BreakdownPreview() {
  const { useState } = useEmbedStateCurry<typeof breakdownConfig>();

  return (
    <BreakdownEmbedWrapper>
      {useState('showTotal') && <BreakdownEmbedCard tank={null} />}

      {tanks.slice(0, useState('listMaxTanks')).map((tank) => (
        <BreakdownEmbedCard key={tank.id} tank={tank} />
      ))}
    </BreakdownEmbedWrapper>
  );
}

export function BreakdownRenderer() {
  const { useState } = useEmbedStateCurry<typeof breakdownConfig>();

  return useState('cardBodyBackgroundColor');
}
