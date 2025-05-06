import { TankType } from '@blitzkit/core';
import { Heading } from '@radix-ui/themes';
import { clamp } from 'three/src/math/MathUtils.js';
import { Var, type VarName } from '../../../../../core/radix/var';
import { useLocale } from '../../../../../hooks/useLocale';
import { Duel } from '../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../stores/tankopediaEphemeral';

interface TitleProps {
  outline?: boolean;
}

export function Title({ outline }: TitleProps) {
  const { unwrap } = useLocale();
  const protagonist = Duel.use((state) => state.protagonist.tank);
  const disturbed = TankopediaEphemeral.use((state) => state.disturbed);
  const revealed = TankopediaEphemeral.use((state) => state.revealed);
  const treeColor =
    protagonist.type === TankType.COLLECTOR
      ? 'blue'
      : protagonist.type === TankType.PREMIUM
        ? 'amber'
        : undefined;
  const name = unwrap(protagonist.name);

  return (
    <Heading
      weight="bold"
      style={{
        position: 'absolute',
        top: '50%',
        marginLeft: disturbed ? '2rem' : 0,
        left: disturbed ? 0 : '50%',
        transform: disturbed ? 'translate(0, -50%)' : 'translate(-50%, -50%)',
        userSelect: 'none',
        pointerEvents: 'none',
        transitionDuration: '1s',
        fontSize: disturbed
          ? '3rem'
          : `${16 * clamp(12 / name.length, 0, 1)}rem`,
        color: outline ? Var('gray-a7') : undefined,
        WebkitTextStroke: outline
          ? `${disturbed ? '1px' : '2px'} ${Var(
              `${treeColor ? (`${treeColor}-11` satisfies VarName) : 'gray-12'}`,
            )}`
          : undefined,
        letterSpacing: disturbed ? 0 : '-0.06em',
      }}
      color={treeColor}
      wrap="nowrap"
    >
      {name}
    </Heading>
  );
}
