import { TankType } from '@blitzkit/core';
import { Box, Heading } from '@radix-ui/themes';
import { Var } from '../../../../../core/radix/var';
import { useLocale } from '../../../../../hooks/useLocale';
import { Duel } from '../../../../../stores/duel';
import type { RadixColor } from '../../../../../stores/embedState';
import { TankopediaEphemeral } from '../../../../../stores/tankopediaEphemeral';

interface TitleProps {
  outline?: boolean;
}

export const NATION_COLORS: Record<
  string,
  {
    text: RadixColor;
    background: RadixColor[];
  }
> = {
  france: { text: 'mint', background: ['mint', 'cyan', 'jade'] },
  germany: { text: 'sage', background: ['slate', 'sage', 'mauve'] },
  usa: { text: 'gold', background: ['brown', 'gold', 'gray'] },
  european: { text: 'gold', background: ['bronze', 'gold', 'brown'] },
  ussr: { text: 'bronze', background: ['bronze', 'tomato', 'bronze'] },
  uk: { text: 'gold', background: ['bronze', 'gold', 'brown'] },
  japan: { text: 'jade', background: ['green', 'teal', 'jade'] },
  china: { text: 'teal', background: ['green', 'teal', 'jade'] },
  other: { text: 'amber', background: ['amber', 'yellow', 'gray'] },
};

export function Title({ outline }: TitleProps) {
  const { unwrap } = useLocale();
  const protagonist = Duel.use((state) => state.protagonist.tank);
  const disturbed = TankopediaEphemeral.use((state) => state.disturbed);
  const revealed = TankopediaEphemeral.use((state) => state.revealed);
  const nationColors = NATION_COLORS[protagonist.nation];
  const color = Var(
    disturbed
      ? protagonist.type === TankType.COLLECTOR
        ? 'blue-11'
        : protagonist.type === TankType.PREMIUM
          ? 'amber-11'
          : 'gray-12'
      : `${nationColors.text}-12`,
  );
  const name = unwrap(protagonist.name);

  return (
    <Box
      position="absolute"
      top={disturbed ? '8' : '50%'}
      left="50%"
      style={{
        transitionDuration: '1s',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <Heading
        weight="bold"
        style={{
          userSelect: 'none',
          pointerEvents: 'none',
          fontSize: revealed
            ? disturbed
              ? '2rem'
              : `${125 / name.length}vw`
            : `${75 / name.length}vw`,
          whiteSpace: 'nowrap',
          color: outline ? 'transparent' : color,
          WebkitTextStroke: outline
            ? `${revealed ? (disturbed ? '1px' : 'min(2px, 0.2vw)') : 0} ${color}`
            : undefined,
          letterSpacing: disturbed || !revealed ? 0 : '-0.03em',
          transition: `
          letter-spacing 1s ease ${disturbed ? '0s' : '1s'},
          font-size 1s,
          -webkit-text-stroke 1.5s
        `,
        }}
        wrap="nowrap"
      >
        {name}
      </Heading>
    </Box>
  );
}
