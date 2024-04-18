import { ReactNode } from 'react';
import { tankDefinitions } from '../../../../core/blitzkrieg/tankDefinitions';
import { tankIcon } from '../../../../core/blitzkrieg/tankIcon';

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

  return (
    <>
      <title>{tank.name}</title>
      <meta
        name="description"
        content={`Statistics, armor profiles, equipment, and more about ${tank.name}`}
      />
      <meta property="og:title" content={tank.name} />
      <meta property="og:image" content={tankIcon(id)} />

      {children}
    </>
  );
}
