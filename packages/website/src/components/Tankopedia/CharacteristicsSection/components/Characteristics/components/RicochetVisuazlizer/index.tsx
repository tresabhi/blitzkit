import { asset } from '@blitzkit/core';
import { literals } from '@blitzkit/i18n';
import { Box, Card, Text } from '@radix-ui/themes';
import { Var } from '../../../../../../../core/radix/var';
import { useLocale } from '../../../../../../../hooks/useLocale';
import { Duel } from '../../../../../../../stores/duel';
import type { VisualizerProps } from '../HullTraverseVisualizer';
import './index.css';

export function RicochetVisualizer({ stats }: VisualizerProps) {
  const ricochet = stats.shellRicochet ?? 90;
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
            opacity: 2 ** -3,
            backgroundImage: `url(/assets/images/tankopedia/visualizers/ricochet/armor-hash.png)`,
          }}
        />
      </Box>

      <Box
        width="100%"
        height="calc(100% * 2 / 3)"
        position="absolute"
        top="0"
        left="0"
        style={{
          backgroundColor: Var('gray-3'),
        }}
      >
        <Box
          width="100%"
          height="100%"
          style={{
            background: `
              conic-gradient(
                from -90deg at 25% 100%,
                transparent ${90 - ricochet}deg,
                ${Var('jade-a3')} ${90 - ricochet}deg,
                ${Var('jade-9')} ${90 + ricochet}deg,
                ${Var('tomato-8')} ${90 + ricochet}deg,
                ${Var('tomato-a3')} 180deg,
                transparent 180deg
              )
            `,
          }}
        />

        {/* <Box
          width="1px"
          height="100%"
          position="absolute"
          left="25%"
          top="0"
          style={{
            transform: 'translateX(-50%)',
            backgroundColor: Var('gray-11'),
          }}
        /> */}

        <Box
          width="3px"
          height="20rem"
          position="absolute"
          left="25%"
          bottom="0"
          style={{
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${ricochet}deg)`,
            background: `repeating-linear-gradient(${Var('gray-a4')}, ${Var('gray-12')} 15px, transparent 15px, transparent 30px)`,
          }}
        />

        <Box
          width="3px"
          height="20rem"
          position="absolute"
          left="25%"
          bottom="0"
          style={{
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(-${ricochet}deg)`,
            background: `repeating-linear-gradient(${Var('gray-10')}, ${Var('gray-a3')} 15px, transparent 15px, transparent 30px)`,
          }}
        />

        <Box
          className="ricochet-visualizer-surface-impact"
          position="absolute"
          bottom="0"
          left="25%"
          style={{
            transform: `translate(-50%, 50%) rotate(${ricochet}deg)`,
            background: `radial-gradient(${Var('gray-a2')}, ${Var('gray-a9')})`,
            borderRadius: '50%',
          }}
        />

        <Box
          width="2rem"
          position="absolute"
          height="2rem"
          left="25%"
          bottom="0"
          style={{
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${ricochet / 2}deg)`,
          }}
        >
          <img
            className="ricochet-visualizer-penetrating-shell"
            src={asset(`icons/shells/${shell.icon}.webp`)}
            style={{
              objectFit: 'contain',
              transform: 'rotate(135deg)',
              width: '100%',
              height: '100%',
            }}
          />
        </Box>

        <Box
          className="ricochet-visualizer-ricocheting-shell-container"
          width="2rem"
          position="absolute"
          height="2rem"
          left="25%"
          bottom="0"
          style={{
            transformOrigin: 'bottom center',
          }}
        >
          <img
            className="ricochet-visualizer-ricocheting-shell"
            src={asset(`icons/shells/${shell.icon}.webp`)}
            style={{
              objectFit: 'contain',
              transform: 'translateY(50%) rotate(135deg)',
              width: '100%',
              height: '100%',
            }}
          />
        </Box>

        <Text
          color="gray"
          style={{
            position: 'absolute',
            left: '30%',
            bottom: '40%',
            transform: 'translateX(-50%)',
          }}
        >
          {literals(
            strings.website.tools.tankopedia.visualizers.ricochet.safe,
            [(2 * ricochet).toFixed(0)],
          )}
        </Text>

        <Text
          color="gray"
          style={{
            position: 'absolute',
            right: '5%',
            bottom: '12%',
          }}
        >
          {literals(
            strings.website.tools.tankopedia.visualizers.ricochet.unsafe,
            [(90 - ricochet).toFixed(0)],
          )}
        </Text>
      </Box>
    </Card>
  );
}
