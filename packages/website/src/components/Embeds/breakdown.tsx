import {
  compositeStatsKeys,
  deltaTankStats,
  fetchTankDefinitions,
  getTankStats,
  idToRegion,
  type IndividualTankStats,
} from '@blitzkit/core';
import strings from '@blitzkit/core/lang/en-US.json';
import { useEffect, useMemo, useState } from 'react';
import { breakdownConfig } from '../../constants/embeds';
import { EmbedBreakdownPersistent } from '../../stores/embedBreakdownPersistent';
import { useEmbedStateCurry } from '../../stores/embedState/utilities';
import { BreakdownEmbedCard, BreakdownEmbedWrapper } from '../TanksEmbed';

export const compositeStatsKeysOptions = compositeStatsKeys.map((value) => ({
  label: strings.common.composite_stats[value],
  value,
}));

const tankDefinitions = await fetchTankDefinitions();

export function BreakdownPreview() {
  const tanks = Object.values(tankDefinitions.tanks);
  const { useEmbedState } = useEmbedStateCurry<typeof breakdownConfig>();

  return (
    <BreakdownEmbedWrapper>
      {useEmbedState('showTotal') && <BreakdownEmbedCard tank={null} />}

      {tanks.slice(0, useEmbedState('listMaxTanks')).map((tank) => (
        <BreakdownEmbedCard key={tank.id} tank={tank} />
      ))}
    </BreakdownEmbedWrapper>
  );
}

export function BreakdownRenderer() {
  return (
    <EmbedBreakdownPersistent.Provider>
      <BreakdownRendererContent />
    </EmbedBreakdownPersistent.Provider>
  );
}

function BreakdownRendererContent() {
  const { useEmbedState } = useEmbedStateCurry<typeof breakdownConfig>();
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id'));
  const tankStatsA = EmbedBreakdownPersistent.use((state) => state[id] ?? []);
  const [tankStatsB, setTankStatsB] = useState<IndividualTankStats[]>([]);
  const diff = useMemo(
    () =>
      deltaTankStats(tankStatsA, tankStatsB).sort(
        (a, b) => b.last_battle_time - a.last_battle_time,
      ),
    [tankStatsB],
  );

  useEffect(() => {
    const interval = setInterval(async () => {
      const newB = await getTankStats(idToRegion(id), id);

      if (newB === null) return;

      setTankStatsB(newB);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <BreakdownEmbedWrapper>
      {useEmbedState('showTotal') && <BreakdownEmbedCard tank={null} />}

      {diff.slice(0, useEmbedState('listMaxTanks')).map((diff) => {
        const tank = tankDefinitions.tanks[diff.tank_id];

        return <BreakdownEmbedCard key={tank.id} tank={tank} />;
      })}
    </BreakdownEmbedWrapper>
  );
}
