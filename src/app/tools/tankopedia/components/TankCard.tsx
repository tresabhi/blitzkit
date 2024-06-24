import { Flex, Text } from '@radix-ui/themes';
import { Icon } from '@radix-ui/themes/dist/cjs/components/callout';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { useEffect, useRef } from 'react';
import { Link } from '../../../../components/Link';
import { asset } from '../../../../core/blitzkit/asset';
import { TankDefinition } from '../../../../core/blitzkit/tankDefinitions';
import { tankIcon } from '../../../../core/blitzkit/tankIcon';
import { tankopediaFilterTank } from '../../../../core/blitzkit/tankopediaFilterTank';
import { useTankopediaFilters } from '../../../../stores/tankopediaFilters';
import * as styles from './TankCard.css';

interface TankCardProps {
  tank: TankDefinition;
}

export function TankCard({ tank }: TankCardProps) {
  // const awaitedModelDefinitions = use(modelDefinitions);
  // const Icon = classIcons[tank.class];
  const link = useRef<HTMLAnchorElement>(null);
  // const sortBy = useTankopediaFilters((state) => state.sort.by);
  // const discriminator = useMemo(() => {
  //   if (sortBy.startsWith('meta')) return undefined;

  //   const turret = tank.turrets.at(-1)!;
  //   const gun = turret.guns.at(-1)!;
  //   const shell = gun.shells[0];
  //   const tracks = tank.tracks.at(-1)!;
  //   const tankModelDefinition = awaitedModelDefinitions[tank.id];

  //   switch (sortBy) {
  //     case 'fire.aimTime':
  //       return `${gun.aimTime.toFixed(2)}s`;
  //     case 'fire.caliber':
  //       return `${shell.caliber.toFixed(0)}mm`;
  //     case 'fire.damage':
  //       return `${shell.damage.armor.toFixed(0)}hp`;
  //     case 'fire.dispersionMoving':
  //       return `+ ${tracks.dispersion.move.toFixed(3)}`;
  //     case 'fire.dispersionStill':
  //       return gun.dispersion.base.toFixed(3);
  //     case 'fire.dpm':
  //       return resolveDpm(gun, shell).toFixed(0);
  //     case 'fire.gunDepression':
  //       return awaitedModelDefinitions;
  //   }
  // }, [sortBy]);

  useEffect(() => {
    const unsubscribe = useTankopediaFilters.subscribe((filters) => {
      if (!link.current) return;

      const visible = tankopediaFilterTank(filters, tank);
      link.current.style.display = visible ? 'flex' : 'none';
    });

    return unsubscribe;
  }, []);

  return (
    <Link
      ref={link}
      size="1"
      color={
        tank.treeType === 'collector'
          ? 'blue'
          : tank.treeType === 'premium'
            ? 'amber'
            : 'gray'
      }
      highContrast={tank.treeType === 'researchable'}
      underline="hover"
      href={`/tools/tankopedia/${tank.id}`}
      className={styles.card}
      style={assignInlineVars({
        [styles.cardBackgroundVar]: `top left / contain no-repeat url(${asset(`flags/scratched/${tank.nation}.webp`)})`,
      })}
    >
      <img alt={tank.name} src={tankIcon(tank.id)} className={styles.image} />

      <Flex
        justify="center"
        gap="1"
        align="center"
        overflow="hidden"
        width="100%"
        maxWidth="100%"
      >
        <Icon className={styles.classIcon} />
        <Text align="center" className={styles.name}>
          {tank.name}
        </Text>
      </Flex>

      {/* {discriminator && (
        <Text
          mt="-2"
          color="gray"
          align="center"
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {discriminator}
        </Text>
      )} */}
    </Link>
  );
}
