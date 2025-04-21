import { asset } from '@blitzkit/core';
import { literals } from '@blitzkit/i18n';
import { Box, Card, Text } from '@radix-ui/themes';
import { Var } from '../../../../../../core/radix/var';
import { useLocale } from '../../../../../../hooks/useLocale';
import { Duel } from '../../../../../../stores/duel';
import type { VisualizerProps } from './HullTraverseVisualizer';

export function RicochetVisualizer({ stats }: VisualizerProps) {
  const ricochet = stats.shellRicochet ?? 90;
  const normalization = stats.shellNormalization;
  const shell = Duel.use((state) => state.protagonist.shell);
  const { strings } = useLocale();

  return (
    <Card
      variant="classic"
      style={{
        aspectRatio: '2 / 1',
      }}
      mb="6"
    >
      <Box
        width="100%"
        height="calc(100% * 2 / 3)"
        position="absolute"
        top="0"
        left="0"
        style={{
          backgroundColor: Var('gray-11'),
          overflow: 'hidden',
        }}
      >
        <Box
          width="100%"
          height="100%"
          style={{
            background: `
              conic-gradient(
                from -90deg at 25% 100%,
                transparent 0deg ${90 - ricochet - normalization}deg,
                ${Var('jade-a1')} ${90 - ricochet - normalization}deg ${90 - ricochet - normalization}deg,
                ${Var('jade-11')}  ${90 + ricochet}deg,
                ${Var('amber-9')} ${90 + ricochet}deg ${90 + ricochet + normalization}deg,
                ${Var('tomato-10')} ${90 + ricochet + normalization}deg,
                ${Var('tomato-11')} 180deg,
                transparent 180deg
              )
            `,
          }}
        />
        <Box
          position="absolute"
          bottom="0"
          left="25%"
          width="3rem"
          height="3rem"
          style={{
            transform: `translate(-50%, 50%) rotate(${ricochet + normalization}deg)`,
            background: `radial-gradient(${Var('gray-a5')}, ${Var('gray-a11')})`,
            borderRadius: '50%',
          }}
        >
          <img
            src={asset(`icons/shells/${shell.icon}.webp`)}
            style={{
              width: '2rem',
              height: '2rem',
              objectFit: 'contain',
              transform: 'translate(-50%, -50%) rotate(135deg)',
              position: 'absolute',
              top: '-10rem',
              left: '50%',
            }}
          />
        </Box>
      </Box>

      <Box
        width="100%"
        height="calc(100% / 3)"
        position="absolute"
        bottom="0"
        left="0"
        style={{
          background: `linear-gradient(${Var('gray-a4')}, ${Var('gray-a1')})`,
        }}
      >
        <Box
          width="100%"
          height="100%"
          style={{
            opacity: 2 ** -4,
            backgroundImage: `url(/assets/images/tankopedia/visualizers/ricochet/armor-hash.png)`,
          }}
        />

        <Text
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          color="gray"
        >
          {literals(strings.website.tools.tankopedia.visualizers.ricochet.max, [
            (ricochet + normalization).toFixed(0),
          ])}
        </Text>
      </Box>
    </Card>
  );
}
