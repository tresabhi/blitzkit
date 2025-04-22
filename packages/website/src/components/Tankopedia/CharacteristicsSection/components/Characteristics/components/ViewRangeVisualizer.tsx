import { literals } from '@blitzkit/i18n';
import { EyeOpenIcon } from '@radix-ui/react-icons';
import { Box, Card, Code, Flex, Slider, Tabs, Text } from '@radix-ui/themes';
import { useRef, useState } from 'react';
import { Var } from '../../../../../../core/radix/var';
import { useLocale } from '../../../../../../hooks/useLocale';
import type { VisualizerProps } from './HullTraverseVisualizer';

const maps = [
  {
    id: 'new-bay',
    string: 'new_bay',
    size: 512,
  },
  {
    id: 'desert-sands',
    string: 'desert_sands',
    size: 512,
  },
] as const;

export function ViewRangeVisualizer({ stats }: VisualizerProps) {
  const [mapIndex, setMapIndex] = useState(0);
  const [camouflage, setCamouflage] = useState(0);
  const map = maps[mapIndex];
  const resolvedViewRange = stats.viewRange * (1 - camouflage);
  const fraction = resolvedViewRange / map.size;
  const fractionPercentage = `${fraction * 100}%`;
  const { strings } = useLocale();
  const container = useRef<HTMLDivElement>(null);
  const range = useRef<HTMLDivElement>(null);

  return (
    <Card style={{ aspectRatio: '1 / 1' }} mb="6">
      <Box
        ref={container}
        onPointerMove={(event) => {
          if (!container.current || !range.current) return;

          const rect = container.current.getBoundingClientRect();
          range.current.style.left = `${event.clientX - rect.left}px`;
          range.current.style.top = `${event.clientY - rect.top - 16}px`;
        }}
        flexGrow="1"
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        style={{
          backgroundImage: `url(/assets/images/tankopedia/visualizers/range/${map.id}.webp)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Flex
          ref={range}
          position="absolute"
          top="50%"
          left="50%"
          width={fractionPercentage}
          align="center"
          justify="center"
          style={{
            aspectRatio: '1 / 1',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(${Var('gray-a1')}, ${Var('gray-a12')})`,
            borderRadius: '50%',
          }}
        >
          <Text>
            <Flex align="center" gap="2">
              <EyeOpenIcon width="1.25rem" height="1.25rem" />
              {literals(strings.common.units.m, [resolvedViewRange.toFixed(0)])}
            </Flex>
          </Text>
        </Flex>
      </Box>

      <Flex
        position="absolute"
        top="0"
        left="0"
        width="100%"
        p="2"
        gap="3"
        align="center"
        style={{
          background: `linear-gradient(${Var('black-a9')}, ${Var('black-a4')})`,
        }}
      >
        <Text>
          {strings.website.tools.tankopedia.visualizers.view_range.camo}
        </Text>

        <Slider
          variant="classic"
          value={[camouflage]}
          min={0}
          max={0.5}
          step={Number.EPSILON}
          onValueChange={([value]) => setCamouflage(value)}
        />

        <Code highContrast color="gray" variant="ghost">
          <Flex justify="center" width="3em">
            {literals(
              strings.website.tools.tankopedia.visualizers.view_range
                .percentage,
              [`${Math.round(camouflage * 100)}`.padStart(3, ' ')],
            )}
          </Flex>
        </Code>
      </Flex>

      <Flex
        justify="center"
        position="absolute"
        bottom="0"
        left="0"
        width="100%"
        style={{
          background: `radial-gradient(at 50% 100%, ${Var('gray-1')}, transparent 70%)`,
        }}
      >
        <Tabs.Root
          value={`${mapIndex}`}
          onValueChange={(index) => setMapIndex(Number(index))}
        >
          <Tabs.List>
            {maps.map((map) => (
              <Tabs.Trigger key={map.id} value={`${maps.indexOf(map)}`}>
                {
                  strings.website.tools.tankopedia.visualizers.view_range[
                    map.string
                  ]
                }
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>
      </Flex>
    </Card>
  );
}
