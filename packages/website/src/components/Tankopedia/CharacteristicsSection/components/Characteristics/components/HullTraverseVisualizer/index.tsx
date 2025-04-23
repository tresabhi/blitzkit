import { Card, Checkbox, Flex, Tabs, Text } from '@radix-ui/themes';
import { useRef, useState } from 'react';
import type { TankCharacteristics } from '../../../../../../../core/blitzkit/tankCharacteristics';
import { useLocale } from '../../../../../../../hooks/useLocale';
import './index.css';

export interface StatsAcceptorProps {
  stats: TankCharacteristics;
}

type Terrain = 'Hard' | 'Medium' | 'Soft';

export function HullTraverseVisualizer({ stats }: StatsAcceptorProps) {
  const hull = useRef<HTMLDivElement>(null);
  const turret = useRef<HTMLImageElement>(null);
  const [terrain, setTerrain] = useState<Terrain>('Hard');
  const [rotateHull, setRotateHull] = useState(true);
  const [rotateTurret, setRotateTurret] = useState(true);
  const { strings } = useLocale();
  const isTurretless =
    stats.azimuthLeft !== undefined || stats.azimuthRight !== undefined;

  return (
    <Card variant="classic" style={{ aspectRatio: '1 / 1' }}>
      <div
        ref={hull}
        className="hull-traverse-visualizer"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animationDuration: `${
            rotateHull ? 360 / stats[`hullTraverse${terrain}Terrain`] : 0
          }s`,
        }}
      >
        <img
          style={{
            width: isTurretless ? '22rem' : '12rem',
            height: isTurretless ? '22rem' : '12rem',
            objectFit: 'contain',
            filter: 'drop-shadow(0px 0px 4px black)',
          }}
          src={`/assets/images/tankopedia/visualizers/hull-traverse/hull${isTurretless ? '-only' : ''}.png`}
        />

        {!isTurretless && (
          <img
            ref={turret}
            className="hull-traverse-visualizer"
            style={{
              width: '27rem',
              height: '27rem',
              objectFit: 'contain',
              position: 'absolute',
              top: '50%',
              left: '50%',
              filter: 'drop-shadow(0px 0px 4px black)',
              transform: 'translate(-50%, -50%)',
              animationDuration: `${
                rotateTurret ? 360 / stats.turretTraverseSpeed : 0
              }s`,
            }}
            src="/assets/images/tankopedia/visualizers/hull-traverse/turret.png"
          />
        )}
      </div>

      <Flex
        position="absolute"
        bottom="0"
        left="50%"
        style={{
          transform: 'translateX(-50%)',
        }}
      >
        <Tabs.Root
          value={terrain}
          onValueChange={(terrain) => setTerrain(terrain as Terrain)}
        >
          <Tabs.List>
            <Tabs.Trigger value="Hard">
              {strings.website.tools.tankopedia.visualizers.rotator.hard}
            </Tabs.Trigger>
            <Tabs.Trigger value="Medium">
              {strings.website.tools.tankopedia.visualizers.rotator.medium}
            </Tabs.Trigger>
            <Tabs.Trigger value="Soft">
              {strings.website.tools.tankopedia.visualizers.rotator.soft}
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </Flex>

      {!isTurretless && (
        <Flex
          position="absolute"
          top="4"
          left="50%"
          gap="5"
          style={{
            transform: 'translateX(-50%)',
            userSelect: 'none',
          }}
        >
          <Flex
            align="center"
            gap="2"
            onClick={() => setRotateHull((state) => !state)}
            style={{ cursor: 'pointer' }}
          >
            <Checkbox variant="classic" checked={rotateHull} />
            <Text size="2">
              {strings.website.tools.tankopedia.visualizers.rotator.hull}
            </Text>
          </Flex>

          <Flex
            align="center"
            gap="2"
            onClick={() => setRotateTurret((state) => !state)}
            style={{ cursor: 'pointer' }}
          >
            <Checkbox variant="classic" checked={rotateTurret} />
            <Text size="2">
              {strings.website.tools.tankopedia.visualizers.rotator.turret}
            </Text>
          </Flex>
        </Flex>
      )}
    </Card>
  );
}
