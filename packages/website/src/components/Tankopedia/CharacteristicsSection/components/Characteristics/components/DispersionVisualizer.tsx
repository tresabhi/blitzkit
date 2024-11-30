import { Button, Card, Code, Flex, Switch, Text } from '@radix-ui/themes';
import { useEffect, useRef, useState } from 'react';
import type { TankCharacteristics } from '../../../../../../core/blitzkit/tankCharacteristics';

interface DispersionVisualizerProps {
  stats: TankCharacteristics;
}

const refreshRate = 1000 / 60; // ms

export function DispersionVisualizer({ stats }: DispersionVisualizerProps) {
  const aInfinity = stats.dispersion;
  const tau = stats.aimTime;
  const timeText = useRef<HTMLElement>(null);
  const aText = useRef<HTMLElement>(null);
  const [a0, setA0] = useState(stats.dispersionMoving);
  const [stateDiscriminator, setStateDiscriminator] = useState(0);
  const [gunBroken, setGunBroken] = useState(false);

  useEffect(() => {
    let t = 0;
    const interval = setInterval(() => {
      if (!timeText.current || !aText.current) return;

      t += refreshRate / 1000; // ms -> s
      const a = aInfinity + a0 * Math.exp(-t / tau);

      timeText.current.innerText = `t = ${t.toFixed(1)}s`;
      aText.current.innerText = `a = ${a.toFixed(3)}m`;
    }, refreshRate);

    return () => {
      clearInterval(interval);
    };
  }, [aInfinity, tau, a0]);

  return (
    <Card>
      <Flex direction="column" gap="4">
        <Flex gap="2" wrap="wrap">
          <Button
            variant="ghost"
            onClick={() => {
              setA0(stats.dispersionMoving);
            }}
          >
            Move
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setA0(stats.dispersionHullTraversing);
            }}
          >
            Hull traverse
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setA0(stats.dispersionTurretTraversing);
            }}
          >
            Turret traverse
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setA0(stats.dispersion + stats.dispersionShooting);
            }}
          >
            Shoot
          </Button>
        </Flex>

        <Flex align="center" gap="2">
          <Switch
            checked={gunBroken}
            onCheckedChange={(checked) => setGunBroken(checked as boolean)}
          />
          <Text>Gun broken</Text>
        </Flex>

        <Flex justify="between">
          <Code color="gray" ref={timeText}>
            t = 0s
          </Code>

          <Code color="gray" ref={aText}>
            a = {(aInfinity + a0).toFixed(3)}m
          </Code>
        </Flex>
      </Flex>
    </Card>
  );
}
