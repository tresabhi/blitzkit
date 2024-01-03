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
import { Canvas, ThreeEvent, useLoader } from '@react-three/fiber';
import { go } from 'fuzzysort';
import { clamp, debounce } from 'lodash';
import Link from 'next/link';
import { use, useEffect, useRef, useState } from 'react';
import { Color, Group, Mesh, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Flag } from '../../../../components/Flag';
import InfiniteGridHelper from '../../../../components/InfiniteGridHelper';
import { ModuleButtons } from '../../../../components/ModuleButton';
import PageWrapper from '../../../../components/PageWrapper';
import { asset } from '../../../../core/blitzkrieg/asset';
import { modelDefinitions } from '../../../../core/blitzkrieg/modelDefinitions';
import { resolveJsxTree } from '../../../../core/blitzkrieg/resolveJsxTree';
import {
  TIER_ROMAN_NUMERALS,
  tankDefinitions,
  tankNamesDiacritics,
} from '../../../../core/blitzkrieg/tankDefinitions';
import { normalizeAnglePI } from '../../../../core/math/normalizeAngle180';
import * as styles from '../page.css';
import { Controls } from './components/Control';

const X_AXIS = new Vector3(1, 0, 0);

export default function Page({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const awaitedTankDefinitions = use(tankDefinitions);
  const awaitedModelDefinitions = use(modelDefinitions);
  const awaitedTankNamesDiacritics = use(tankNamesDiacritics);
  const tank = awaitedTankDefinitions[id];
  const tankModelDefinition = awaitedModelDefinitions[id];
  const [turret, setTurret] = useState(tank.turrets.at(-1)!);
  const turretModelDefinition = tankModelDefinition.turrets[turret.id];
  const [gun, setGun] = useState(turret.guns.at(-1)!);
  const gunModelDefinition = turretModelDefinition.guns[gun.id];
  const [crew, setCrew] = useState(100);
  const [mode, setMode] = useState('model');
  const versusTankSearchInput = useRef<HTMLInputElement>(null);
  const hullContainer = useRef<Group>(null);
  const turretContainer = useRef<Group>(null);
  const [versusTankSearchResults, setVersusTankSearchResults] = useState<
    number[]
  >([]);
  const [versusTank, setVersusTank] = useState(tank);
  const [versusTurret, setVersusTurret] = useState(versusTank.turrets.at(-1)!);
  const [versusGun, setVersusGun] = useState(versusTurret.guns.at(-1)!);
  const [versusTankTab, setVersusTankTab] = useState('search');
  const canvas = useRef<HTMLCanvasElement>(null);
  const gltf = useLoader(GLTFLoader, `/test/${id}.glb`);
  const turretOrigin = new Vector3(
    tankModelDefinition.turretOrigin[0],
    tankModelDefinition.turretOrigin[1],
    -tankModelDefinition.turretOrigin[2],
  ).applyAxisAngle(X_AXIS, Math.PI / 2);
  const gunOrigin = new Vector3(
    turretModelDefinition.gunOrigin[0],
    turretModelDefinition.gunOrigin[1],
    -turretModelDefinition.gunOrigin[2],
  ).applyAxisAngle(X_AXIS, Math.PI / 2);
  const [turretYaw, setTurretYaw] = useState(0);
  const [hullYaw, setHullYaw] = useState(0);
  const [gunPitch, setGunPitch] = useState(0);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const turretYawInput = useRef<HTMLInputElement>(null);
  const hullYawInput = useRef<HTMLInputElement>(null);
  const gunPitchInput = useRef<HTMLInputElement>(null);
  const gunContainer = useRef<Group>(null);

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
  useEffect(() => {
    hullYawInput.current!.value = `${-Math.round(hullYaw * (180 / Math.PI))}`;
  }, [hullYaw]);
  useEffect(() => {
    turretYawInput.current!.value = `${-Math.round(
      turretYaw * (180 / Math.PI),
    )}`;
  }, [turretYaw]);
  useEffect(() => {
    gunPitchInput.current!.value = `${-Math.round(gunPitch * (180 / Math.PI))}`;
  }, [gunPitch]);

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
                <Canvas shadows ref={canvas} camera={{ fov: 20 }}>
                  <InfiniteGridHelper
                    size1={1 / 5}
                    size2={1}
                    distance={20}
                    color={new Color('#ffffff')}
                  />
                  <InfiniteGridHelper
                    position={[0, 1e-4, 0]}
                    size1={0}
                    size2={100}
                    distance={25}
                    color={new Color('red')}
                  />
                  <Controls enabled={controlsEnabled} fit={hullContainer} />

                  {/* I really like apartment, dawn, and sunset */}
                  <directionalLight
                    position={[1, 1, -1]}
                    intensity={1}
                    castShadow
                  />
                  <directionalLight
                    position={[-1, 1, 1]}
                    intensity={2}
                    castShadow
                  />
                  <ambientLight intensity={0.25} />

                  <group
                    ref={hullContainer}
                    rotation={[-Math.PI / 2, 0, hullYaw]}
                  >
                    {gltf.scene.children[0].children.map((child) => {
                      const isHull = child.name === 'hull';
                      const isWheel = child.name.startsWith('chassis_wheel_');
                      const isTrack = child.name.startsWith('chassis_track_');
                      const isVisible = isHull || isWheel || isTrack;
                      let draftHullYaw = 0;

                      function handlePointerDown(
                        event: ThreeEvent<PointerEvent>,
                      ) {
                        event.stopPropagation();
                        draftHullYaw = hullYaw;
                        setControlsEnabled(false);
                        window.addEventListener(
                          'pointermove',
                          handlePointerMove,
                        );
                        window.addEventListener('pointerup', handlePointerUp);
                      }
                      function handlePointerMove(event: PointerEvent) {
                        draftHullYaw +=
                          event.movementX *
                          ((2 * Math.PI) / canvas.current!.width);

                        if (hullContainer.current) {
                          hullContainer.current.rotation.z = draftHullYaw;
                        }
                      }
                      function handlePointerUp() {
                        setControlsEnabled(true);
                        setHullYaw(normalizeAnglePI(draftHullYaw));
                        window.removeEventListener(
                          'pointermove',
                          handlePointerMove,
                        );
                        window.removeEventListener(
                          'pointerup',
                          handlePointerUp,
                        );
                      }

                      if (!isVisible) return null;
                      return (
                        <mesh
                          children={resolveJsxTree(child as Mesh)}
                          key={child.uuid}
                          castShadow
                          receiveShadow
                          geometry={(child as Mesh).geometry}
                          material={(child as Mesh).material}
                          position={child.position}
                          rotation={child.rotation}
                          scale={child.scale}
                          onPointerDown={handlePointerDown}
                        />
                      );
                    })}

                    <group
                      position={new Vector3()
                        .sub(turretOrigin)
                        .applyAxisAngle(new Vector3(0, 0, 1), turretYaw)
                        .add(turretOrigin)}
                      rotation={[0, 0, turretYaw]}
                      ref={turretContainer}
                    >
                      {gltf.scene.children[0].children.map((child) => {
                        const isTurret = child.name.startsWith('turret_');
                        const isCurrentTurret =
                          child.name ===
                          `turret_${turretModelDefinition.model
                            .toString()
                            .padStart(2, '0')}`;
                        const isVisible = isCurrentTurret;
                        let draftTurretYaw = 0;

                        function handlePointerDown(
                          event: ThreeEvent<PointerEvent>,
                        ) {
                          event.stopPropagation();

                          if (isTurret) {
                            setControlsEnabled(false);
                            draftTurretYaw = turretYaw;
                            window.addEventListener(
                              'pointermove',
                              handlePointerMove,
                            );
                            window.addEventListener(
                              'pointerup',
                              handlePointerUp,
                            );
                          }
                        }
                        function handlePointerMove(event: PointerEvent) {
                          draftTurretYaw +=
                            event.movementX *
                            ((2 * Math.PI) / canvas.current!.width);

                          if (turretContainer.current) {
                            turretContainer.current.position
                              .set(0, 0, 0)
                              .sub(turretOrigin)
                              .applyAxisAngle(
                                new Vector3(0, 0, 1),
                                draftTurretYaw,
                              )
                              .add(turretOrigin);
                            turretContainer.current.rotation.z = draftTurretYaw;
                          }
                        }
                        function handlePointerUp() {
                          setTurretYaw(normalizeAnglePI(draftTurretYaw));
                          setControlsEnabled(true);
                          window.removeEventListener(
                            'pointermove',
                            handlePointerMove,
                          );
                          window.removeEventListener(
                            'pointerup',
                            handlePointerUp,
                          );
                        }

                        if (!isVisible) return null;
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
                            position={child.position}
                            rotation={child.rotation}
                            scale={child.scale}
                          />
                        );
                      })}

                      <group
                        position={new Vector3()
                          .sub(turretOrigin)
                          .sub(gunOrigin)
                          .applyAxisAngle(new Vector3(1, 0, 0), gunPitch)
                          .add(turretOrigin)
                          .add(gunOrigin)}
                        rotation={[gunPitch, 0, 0]}
                        ref={gunContainer}
                      >
                        {gltf.scene.children[0].children.map((child) => {
                          const isCurrentMantlet =
                            child.name ===
                            `gun_${gunModelDefinition.model
                              .toString()
                              .padStart(2, '0')}_mask`;
                          const isCurrentGun =
                            child.name ===
                            `gun_${gunModelDefinition.model
                              .toString()
                              .padStart(2, '0')}`;
                          const isVisible = isCurrentGun || isCurrentMantlet;
                          let draftMantletPitch = 0;
                          let draftTurretYaw = 0;

                          function handlePointerDown(
                            event: ThreeEvent<PointerEvent>,
                          ) {
                            event.stopPropagation();

                            setControlsEnabled(false);
                            draftMantletPitch = gunPitch;
                            draftTurretYaw = turretYaw;
                            window.addEventListener(
                              'pointermove',
                              handlePointerMove,
                            );
                            window.addEventListener(
                              'pointerup',
                              handlePointerUp,
                            );
                          }
                          function handlePointerMove(event: PointerEvent) {
                            if (turretModelDefinition.yaw) {
                              draftTurretYaw = clamp(
                                draftTurretYaw +
                                  event.movementX *
                                    (Math.PI / canvas.current!.width),
                                -turretModelDefinition.yaw.max *
                                  (Math.PI / 180),
                                -turretModelDefinition.yaw.min *
                                  (Math.PI / 180),
                              );
                            } else {
                              draftTurretYaw +=
                                event.movementX *
                                ((2 * Math.PI) / canvas.current!.width);
                            }
                            draftMantletPitch = clamp(
                              draftMantletPitch -
                                event.movementY *
                                  (Math.PI / canvas.current!.height),
                              -gunModelDefinition.pitch.max * (Math.PI / 180),
                              -gunModelDefinition.pitch.min * (Math.PI / 180),
                            );

                            if (gunContainer.current) {
                              gunContainer.current.position
                                .set(0, 0, 0)
                                .sub(turretOrigin)
                                .sub(gunOrigin)
                                .applyAxisAngle(
                                  new Vector3(1, 0, 0),
                                  draftMantletPitch,
                                )
                                .add(turretOrigin)
                                .add(gunOrigin);
                              gunContainer.current.rotation.x =
                                draftMantletPitch;
                            }

                            if (turretContainer.current) {
                              turretContainer.current.position
                                .set(0, 0, 0)
                                .sub(turretOrigin)
                                .applyAxisAngle(
                                  new Vector3(0, 0, 1),
                                  draftTurretYaw,
                                )
                                .add(turretOrigin);
                              turretContainer.current.rotation.z =
                                draftTurretYaw;
                            }
                          }
                          function handlePointerUp() {
                            setControlsEnabled(true);
                            setGunPitch(normalizeAnglePI(draftMantletPitch));
                            setTurretYaw(normalizeAnglePI(draftTurretYaw));
                            window.removeEventListener(
                              'pointermove',
                              handlePointerMove,
                            );
                            window.removeEventListener(
                              'pointerup',
                              handlePointerUp,
                            );
                          }

                          if (!isVisible) return null;
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
                              position={child.position}
                              rotation={child.rotation}
                              scale={child.scale}
                            />
                          );
                        })}
                      </group>
                    </group>
                  </group>
                </Canvas>
              </div>

              {mode === 'armor' && (
                <Flex gap="2" align="center" className={styles.enhancedArmor}>
                  <Checkbox defaultChecked />
                  <Text>Enhanced armor</Text>
                </Flex>
              )}

              <Flex
                gap="2"
                align="center"
                style={{
                  position: 'absolute',
                  left: 16,
                  bottom: 16,
                }}
              >
                <TextField.Root
                  variant="surface"
                  style={{
                    width: 115,
                  }}
                >
                  <TextField.Slot>Hull</TextField.Slot>
                  <TextField.Input
                    defaultValue={Math.round(hullYaw * (180 / Math.PI))}
                    onBlur={() => {
                      const normalized = normalizeAnglePI(
                        -Number(hullYawInput.current?.value) * (Math.PI / 180),
                      );
                      setHullYaw(normalized);
                      hullYawInput.current!.value = `${Math.round(normalized)}`;
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        hullYawInput.current?.blur();
                      }
                    }}
                    onFocus={() => hullYawInput.current?.focus()}
                    ref={hullYawInput}
                    style={{ textAlign: 'right' }}
                  />
                  <TextField.Slot>°</TextField.Slot>
                </TextField.Root>

                <TextField.Root
                  variant="surface"
                  style={{
                    width: 115,
                  }}
                >
                  <TextField.Slot>Turret</TextField.Slot>
                  <TextField.Input
                    defaultValue={Math.round(turretYaw * (180 / Math.PI))}
                    onBlur={() => {
                      const normalized = normalizeAnglePI(
                        -Number(turretYawInput.current?.value) *
                          (Math.PI / 180),
                      );
                      setTurretYaw(normalized);
                      turretYawInput.current!.value = `${Math.round(
                        normalized,
                      )}`;
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        turretYawInput.current?.blur();
                      }
                    }}
                    onFocus={() => turretYawInput.current?.focus()}
                    ref={turretYawInput}
                    style={{ textAlign: 'right' }}
                  />
                  <TextField.Slot>°</TextField.Slot>
                </TextField.Root>

                <TextField.Root
                  variant="surface"
                  style={{
                    width: 115,
                  }}
                >
                  <TextField.Slot>Gun</TextField.Slot>
                  <TextField.Input
                    defaultValue={-Math.round(gunPitch * (180 / Math.PI))}
                    onBlur={() => {
                      const clamped = clamp(
                        Number(gunPitchInput.current?.value),
                        gunModelDefinition.pitch.min,
                        gunModelDefinition.pitch.max,
                      );
                      setGunPitch(-clamped * (Math.PI / 180));
                      gunPitchInput.current!.value = `${Math.round(clamped)}`;
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        gunPitchInput.current?.blur();
                      }
                    }}
                    onFocus={() => gunPitchInput.current?.focus()}
                    ref={gunPitchInput}
                    style={{ textAlign: 'right' }}
                  />
                  <TextField.Slot>°</TextField.Slot>
                </TextField.Root>
              </Flex>
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
