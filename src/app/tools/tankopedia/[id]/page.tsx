'use client';

import { ArrowLeftIcon } from '@radix-ui/react-icons';
import {
  AspectRatio,
  Button,
  Card,
  Checkbox,
  Flex,
  Heading,
  Inset,
  Select,
  Slider,
  Text,
  Theme,
  Tooltip,
} from '@radix-ui/themes';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { Flag } from '../../../../components/Flag';
import PageWrapper from '../../../../components/PageWrapper';
import { gunDefinitions } from '../../../../core/blitzkrieg/definitions/guns';
import { shellDefinitions } from '../../../../core/blitzkrieg/definitions/shells';
import {
  TIER_ROMAN_NUMERALS,
  tankDefinitions,
} from '../../../../core/blitzkrieg/definitions/tanks';
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
  const [crew, setCrew] = useState(100);

  useEffect(() => setGun(awaitedGunDefinitions[turret.guns[0]]), [turret]);

  return (
    <PageWrapper>
      <Flex gap="8" direction="column">
        <Flex gap="4" direction="column">
          <Flex justify="between" align="center">
            <Link
              href="/tools/tankopedia"
              style={{ color: 'unset', textDecoration: 'none' }}
            >
              <Flex gap="1" align="center">
                <ArrowLeftIcon />
                <Text>Back to tankopedia</Text>
              </Flex>
            </Link>

            <Flex gap="2" align="center">
              <Heading>{tank.name}</Heading>
              <Flag nation={tank.nation} />
            </Flex>
          </Flex>

          <AspectRatio ratio={16 / 9}>
            <Card
              style={{ width: '100%', height: '100%', position: 'relative' }}
            >
              <Inset style={{ height: 'calc(100% + 24px)' }}>
                <Canvas onPointerDown={(event) => event.preventDefault()}>
                  <OrbitControls />

                  <ambientLight />
                  <directionalLight />

                  <mesh>
                    <torusKnotGeometry args={[undefined, undefined, 128, 16]} />
                    <meshStandardMaterial color="red" />
                  </mesh>
                </Canvas>
              </Inset>

              <Flex
                gap="2"
                align="center"
                style={{
                  position: 'absolute',
                  left: 16,
                  bottom: 16,
                }}
              >
                <Checkbox defaultChecked />
                <Text>Enhanced armor</Text>
              </Flex>
            </Card>
          </AspectRatio>

          <Card style={{}}>
            <Flex align="center" justify="between" gap="2">
              <Flex align="center" gap="4">
                <Text>Versus</Text>

                <Select.Root value="1">
                  <Select.Trigger variant="ghost" />

                  <Select.Content>
                    <Select.Item value="1">XM66F</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Flex>

              <Flex gap="2" align="center">
                <Checkbox defaultChecked />
                <Text>Calibrated shells</Text>
              </Flex>

              <Flex gap="1">
                <Button variant="solid" radius="small">
                  <img src="/images/ammo/ap.png" width={24} height={24} />
                </Button>
                <Button variant="soft" radius="small" color="gray">
                  <img src="/images/ammo/hcp.png" width={24} height={24} />
                </Button>
                <Button variant="soft" radius="small" color="gray">
                  <img src="/images/ammo/he.png" width={24} height={24} />
                </Button>
              </Flex>
            </Flex>
          </Card>
        </Flex>

        <Flex gap="6" direction="column">
          <Heading>Build</Heading>

          <Flex gap="2" direction="column">
            <Heading size="5" weight="regular">
              Modules
            </Heading>
            <Theme radius="small">
              <Flex gap="4">
                <Flex gap="1">
                  {tank.turrets.map((turretId) => {
                    const thisTurret = awaitedTurretDefinitions[turretId];

                    return (
                      <Tooltip content={thisTurret.name}>
                        <Button
                          onClick={() => setTurret(thisTurret)}
                          variant={
                            turret.id === thisTurret.id ? 'solid' : 'soft'
                          }
                        >
                          <img
                            src="/images/modules/turret.png"
                            width={32}
                            height={32}
                          />
                          {TIER_ROMAN_NUMERALS[thisTurret.tier]}
                        </Button>
                      </Tooltip>
                    );
                  })}
                </Flex>

                <Flex gap="1">
                  {turret.guns.map((gunId, index) => {
                    const thisGun = awaitedGunDefinitions[gunId];

                    return (
                      <Tooltip content={thisGun.name}>
                        <Button
                          onClick={() => setGun(thisGun)}
                          variant={gun.id === thisGun.id ? 'solid' : 'soft'}
                        >
                          <img
                            src="/images/modules/gun.png"
                            width={32}
                            height={32}
                          />
                          {TIER_ROMAN_NUMERALS[thisGun.tier]}
                        </Button>
                      </Tooltip>
                    );
                  })}
                </Flex>
              </Flex>
            </Theme>
          </Flex>

          <Flex gap="2" direction="column">
            <Heading size="5" weight="regular">
              Crew
            </Heading>

            <Flex gap="4" align="center">
              <Text>{crew}%</Text>

              <Slider
                style={{ flex: 1 }}
                value={[crew]}
                min={50}
                max={100}
                onValueChange={([crew]) => setCrew(crew)}
              />
            </Flex>
          </Flex>
        </Flex>

        <Flex gap="2" direction="column">
          <Heading size="5">Shells</Heading>

          {gun.shells.map((shellId) => {
            const shell = awaitedShellDefinitions[shellId];

            return (
              <Text>
                {shell.name} ({shell.type}): {shell.damage.armor}
              </Text>
            );
          })}
        </Flex>
      </Flex>
    </PageWrapper>
  );
}
