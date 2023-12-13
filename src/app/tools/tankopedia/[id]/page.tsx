'use client';

import {
  ArrowLeftIcon,
  CaretRightIcon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons';
import {
  Button,
  Card,
  Checkbox,
  Dialog,
  Flex,
  Heading,
  Separator,
  Slider,
  Tabs,
  Text,
  TextField,
  Theme,
  Tooltip,
} from '@radix-ui/themes';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { go } from 'fuzzysort';
import { debounce } from 'lodash';
import Link from 'next/link';
import { use, useEffect, useRef, useState } from 'react';
import { Flag } from '../../../../components/Flag';
import PageWrapper from '../../../../components/PageWrapper';
import { asset } from '../../../../core/blitzkrieg/asset';
import { gunDefinitions } from '../../../../core/blitzkrieg/definitions/guns';
import { shellDefinitions } from '../../../../core/blitzkrieg/definitions/shells';
import {
  TIER_ROMAN_NUMERALS,
  tankDefinitions,
  tankNamesDiacritics,
  tanksDefinitionsArray,
} from '../../../../core/blitzkrieg/definitions/tanks';
import { turretDefinitions } from '../../../../core/blitzkrieg/definitions/turrets';
import * as styles from '../page.css';

type Mode = 'model' | 'armor';

export default function Page({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const awaitedTankDefinitions = use(tankDefinitions);
  const awaitedTanksDefinitionsArray = use(tanksDefinitionsArray);
  const awaitedTurretDefinitions = use(turretDefinitions);
  const awaitedGunDefinitions = use(gunDefinitions);
  const awaitedShellDefinitions = use(shellDefinitions);
  const awaitedTankNamesDiacritics = use(tankNamesDiacritics);
  const tank = awaitedTankDefinitions[id];
  const [turret, setTurret] = useState(
    awaitedTurretDefinitions[tank.turrets[0]],
  );
  const [gun, setGun] = useState(awaitedGunDefinitions[turret.guns[0]]);
  const [crew, setCrew] = useState(100);
  const [versusTankId, setVersusTankId] = useState(
    awaitedTanksDefinitionsArray[0].id,
  );
  const [mode, setMode] = useState<Mode>('model');
  const versusTankSearchInput = useRef<HTMLInputElement>(null);
  const [versusTankSearchResults, setVersusTankSearchResults] = useState<
    number[]
  >([]);
  const [versusTankTurretId, setVersusTankTurretId] = useState(
    awaitedTurretDefinitions[tank.turrets[0]].id,
  );
  const versusTank = awaitedTankDefinitions[versusTankId];

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
              <Flag nation={tank.nation} />
              <Heading>{tank.name}</Heading>
            </Flex>
          </Flex>

          <Card style={{ position: 'relative' }}>
            <Flex direction="column" gap="2">
              <Tabs.Root
                value={mode}
                onValueChange={(value) => setMode(value as Mode)}
              >
                <Tabs.List>
                  <Tabs.Trigger value="model">Model</Tabs.Trigger>
                  <Tabs.Trigger value="armor">Armor</Tabs.Trigger>
                </Tabs.List>
              </Tabs.Root>

              <div style={{ height: '50vh', maxHeight: 576 }}>
                <Canvas onPointerDown={(event) => event.preventDefault()}>
                  <OrbitControls />

                  <ambientLight />
                  <directionalLight />

                  <mesh>
                    <torusKnotGeometry args={[undefined, undefined, 128, 16]} />
                    <meshStandardMaterial color="cyan" />
                  </mesh>
                </Canvas>
              </div>

              {mode === 'armor' && (
                <Flex gap="2" align="center" className={styles.enhancedArmor}>
                  <Checkbox defaultChecked />
                  <Text>Enhanced armor</Text>
                </Flex>
              )}
            </Flex>
          </Card>

          {mode === 'armor' && (
            <Card>
              <Flex align="center" justify="between" gap="2">
                <Flex align="center" gap="4">
                  <Text>Versus</Text>

                  <Dialog.Root>
                    <Dialog.Trigger>
                      <Button variant="ghost">
                        {awaitedTankDefinitions[versusTankId].name}
                        <CaretRightIcon />
                      </Button>
                    </Dialog.Trigger>

                    <Dialog.Content>
                      <Flex direction="column" gap="6">
                        <Flex direction="column" gap="2">
                          <Heading size="4">Search tank</Heading>

                          <TextField.Root>
                            <TextField.Slot>
                              <MagnifyingGlassIcon />
                            </TextField.Slot>
                            <TextField.Input
                              ref={versusTankSearchInput}
                              placeholder="Search tank..."
                              onChange={debounce(() => {
                                setVersusTankSearchResults(
                                  go(
                                    versusTankSearchInput.current!.value,
                                    awaitedTankNamesDiacritics,
                                    { key: 'combined', limit: 8 },
                                  ).map((item) => item.obj.id),
                                );
                              }, 500)}
                            />
                          </TextField.Root>
                        </Flex>

                        {(versusTankSearchResults.length > 0 ||
                          versusTankSearchInput.current?.value) && (
                          <Flex direction="column" gap="2">
                            {versusTankSearchResults.map((id) => (
                              <Button
                                key={id}
                                variant="ghost"
                                onClick={() => {
                                  setVersusTankId(id);
                                  setVersusTankSearchResults([]);
                                  versusTankSearchInput.current!.value = '';
                                }}
                              >
                                {awaitedTankDefinitions[id].name}
                              </Button>
                            ))}

                            {versusTankSearchResults.length === 0 &&
                              (versusTankSearchInput.current
                                ? versusTankSearchInput.current.value.length > 0
                                : false) && (
                                <Button disabled variant="ghost">
                                  No search results
                                </Button>
                              )}
                          </Flex>
                        )}

                        <Separator style={{ width: '100%' }} />

                        <Flex direction="column" gap="2">
                          <Heading size="4">
                            {awaitedTankDefinitions[versusTankId].name}
                          </Heading>

                          <Flex>
                            {versusTank.turrets.map((id) => (
                              <Button
                                key={id}
                                variant="ghost"
                                onClick={() => setVersusTankTurretId(id)}
                                radius="small"
                                color="gray"
                              >
                                {awaitedTurretDefinitions[id].name}
                              </Button>
                            ))}
                          </Flex>
                        </Flex>
                      </Flex>
                    </Dialog.Content>
                  </Dialog.Root>
                </Flex>

                <Flex gap="2" align="center">
                  <Checkbox defaultChecked />
                  <Text>Calibrated shells</Text>
                </Flex>

                <Flex gap="1">
                  <Button variant="solid" radius="small">
                    <img src={asset('shells/ap.webp')} width={24} height={24} />
                  </Button>
                  <Button variant="soft" radius="small" color="gray">
                    <img
                      src={asset('shells/hc_premium.webp')}
                      width={24}
                      height={24}
                    />
                  </Button>
                  <Button variant="soft" radius="small" color="gray">
                    <img src={asset('shells/he.webp')} width={24} height={24} />
                  </Button>
                </Flex>
              </Flex>
            </Card>
          )}
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
