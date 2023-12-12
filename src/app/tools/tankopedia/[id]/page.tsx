'use client';

import { Button, Flex, Heading } from '@radix-ui/themes';
import { use, useEffect, useState } from 'react';
import { Flag } from '../../../../components/Flag';
import PageWrapper from '../../../../components/PageWrapper';
import { gunDefinitions } from '../../../../core/blitzkrieg/definitions/guns';
import { shellDefinitions } from '../../../../core/blitzkrieg/definitions/shells';
import { tankDefinitions } from '../../../../core/blitzkrieg/definitions/tanks';
import { turretDefinitions } from '../../../../core/blitzkrieg/definitions/turrets';

const SIZE = 0.05;

export default function Page({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const awaitedTankDefinitions = use(tankDefinitions);
  const awaitedTurretDefinitions = use(turretDefinitions);
  const awaitedGunDefinitions = use(gunDefinitions);
  const awaitedShellDefinitions = use(shellDefinitions);
  const tank = awaitedTankDefinitions[id];
  const [turret, setTurret] = useState(
    awaitedTurretDefinitions[tank.turrets[0]],
  );
  const [gun, setGun] = useState(awaitedGunDefinitions[turret.guns[0]]);
  const [shell, setShell] = useState(awaitedShellDefinitions[gun.shells[0]]);

  useEffect(() => setGun(awaitedGunDefinitions[turret.guns[0]]), [turret]);
  useEffect(() => setShell(awaitedShellDefinitions[gun.shells[0]]), [gun]);

  return (
    <PageWrapper>
      <Flex gap="2" align="center">
        <Flag nation={tank.nation} />
        <Heading>{tank.name}</Heading>
      </Flex>

      <Flex gap="2" align="center">
        <Heading size="5">Turrets</Heading>

        {tank.turrets.map((turretId) => (
          <Button
            onClick={() => setTurret(awaitedTurretDefinitions[turretId])}
            variant={turret.id === turretId ? 'solid' : 'soft'}
          >
            {awaitedTurretDefinitions[turretId].name}
          </Button>
        ))}
      </Flex>

      <Flex gap="2" align="center">
        <Heading size="5">Guns</Heading>

        {turret.guns.map((gunId) => (
          <Button
            onClick={() => setGun(awaitedGunDefinitions[gunId])}
            variant={gun.id === gunId ? 'solid' : 'soft'}
          >
            {awaitedTurretDefinitions[gunId]?.name ?? gunId}
          </Button>
        ))}
      </Flex>

      <Flex gap="2" align="center">
        <Heading size="5">Shells</Heading>

        {gun.shells.map((shellId) => (
          <Button
            onClick={() => setShell(awaitedShellDefinitions[shellId])}
            variant={shell.id === shellId ? 'solid' : 'soft'}
          >
            {awaitedShellDefinitions[shellId].name}
          </Button>
        ))}
      </Flex>
    </PageWrapper>
  );
}
