import { ReactNode } from 'react';
import { tankDefinitions } from '../../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../core/blitzkit/tankDefinitions/constants';
import { tankIcon } from '../../../../core/blitzkit/tankIcon';
import strings from '../../../../lang/en-US.json';

interface TankopediaLayoutProps {
  children: ReactNode;
  params: { id: string };
}

export default async function TankopediaLayout({
  children,
  params,
}: TankopediaLayoutProps) {
  const id = Number(params.id);
  const awaitedTankDefinitions = await tankDefinitions;
  const tank = awaitedTankDefinitions[id];
  const title = `${tank.name} - Tier ${TIER_ROMAN_NUMERALS[tank.tier]} ${
    (strings.common.nations as Record<string, string>)[tank.nation]
  } ${strings.common.tank_class_short[tank.class]}`;
  const description = `Statistics, armor profiles, and equipment for ${tank.name}`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:image" content={tankIcon(id)} />
      <meta property="og:description" content={description} />

      {children}
    </>
  );
}
