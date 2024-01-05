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
  Slider,
  Tabs,
  Text,
  TextField,
  Theme,
  Tooltip,
} from '@radix-ui/themes';
import { Html } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { go } from 'fuzzysort';
import { debounce } from 'lodash';
import Link from 'next/link';
import { Suspense, use, useRef, useState } from 'react';
import { Group, Vector3 } from 'three';
import { Flag } from '../../../../components/Flag';
import { ModuleButtons } from '../../../../components/ModuleButton';
import PageWrapper from '../../../../components/PageWrapper';
import { asset } from '../../../../core/blitzkrieg/asset';
import {
  TIER_ROMAN_NUMERALS,
  tankDefinitions,
  tankNamesDiacritics,
} from '../../../../core/blitzkrieg/tankDefinitions';
import { theme } from '../../../../stitches.config';
import { Loader } from '../../components/Loader';
import * as styles from '../page.css';
import { Controls } from './components/Control';
import { RotationInputs } from './components/RotationInputs';
import { SceneProps } from './components/SceneProps';
import { TankModel } from './components/TankModel';

const X_AXIS = new Vector3(1, 0, 0);

export default function Page({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const awaitedTankDefinitions = use(tankDefinitions);
  const awaitedTankNamesDiacritics = use(tankNamesDiacritics);
  const tank = awaitedTankDefinitions[id];
  const [turret, setTurret] = useState(tank.turrets.at(-1)!);
  const [gun, setGun] = useState(turret.guns.at(-1)!);
  const [crew, setCrew] = useState(100);
  const [mode, setMode] = useState('model');
  const versusTankSearchInput = useRef<HTMLInputElement>(null);
  const hullContainer = useRef<Group>(null);
  const [versusTankSearchResults, setVersusTankSearchResults] = useState<
    number[]
  >([]);
  const [versusTank, setVersusTank] = useState(tank);
  const [versusTurret, setVersusTurret] = useState(versusTank.turrets.at(-1)!);
  const [versusGun, setVersusGun] = useState(versusTurret.guns.at(-1)!);
  const [versusTankTab, setVersusTankTab] = useState('search');
  const canvas = useRef<HTMLCanvasElement>(null);

  function handlePointerDown() {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }
  function handlePointerMove(event: PointerEvent) {
    event.preventDefault();
  }
  function handlePointerUp(event: PointerEvent) {
    event.preventDefault();

    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }

  return (
    <PageWrapper color="purple">
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
              <Tabs.Root value={mode} onValueChange={setMode}>
                <Tabs.List>
                  <Tabs.Trigger value="model">Model</Tabs.Trigger>
                  <Tabs.Trigger value="armor">Armor</Tabs.Trigger>
                </Tabs.List>
              </Tabs.Root>

              <div style={{ height: '50vh', maxHeight: 576 }}>
                <Canvas
                  shadows
                  ref={canvas}
                  camera={{ fov: 20 }}
                  onPointerDown={handlePointerDown}
                >
                  <Controls />
                  <SceneProps />

                  <Suspense
                    fallback={
                      <Html center position={[0, 1.5, 0]}>
                        <Loader
                          naked
                          color={theme.colors.textHighContrast_purple}
                        />
                      </Html>
                    }
                  >
                    <TankModel
                      gunId={gun.id}
                      tankId={tank.id}
                      turretId={turret.id}
                      ref={hullContainer}
                    />
                  </Suspense>
                </Canvas>
              </div>

              {mode === 'armor' && (
                <Flex gap="2" align="center" className={styles.enhancedArmor}>
                  <Checkbox defaultChecked />
                  <Text>Enhanced armor</Text>
                </Flex>
              )}

              <RotationInputs
                gunId={gun.id}
                tankId={tank.id}
                turretId={turret.id}
              />
            </Flex>
          </Card>

          <Theme radius="small">
            <Flex gap="4">
              <Flex gap="1">
                {tank.turrets.map((thisTurret) => {
                  return (
                    <Tooltip content={thisTurret.name} key={thisTurret.id}>
                      <Button
                        onClick={() => {
                          setTurret(thisTurret);
                          setGun(thisTurret.guns.at(-1)!);
                        }}
                        variant={turret.id === thisTurret.id ? 'solid' : 'soft'}
                      >
                        <img
                          src={asset('icons/modules/turret.webp')}
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
                {turret.guns.map((thisGun) => {
                  return (
                    <Tooltip content={thisGun.name} key={thisGun.id}>
                      <Button
                        onClick={() => setGun(thisGun)}
                        variant={gun.id === thisGun.id ? 'solid' : 'soft'}
                      >
                        <img
                          src={asset('icons/modules/gun.webp')}
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

          {mode === 'armor' && (
            <Card>
              <Flex align="center" justify="between" gap="2">
                <Flex align="center" gap="4">
                  <Text>Versus</Text>

                  <Dialog.Root>
                    <Dialog.Trigger>
                      <Button variant="ghost">
                        {versusTank.name}
                        <CaretRightIcon />
                      </Button>
                    </Dialog.Trigger>

                    <Dialog.Content>
                      <Tabs.Root
                        value={versusTankTab}
                        onValueChange={setVersusTankTab}
                      >
                        <Flex gap="4" direction="column">
                          <Tabs.List>
                            <Tabs.Trigger value="search">Search</Tabs.Trigger>
                            <Tabs.Trigger value="configure">
                              Configure
                            </Tabs.Trigger>
                          </Tabs.List>

                          <Tabs.Content value="search">
                            <Flex
                              direction="column"
                              gap="4"
                              style={{ flex: 1 }}
                              justify="center"
                            >
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

                              <Flex direction="column" gap="2">
                                {(versusTankSearchResults.length > 0 ||
                                  versusTankSearchInput.current?.value) && (
                                  <Flex direction="column" gap="2">
                                    {versusTankSearchResults.map((id) => (
                                      <Button
                                        key={id}
                                        variant="ghost"
                                        onClick={() => {
                                          const thisTank =
                                            awaitedTankDefinitions[id];

                                          setVersusTank(thisTank);
                                          setVersusTurret(
                                            thisTank.turrets.at(-1)!,
                                          );
                                          setVersusGun(
                                            thisTank.turrets
                                              .at(-1)!
                                              .guns.at(-1)!,
                                          );
                                          setVersusTankSearchResults([]);
                                          versusTankSearchInput.current!.value =
                                            '';
                                          setVersusTankTab('configure');
                                        }}
                                      >
                                        {awaitedTankDefinitions[id].name}
                                      </Button>
                                    ))}

                                    {versusTankSearchResults.length === 0 &&
                                      (versusTankSearchInput.current
                                        ? versusTankSearchInput.current.value
                                            .length > 0
                                        : false) && (
                                        <Button disabled variant="ghost">
                                          No search results
                                        </Button>
                                      )}
                                  </Flex>
                                )}
                              </Flex>
                            </Flex>
                          </Tabs.Content>

                          <Tabs.Content value="configure">
                            <Flex direction="column" gap="4">
                              <Flex
                                direction="column"
                                gap="2"
                                style={{ flex: 1 }}
                              >
                                <Heading size="4">Configuration</Heading>

                                <Flex gap="2" wrap="wrap">
                                  <Flex>
                                    {versusTank.turrets.map((turret, index) => (
                                      <Tooltip
                                        content={turret.name}
                                        key={turret.id}
                                      >
                                        <ModuleButtons
                                          key={id}
                                          onClick={() => {
                                            setVersusTurret(turret);
                                            setVersusGun(turret.guns.at(-1)!);
                                          }}
                                          selected={versusTurret.id === id}
                                          tier={turret.tier}
                                          type="turret"
                                          style={{
                                            margin: -0.5,
                                            borderTopLeftRadius:
                                              index === 0 ? undefined : 0,
                                            borderBottomLeftRadius:
                                              index === 0 ? undefined : 0,
                                            borderTopRightRadius:
                                              index ===
                                              versusTank.turrets.length - 1
                                                ? undefined
                                                : 0,
                                            borderBottomRightRadius:
                                              index ===
                                              versusTank.turrets.length - 1
                                                ? undefined
                                                : 0,
                                          }}
                                        />
                                      </Tooltip>
                                    ))}
                                  </Flex>
                                  <Flex>
                                    {versusTurret.guns.map((gun, index) => (
                                      <Tooltip content={gun.name} key={gun.id}>
                                        <ModuleButtons
                                          key={id}
                                          onClick={() => setVersusGun(gun)}
                                          selected={versusGun.id === id}
                                          tier={gun.tier}
                                          type="gun"
                                          style={{
                                            margin: -0.5,
                                            borderTopLeftRadius:
                                              index === 0 ? undefined : 0,
                                            borderBottomLeftRadius:
                                              index === 0 ? undefined : 0,
                                            borderTopRightRadius:
                                              index ===
                                              versusTurret.guns.length - 1
                                                ? undefined
                                                : 0,
                                            borderBottomRightRadius:
                                              index ===
                                              versusTurret.guns.length - 1
                                                ? undefined
                                                : 0,
                                          }}
                                        />
                                      </Tooltip>
                                    ))}
                                  </Flex>
                                </Flex>
                              </Flex>

                              <Flex
                                direction="column"
                                gap="2"
                                style={{ flex: 1 }}
                              >
                                <Heading size="4">Properties</Heading>

                                <ul>
                                  <li>Penetration</li>
                                </ul>
                              </Flex>
                            </Flex>
                          </Tabs.Content>
                        </Flex>
                      </Tabs.Root>
                    </Dialog.Content>
                  </Dialog.Root>
                </Flex>

                <Flex gap="2" align="center">
                  <Checkbox defaultChecked />
                  <Text>Calibrated shells</Text>
                </Flex>

                <Flex gap="1">
                  <Button variant="solid" radius="small">
                    <img
                      src={asset('icons/shells/ap.webp')}
                      width={24}
                      height={24}
                    />
                  </Button>
                  <Button variant="soft" radius="small" color="gray">
                    <img
                      src={asset('icons/shells/hc_premium.webp')}
                      width={24}
                      height={24}
                    />
                  </Button>
                  <Button variant="soft" radius="small" color="gray">
                    <img
                      src={asset('icons/shells/he.webp')}
                      width={24}
                      height={24}
                    />
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

          {gun.shells.map((shell) => (
            <Text key={shell.id}>
              {shell.name} ({shell.type}): {shell.damage.armor}
            </Text>
          ))}
        </Flex>
      </Flex>
    </PageWrapper>
  );
}
