import { asset } from '@blitzkit/core';
import { Box, Card, Text } from '@radix-ui/themes';
import { clamp } from 'lodash-es';
import { useRef } from 'react';
import { degToRad } from 'three/src/math/MathUtils.js';
import { Var } from '../../../../../../../core/radix/var';
import { Duel } from '../../../../../../../stores/duel';
import type { VisualizerProps } from '../HullTraverseVisualizer';
import './index.css';

const MAX_THICKNESS = 300;
const EXAGGERATION = 4;

export function RicochetVisualizer2({ stats }: VisualizerProps) {
  const thickness = 150;
  const shell = Duel.use((state) => state.protagonist.shell);
  const container = useRef<HTMLDivElement>(null);
  const incomingTracer = useRef<HTMLDivElement>(null);
  const normalizedTracer = useRef<HTMLDivElement>(null);
  const normalization = EXAGGERATION * degToRad(stats.shellNormalization);

  return (
    <Card
      variant="classic"
      style={{
        aspectRatio: '1 / 1',
      }}
      mb="6"
      ref={container}
      onPointerMove={(event) => {
        if (
          !container.current ||
          !incomingTracer.current ||
          !normalizedTracer.current
        )
          return;

        const rect = container.current.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        const angle = clamp(Math.atan2(y, x), -Math.PI / 2, Math.PI / 2);
        const normalizedAngle =
          Math.sign(angle) * Math.max(0, Math.abs(angle) - normalization);

        incomingTracer.current.style.transform = `rotate(${-Math.PI / 2 + angle}rad)`;
        normalizedTracer.current.style.transform = `rotate(${-Math.PI / 2 + normalizedAngle}rad)`;
      }}
    >
      <Box
        width={`${(thickness / MAX_THICKNESS) * 50}%`}
        height="100%"
        position="absolute"
        top="0"
        right="50%"
        style={{
          background: `linear-gradient(to right, ${Var('gray-a2')}, ${Var('gray-a4')})`,
        }}
      >
        <Box
          width="100%"
          height="100%"
          style={{
            opacity: 2 ** -3,
            backgroundImage: `url(/assets/images/tankopedia/visualizers/ricochet/armor-hash.png)`,
          }}
        />
      </Box>

      <Box
        ref={incomingTracer}
        position="absolute"
        left="50%"
        top="50%"
        height="13rem"
        style={{
          transformOrigin: 'top center',
          transform: 'translateX(-50%) rotate(-90deg)',
        }}
      >
        <Box
          position="absolute"
          width="1px"
          height="100%"
          bottom="100%"
          style={{
            transform: 'translateX(-50%)',
            backgroundColor: Var('gray-a5'),
          }}
        />
        <Box
          position="absolute"
          width="2px"
          height="100%"
          style={{
            transform: 'translateX(-50%)',
            background: `linear-gradient(${Var('gray-a11')}, ${Var('gray-a4')})`,
          }}
        />

        <img
          className="ricochet-visualizer-penetrating-shell"
          src={asset(`icons/shells/${shell.icon}.webp`)}
          style={{
            objectFit: 'contain',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            position: 'absolute',
            width: '2rem',
            height: '2rem',
            top: '6rem',
            left: 0,
          }}
        />
      </Box>

      <Box
        ref={normalizedTracer}
        position="absolute"
        left="50%"
        top="50%"
        height="16rem"
        style={{
          transformOrigin: 'top center',
          transform: 'translateX(-50%) rotate(-90deg)',
        }}
      >
        <Box
          position="absolute"
          width="2px"
          height="100%"
          top="-100%"
          style={{
            transform: 'translateX(-50%)',
            background: `linear-gradient(${Var('gray-a4')}, ${Var('gray-a11')})`,
          }}
        />
      </Box>

      <Box position="absolute" right="3" bottom="2">
        <Text style={{ opacity: 0.5 }} size="1">
          <i>*Not to scale</i>
        </Text>
      </Box>
    </Card>
  );
}
