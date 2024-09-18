import {
  asset,
  modelDefinitions,
  normalizeBoundingBox,
  resolveDpm,
  resolveNearPenetration,
  tankIcon,
  unionBoundingBox,
  type TankDefinition,
} from '@blitzkit/core';
import { useStore } from '@nanostores/react';
import { Flex, Text } from '@radix-ui/themes';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import Link from 'next/link';
import { use, useMemo } from 'react';
import { resolveReload } from '../../../core/blitzkit/resolveReload';
import { $tankopediaSort } from '../../../stores/tankopediaSort';
import { classIcons } from '../../ClassIcon';
import * as styles from './TankCard.css';

interface TankCardProps {
  tank: TankDefinition;
  onSelect?: (tank: TankDefinition) => void;
}

export function TankCard({ tank, onSelect }: TankCardProps) {
  const awaitedModelDefinitions = use(modelDefinitions);
  const Icon = classIcons[tank.class];
  const tankopediaSortBy = useStore($tankopediaSort).by;
  const discriminator = useMemo(() => {
    if (tankopediaSortBy.startsWith('meta')) return undefined;

    const turret = tank.turrets.at(-1)!;
    const gun = turret.guns.at(-1)!;
    const shell0 = gun.shells[0];
    const shell1 = gun.shells[1];
    const tracks = tank.tracks.at(-1)!;
    const engine = tank.engines.at(-1)!;
    const tankModelDefinition = awaitedModelDefinitions[tank.id];
    const turretModelDefinition = tankModelDefinition.turrets[turret.id];
    const gunModelDefinition = turretModelDefinition.guns[gun.id];

    switch (tankopediaSortBy) {
      case 'fire.aimTime':
        return gun.aimTime.toFixed(2);
      case 'fire.caliber':
        return shell0.caliber.toFixed(0);
      case 'fire.damage':
        return shell0.damage.armor.toFixed(0);
      case 'fire.dispersionMoving':
        return tracks.dispersion.move.toFixed(3);
      case 'fire.dispersionStill':
        return gun.dispersion.base.toFixed(3);
      case 'fire.dpm':
        return resolveDpm(gun, shell0).toFixed(0);
      case 'fire.dpmPremium':
        return shell1 ? resolveDpm(gun, shell1).toFixed(0) : '--';
      case 'fire.reload':
        return resolveReload(gun).toFixed(2);
      case 'fire.standardPenetration':
        return resolveNearPenetration(shell0.penetration).toFixed(0);
      case 'fire.premiumPenetration':
        return shell1
          ? resolveNearPenetration(shell1.penetration).toFixed(0)
          : '--';
      case 'fire.shellVelocity':
        return shell0.speed.toFixed(0);
      case 'fire.gunDepression':
        return (
          gunModelDefinition.pitch.max +
          (tankModelDefinition.turretRotation?.pitch ?? 0)
        ).toFixed(1);
      case 'fire.gunElevation':
        return (
          -gunModelDefinition.pitch.min -
          (tankModelDefinition.turretRotation?.pitch ?? 0)
        ).toFixed(1);
      case 'maneuverability.forwardsSpeed':
        return tank.speed.forwards.toFixed(0);
      case 'maneuverability.backwardsSpeed':
        return tank.speed.backwards.toFixed(0);
      case 'maneuverability.power':
        return engine.power.toFixed(0);
      case 'maneuverability.powerToWeight':
        return (
          (1000 * engine.power) /
          (tank.weight +
            engine.weight +
            tracks.weight +
            turret.weight +
            gun.weight)
        ).toFixed(1);
      case 'maneuverability.weight':
        return (
          (tank.weight +
            engine.weight +
            tracks.weight +
            turret.weight +
            gun.weight) /
          1000
        ).toFixed(1);
      case 'maneuverability.traverseSpeed':
        return tracks.traverseSpeed.toFixed(1);
      case 'survivability.health':
        return (tank.health + turret.health).toFixed(0);
      case 'survivability.viewRange':
        return turret.viewRange.toFixed(0);
      case 'survivability.camouflageStill':
        return (tank.camouflage.still * 100).toFixed(0);
      case 'survivability.camouflageMoving':
        return (tank.camouflage.moving * 100).toFixed(0);
      case 'survivability.camouflageShooting':
        return (tank.camouflage.still * gun.camouflageLoss * 100).toFixed(0);
      case 'survivability.volume': {
        const dimensions = normalizeBoundingBox(
          unionBoundingBox(
            tankModelDefinition.boundingBox,
            turretModelDefinition.boundingBox,
          ),
        );

        return (dimensions[0] * dimensions[1] * dimensions[2]).toFixed(0);
      }

      case 'survivability.length':
        return Math.max(
          ...normalizeBoundingBox(
            unionBoundingBox(
              tankModelDefinition.boundingBox,
              turretModelDefinition.boundingBox,
            ),
          ),
        ).toFixed(0);
    }
  }, [tankopediaSortBy]);

  return (
    <Text
      tabIndex={onSelect ? 0 : undefined}
      size="1"
      color={
        tank.treeType === 'collector'
          ? 'blue'
          : tank.treeType === 'premium'
            ? 'amber'
            : 'gray'
      }
      highContrast={tank.treeType === 'researchable'}
      onClick={onSelect ? () => onSelect(tank) : undefined}
      className={styles.card}
      style={assignInlineVars({
        [styles.cardBackgroundVar]: `top left / contain no-repeat url(${asset(
          `flags/scratched/${tank.nation}.webp`,
        )})`,
      })}
    >
      <Link
        className={styles.link}
        href={onSelect ? '#' : `/tools/tankopedia/${tank.id}`}
        prefetch={false}
      >
        <img alt={tank.name} src={tankIcon(tank.id)} className={styles.image} />

        <Flex
          justify="center"
          gap="1"
          align="center"
          overflow="hidden"
          width="100%"
        >
          <Icon className={styles.classIcon} />
          <Text align="center" className={styles.name}>
            {tank.name}
          </Text>
        </Flex>

        {discriminator && (
          <Text
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
        )}
      </Link>
    </Text>
  );
}
