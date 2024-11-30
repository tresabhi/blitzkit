import { ChevronUpIcon, PlayIcon } from '@radix-ui/react-icons';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Code,
  Flex,
  Select,
  Text,
} from '@radix-ui/themes';
import { useEffect, useRef, useState } from 'react';
import type { TankCharacteristics } from '../../../../../../core/blitzkit/tankCharacteristics';
import { Var } from '../../../../../../core/radix/var';

interface DispersionVisualizerProps {
  stats: TankCharacteristics;
}

const BASE_SIZE = 10; // rem
const REFRESH_RATE = 1000 / 60; // ms
const VISUALIZER_TYPES = [
  'afterMove',
  'afterHullTraverse',
  'afterTurretTraverse',
  'afterShot',
] as const;

type VisualizerType = (typeof VISUALIZER_TYPES)[number];

export function DispersionVisualizer({ stats }: DispersionVisualizerProps) {
  const timeText = useRef<HTMLElement>(null);
  const dispersionText = useRef<HTMLElement>(null);
  const serverSideCircle = useRef<HTMLDivElement>(null);
  const [visualize, setVisualize] = useState<VisualizerType>('afterMove');
  const [gunDamaged, setGunDamaged] = useState(false);
  const [stateDiscriminator, setStateDiscriminator] = useState(false);

  useEffect(() => {
    const tau = stats.aimTime;
    let t = 0;
    let coefficient: number;
    const dispersionBase = stats.dispersion;
    let dispersionAdditive: number;

    if (gunDamaged) {
      coefficient = stats.dispersionGunDamaged;
    } else {
      coefficient = 1;
    }

    switch (visualize) {
      case 'afterMove':
        dispersionAdditive = stats.dispersionMoving;
        break;

      case 'afterHullTraverse':
        dispersionAdditive = stats.dispersionHullTraversing;
        break;

      case 'afterTurretTraverse':
        dispersionAdditive = stats.dispersionTurretTraversing;
        break;

      case 'afterShot':
        dispersionAdditive = stats.dispersion * (stats.dispersionShooting - 1);
        break;
    }

    const interval = setInterval(() => {
      if (
        !timeText.current ||
        !dispersionText.current ||
        !serverSideCircle.current
      )
        return;

      t += REFRESH_RATE / 1000; // ms -> s
      const dispersion =
        coefficient *
        (dispersionBase + dispersionAdditive * Math.exp(-t / tau));
      timeText.current.innerText = `t = ${t.toFixed(1)}s`;
      dispersionText.current.innerText = `a = ${dispersion.toFixed(3)}m`;

      const serverSideSize = `${(dispersion / coefficient / dispersionBase) * BASE_SIZE}rem`;
      serverSideCircle.current.style.width = serverSideSize;
      serverSideCircle.current.style.height = serverSideSize;
    }, REFRESH_RATE);

    return () => {
      clearInterval(interval);
    };
  }, [visualize, gunDamaged, stateDiscriminator]);

  return (
    <Card>
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between">
          <Flex align="center" gap="1">
            <Text>After</Text>
            <Select.Root
              value={visualize}
              onValueChange={(value) => setVisualize(value as VisualizerType)}
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Item value={'afterMove' satisfies VisualizerType}>
                  move
                </Select.Item>
                <Select.Item
                  value={'afterHullTraverse' satisfies VisualizerType}
                >
                  hull traverse
                </Select.Item>
                <Select.Item
                  value={'afterTurretTraverse' satisfies VisualizerType}
                >
                  turret traverse
                </Select.Item>
                <Select.Item value={'afterShot' satisfies VisualizerType}>
                  shot
                </Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>

          <Flex
            align="center"
            gap="2"
            onClick={() => setGunDamaged((state) => !state)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            <Text>Gun damaged</Text>
            <Checkbox checked={gunDamaged} />
          </Flex>
        </Flex>

        <Box
          width="100%"
          style={{
            aspectRatio: '1 / 1',
            backgroundColor: Var('color-background'),
            borderRadius: Var('radius-2'),
          }}
          // overflow="hidden"
          position="relative"
        >
          <Box
            position="absolute"
            top="50%"
            left="50%"
            style={{
              transform: `translate(-50%, -${1 / 8}rem)`,
            }}
          >
            <Text size="6" trim="both">
              <ChevronUpIcon width="1em" height="1em" />
            </Text>
          </Box>

          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={`${BASE_SIZE}rem`}
            height={`${BASE_SIZE}rem`}
            style={{
              borderRadius: '100%',
              outline: `${1 / 16}rem solid ${Var('gray-9')}`,
              outlineOffset: `-${1 / 16 / 2}rem`,
              transform: 'translate(-50%, -50%)',
            }}
          />
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={`${BASE_SIZE}rem`}
            height={`${BASE_SIZE}rem`}
            ref={serverSideCircle}
            style={{
              borderRadius: '100%',
              outline: `${1 / 8}rem solid ${Var('green-9')}`,
              outlineOffset: `-${1 / 8 / 2}rem`,
              transform: 'translate(-50%, -50%)',
            }}
          />
          <Flex
            justify="between"
            position="absolute"
            bottom="0"
            width="100%"
            p="2"
          >
            <Code color="gray" ref={timeText}>
              t = 0s
            </Code>

            <Code color="gray" ref={dispersionText}>
              a = 0.000m
            </Code>
          </Flex>
        </Box>

        <Flex justify="end">
          <Button onClick={() => setStateDiscriminator((state) => !state)}>
            <PlayIcon /> Play
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
