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
import { Environment, OrbitControls } from '@react-three/drei';
import { Canvas, ThreeEvent, useLoader } from '@react-three/fiber';
import { EffectComposer, SSAO } from '@react-three/postprocessing';
import { go } from 'fuzzysort';
import { debounce } from 'lodash';
import Link from 'next/link';
import { use, useEffect, useRef, useState } from 'react';
import { Group, Mesh, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Flag } from '../../../../components/Flag';
import { ModuleButtons } from '../../../../components/ModuleButton';
import PageWrapper from '../../../../components/PageWrapper';
import { asset } from '../../../../core/blitzkrieg/asset';
import { resolveJsxTree } from '../../../../core/blitzkrieg/resolveJsxTree';
import {
  TIER_ROMAN_NUMERALS,
  tankDefinitions,
  tankNamesDiacritics,
} from '../../../../core/blitzkrieg/tankDefinitions';
import * as styles from '../page.css';
import { TankAlignment } from './components/tankAlignment';

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
  const model = useRef<Group>(null);
  const [versusTankSearchResults, setVersusTankSearchResults] = useState<
    number[]
  >([]);
  const [versusTank, setVersusTank] = useState(tank);
  const [versusTurret, setVersusTurret] = useState(versusTank.turrets.at(-1)!);
  const [versusGun, setVersusGun] = useState(versusTurret.guns.at(-1)!);
  const [versusTankTab, setVersusTankTab] = useState('search');
  const turretObject3D = useRef<Mesh>(null);
  const mantletObject3D = useRef<Mesh>(null);
  const gunObject3D = useRef<Mesh>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const gltf = useLoader(GLTFLoader, '/test/5137.glb');
  const turretOrigin = new Vector3(
    tank.turretOrigin[0],
    tank.turretOrigin[1],
    -tank.turretOrigin[2],
  ).applyAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);
  const gunOrigin = new Vector3(...turret.gunOrigin);
  const [turretRotation, setTurretRotation] = useState(0);
  const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(true);

  useEffect(() => {
    if (!turret.guns.some(({ id }) => gun.id === id)) {
      setGun(turret.guns.at(-1)!);
    }
  }, [turret]);
  useEffect(() => {
    if (!versusTank.turrets.some(({ id }) => id === versusTurret.id)) {
      setVersusTurret(versusTank.turrets.at(-1)!);
    }
  }, [versusTank]);
  useEffect(() => {
    if (!versusTurret.guns.some(({ id }) => id === versusGun.id)) {
      setVersusGun(versusTurret.guns.at(-1)!);
    }
  }, [versusTurret]);

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
                  ref={canvas}
                  onPointerDown={(event) => event.preventDefault()}
                  camera={{ fov: 20, position: [4, 0, -16] }}
                >
                  <TankAlignment model={model} />
                  <OrbitControls enabled={orbitControlsEnabled} />
                  <gridHelper />

                  {/* I really like apartment, dawn, and sunset */}
                  <Environment preset="apartment" />

                  <EffectComposer enabled={true}>
                    <SSAO
                      worldDistanceFalloff={1.0}
                      worldDistanceThreshold={Infinity}
                      worldProximityFalloff={0.5}
                      worldProximityThreshold={8.0}
                      samples={10}
                      radius={0.25}
                      intensity={10}
                    />
                  </EffectComposer>

                  <group ref={model} rotation={[-Math.PI / 2, 0, 0]}>
                    {gltf.scene.children[0].children.map((child) => {
                      const isHull = child.name === 'hull';
                      const isTurret = child.name.startsWith('turret_');
                      const isMantlet =
                        child.name.startsWith('gun_') &&
                        child.name.endsWith('_mask');
                      const isGun = child.name.startsWith('gun_') && !isMantlet;
                      const isVisible =
                        isHull ||
                        child.name.startsWith('chassis_track_') ||
                        child.name.startsWith('chassis_wheel_') ||
                        (child.name.startsWith('turret_') &&
                          child.name ===
                            `turret_${turret.model
                              .toString()
                              .padStart(2, '0')}`) ||
                        (child.name.startsWith('gun_') &&
                          child.name ===
                            `gun_${gun.model.toString().padStart(2, '0')}`) ||
                        child.name ===
                          `gun_${gun.model.toString().padStart(2, '0')}_mask`;
                      let draftTurretRotation = 0;
                      const position = child.position.clone();
                      const rotation = new Vector3().setFromEuler(
                        child.rotation,
                      );

                      if (!isVisible) return null;

                      if (isTurret || isMantlet) {
                        position
                          .sub(turretOrigin)
                          .applyAxisAngle(new Vector3(0, 0, 1), turretRotation)
                          .add(turretOrigin);
                        rotation.add(new Vector3(0, 0, turretRotation));
                      } else if (isGun) {
                        position
                          .sub(turretOrigin)
                          .applyAxisAngle(new Vector3(0, 0, 1), turretRotation)
                          .add(turretOrigin);
                        rotation.add(new Vector3(0, 0, turretRotation));
                      }

                      function handlePointerDown(
                        event: ThreeEvent<PointerEvent>,
                      ) {
                        if (isTurret) {
                          event.stopPropagation();

                          draftTurretRotation = turretRotation;

                          setOrbitControlsEnabled(false);
                          window.addEventListener(
                            'pointermove',
                            handlePointerMove,
                          );
                          window.addEventListener('pointerup', handlePointerUp);
                        }
                      }
                      function handlePointerMove(event: PointerEvent) {
                        event.stopPropagation();
                        event.preventDefault();

                        const rotationSpeed =
                          (2 * Math.PI) / canvas.current!.width;
                        const deltaTurretRotation =
                          event.movementX * rotationSpeed;
                        draftTurretRotation += deltaTurretRotation;

                        if (isTurret) {
                          if (turretObject3D.current) {
                            turretObject3D.current.position
                              .sub(turretOrigin)
                              .applyAxisAngle(
                                new Vector3(0, 0, 1),
                                deltaTurretRotation,
                              )
                              .add(turretOrigin);
                            turretObject3D.current.rotation.z =
                              draftTurretRotation;
                          }

                          if (mantletObject3D.current) {
                            mantletObject3D.current.position
                              .sub(turretOrigin)
                              .applyAxisAngle(
                                new Vector3(0, 0, 1),
                                deltaTurretRotation,
                              )
                              .add(turretOrigin);
                            mantletObject3D.current.rotation.z =
                              draftTurretRotation;
                          }

                          if (gunObject3D.current) {
                            gunObject3D.current.position
                              .sub(turretOrigin)
                              .applyAxisAngle(
                                new Vector3(0, 0, 1),
                                deltaTurretRotation,
                              )
                              .add(turretOrigin);
                            gunObject3D.current.rotation.z =
                              draftTurretRotation;
                          }
                        }
                      }
                      function handlePointerUp(event: PointerEvent) {
                        setOrbitControlsEnabled(true);
                        setTurretRotation(draftTurretRotation);

                        window.removeEventListener(
                          'pointermove',
                          handlePointerMove,
                        );
                        window.removeEventListener(
                          'pointerup',
                          handlePointerUp,
                        );
                      }

                      return (
                        <mesh
                          visible={isVisible}
                          onPointerDown={handlePointerDown}
                          children={resolveJsxTree(child as Mesh)}
                          key={child.uuid}
                          castShadow
                          receiveShadow
                          geometry={(child as Mesh).geometry}
                          material={(child as Mesh).material}
                          position={position}
                          rotation={rotation.toArray()}
                          scale={child.scale}
                          ref={
                            isTurret
                              ? turretObject3D
                              : isGun
                                ? gunObject3D
                                : isMantlet
                                  ? mantletObject3D
                                  : undefined
                          }
                        />
                      );
                    })}
                  </group>
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

          <Theme radius="small">
            <Flex gap="4">
              <Flex gap="1">
                {tank.turrets.map((thisTurret) => {
                  return (
                    <Tooltip content={thisTurret.name}>
                      <Button
                        onClick={() => setTurret(thisTurret)}
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
                {turret.guns.map((thisGun, index) => {
                  return (
                    <Tooltip content={thisGun.name}>
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
                                          setVersusTank(
                                            awaitedTankDefinitions[id],
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
                                      <Tooltip content={turret.name}>
                                        <ModuleButtons
                                          key={id}
                                          onClick={() =>
                                            setVersusTurret(turret)
                                          }
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
                                      <Tooltip content={gun.name}>
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
            <Text>
              {shell.name} ({shell.type}): {shell.damage.armor}
            </Text>
          ))}
        </Flex>
      </Flex>
    </PageWrapper>
  );
}
