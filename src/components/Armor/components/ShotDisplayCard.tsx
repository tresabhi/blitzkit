import { Card, Flex, Inset, Separator, Text } from '@radix-ui/themes';
import { ComponentProps } from 'react';
import { radToDeg } from 'three/src/math/MathUtils';
import * as TankopediaEphemeral from '../../../stores/tankopediaEphemeral';
import { shotStatusColors } from './ShotDisplay';
import { ArmorType } from './SpacedArmorScene';
import { ExternalModuleVariant } from './SpacedArmorSceneComponent';

export const layerTypeNames: Record<ArmorType | 'null', string> = {
  [ArmorType.Core]: 'Core',
  [ArmorType.Spaced]: 'Spaced',
  [ArmorType.External]: 'External',
  null: 'Gap',
};

const externalLayerNames: Record<ExternalModuleVariant, string> = {
  gun: 'Gun',
  track: 'Tracks',
};

const shotStatusNames: Record<TankopediaEphemeral.ShotStatus, string> = {
  blocked: 'Blocked',
  ricochet: 'Ricochet',
  penetration: 'penetration',
  splash: 'splash',
};

function LayerEntry({
  layerIndex,
  shotStatusColor,
  layerName,
  layer,
  angle,
}: {
  layerIndex?: string;
  shotStatusColor: ComponentProps<typeof Text>['color'];
  layerName: string;
  layer: TankopediaEphemeral.ShotLayer;
  angle?: number;
}) {
  return (
    <Flex align="center" gap="2">
      <Text
        size="1"
        color="gray"
        style={{
          width: 12,
        }}
      >
        {layerIndex}
      </Text>
      <Text size="2" color={shotStatusColor} style={{ width: 47 }}>
        {layerName}
      </Text>

      {layer.type === null && (
        <>
          <Text
            size="2"
            color={shotStatusColor}
            style={{
              width: 64,
            }}
          >
            {Math.round(layer.distance * 1000).toLocaleString()}
            <Text size="1">mm</Text>
          </Text>

          <Text size="2" color="gray">
            {Math.max(-100, Math.round(-50 * layer.distance))}% penetration
          </Text>
        </>
      )}

      {layer.type === ArmorType.External && (
        <Text
          size="2"
          color={shotStatusColor}
          style={{
            width: 64,
          }}
        >
          {Math.round(layer.thickness).toLocaleString()}
          <Text size="1">mm</Text>
        </Text>
      )}

      {(layer.type === ArmorType.Core || layer.type === ArmorType.Spaced) && (
        <>
          <Text
            size="2"
            color={shotStatusColor}
            style={{
              width: 80,
            }}
          >
            {Math.round(layer.thicknessAngled).toLocaleString()}
            <Text size="1">{`mm${angle === undefined ? '' : ` ${Math.round(radToDeg(angle))}°`}`}</Text>
          </Text>

          <Text size="2" color="gray">
            {Math.round(layer.thickness).toLocaleString()}
            <Text size="1">mm</Text> nominal
          </Text>
        </>
      )}
    </Flex>
  );
}

interface ShotDisplayCardProps {
  shot: TankopediaEphemeral.Shot;
}

export function ShotDisplayCard({ shot }: ShotDisplayCardProps) {
  if (!shot) return null;

  const outTitleColor = shot.out
    ? shotStatusColors[shot.out.status]
    : undefined;
  const inTitleColor = shotStatusColors[shot.in.status];

  return (
    <Card style={{ width: 300 }}>
      <Flex direction="column" gap="2">
        <Flex direction="column" gap="1">
          <Text color={inTitleColor} weight="bold">
            {shot.in.status !== 'blocked' && shot.in.status !== 'ricochet' && (
              <>
                {Math.round(shot.damage).toLocaleString()}
                <Text size="1">hp</Text>
              </>
            )}
            {` ${shotStatusNames[shot.in.status]} `}
          </Text>

          <Flex direction="column">
            {shot.in.layers.map((layer, index) => {
              const layerName =
                layer.type === ArmorType.External
                  ? externalLayerNames[layer.variant]
                  : layerTypeNames[`${layer.type}`];
              const layerIndex =
                layer.type === null
                  ? undefined
                  : `${(shot.containsGaps ? index / 2 : index) + 1}.`;
              const shotStatusColor =
                shot.in.status === 'splash'
                  ? shotStatusColors.splash
                  : shotStatusColors[layer.status];

              return (
                <LayerEntry
                  key={index}
                  layer={layer}
                  layerIndex={layerIndex}
                  layerName={layerName}
                  shotStatusColor={shotStatusColor}
                  angle={
                    layer.type === ArmorType.Core ||
                    layer.type === ArmorType.Spaced
                      ? layer.angle
                      : undefined
                  }
                />
              );
            })}
          </Flex>
        </Flex>

        {shot.out && shot.out.layers.length > 0 && (
          <>
            <Inset side="x">
              <Flex align="center" gap="2">
                <Separator
                  style={{
                    flex: 1,
                  }}
                />
                <Text size="1" color="gray">
                  ricochet (-25% penetration)
                </Text>
                <Separator
                  style={{
                    flex: 1,
                  }}
                />
              </Flex>
            </Inset>

            <Text color={outTitleColor} weight="bold">
              {shot.out.status !== 'blocked' &&
                shot.out.status !== 'ricochet' && (
                  <>
                    {Math.round(shot.damage).toLocaleString()}
                    <Text size="1">hp</Text>
                  </>
                )}
              {` ${shotStatusNames[shot.out.status]} `}
            </Text>

            <Flex direction="column">
              {shot.out.layers.map((layer, index) => {
                const layerName =
                  layer.type === ArmorType.External
                    ? externalLayerNames[layer.variant]
                    : layerTypeNames[`${layer.type}`];
                const shiftedIndex = index + shot.out!.layers.length;
                const layerIndex =
                  layer.type === null
                    ? undefined
                    : `${(shot.containsGaps ? shiftedIndex / 2 : shiftedIndex) + 1}.`;
                const shotStatusColor =
                  shot.out!.status === 'splash'
                    ? shotStatusColors.splash
                    : shotStatusColors[layer.status];

                return (
                  <LayerEntry
                    key={index}
                    layer={layer}
                    layerIndex={layerIndex}
                    layerName={layerName}
                    shotStatusColor={shotStatusColor}
                    angle={
                      layer.type === ArmorType.Core ||
                      layer.type === ArmorType.Spaced
                        ? layer.angle
                        : undefined
                    }
                  />
                );
              })}
            </Flex>
          </>
        )}
      </Flex>
    </Card>
  );
}
