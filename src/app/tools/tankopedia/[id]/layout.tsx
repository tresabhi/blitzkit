import { ReactNode } from 'react';
import { provisionDefinitions } from '../../../../core/blitzkit/provisionDefinitions';
import { tankDefinitions } from '../../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../core/blitzkit/tankDefinitions/constants';
import { tankIcon } from '../../../../core/blitzkit/tankIcon';
import strings from '../../../../lang/en-US.json';
import * as Duel from '../../../../stores/duel';
import * as TankFilters from '../../../../stores/tankFilters';

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: { id: string };
}) {
  const id = Number(params.id);
  const awaitedTankDefinitions = await tankDefinitions;
  const awaitedProvisionDefinitions = await provisionDefinitions;
  const tank = awaitedTankDefinitions[id];
  const title = `${tank.name} - Tier ${TIER_ROMAN_NUMERALS[tank.tier]} ${
    (strings.common.nations_adjectives as Record<string, string>)[tank.nation]
  } ${strings.common.tank_class_short[tank.class]}`;
  const description = `Statistics, armor, and equipment for ${tank.name}`;

  return (
    <TankFilters.Provider>
      <Duel.Provider
        data={{
          tank: awaitedTankDefinitions[id],
          provisionDefinitions: awaitedProvisionDefinitions,
        }}
      >
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:image" content={tankIcon(id)} />
        <meta property="og:description" content={description} />

        {children}
      </Duel.Provider>
    </TankFilters.Provider>
  );
}
