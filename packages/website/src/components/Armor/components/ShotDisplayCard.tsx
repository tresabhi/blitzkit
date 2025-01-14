import {
  Card,
  Flex,
  Inset,
  Separator,
  Text,
  type CardProps,
} from '@radix-ui/themes';
import type { ComponentProps } from 'react';
import { radToDeg } from 'three/src/math/MathUtils.js';
import { literals } from '../../../core/i18n/literals';
import { useLocale } from '../../../hooks/useLocale';
import type { Shot, ShotLayer } from '../../../stores/tankopediaEphemeral';
import { shotStatusColors } from './ShotDisplay';
import { ArmorType } from './SpacedArmorScene';

export const layerTypeNames = {
  [ArmorType.Primary]: 'primary',
  [ArmorType.Spaced]: 'spaced',
  [ArmorType.External]: 'external',
  null: 'gap',
} as const;

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
  layer: ShotLayer;
  angle?: number;
}) {
  const { locale, strings } = useLocale();

  return (
    <Flex align="center" gap="2">
      <Text size="1" color="gray" style={{ width: 12 }}>
        {layerIndex}
      </Text>
      <Text size="2" color={shotStatusColor} style={{ width: 48 }}>
        {layerName}
      </Text>

      {layer.type === null && (
        <>
          <Text size="2" color={shotStatusColor} style={{ width: 64 }}>
            {literals(strings.common.units_suffix.mm, [
              Math.round(layer.distance * 1000).toLocaleString(locale),
            ])}
          </Text>

          <Text size="2" color="gray">
            {literals(
              strings.website.tools.tankopedia.sandbox.dynamic.shot_card.stats
                .ricochet_loss,
              [Math.max(-100, -50 * layer.distance).toFixed(0)],
            )}
          </Text>
        </>
      )}

      {layer.type === ArmorType.External && (
        <Text size="2" color={shotStatusColor} style={{ width: 64 }}>
          {literals(strings.common.units_suffix.mm, [
            Math.round(layer.thickness).toLocaleString(locale),
          ])}
        </Text>
      )}

      {(layer.type === ArmorType.Primary ||
        layer.type === ArmorType.Spaced) && (
        <>
          <Text size="2" color={shotStatusColor} style={{ width: 80 }}>
            {literals(
              angle === undefined
                ? strings.common.units_suffix.mm
                : strings.website.tools.tankopedia.sandbox.dynamic.shot_card
                    .stats.thickness_and_angle,
              [
                Math.round(layer.thicknessAngled).toLocaleString(locale),
                radToDeg(angle ?? 0).toFixed(0),
              ],
            )}
          </Text>

          <Text size="2" color="gray">
            {literals(
              strings.website.tools.tankopedia.sandbox.dynamic.shot_card.stats
                .nominal,
              [Math.round(layer.thickness).toLocaleString(locale)],
            )}
          </Text>
        </>
      )}
    </Flex>
  );
}

interface ShotDisplayCardProps extends CardProps {
  shot: Shot;
}

export function ShotDisplayCard({ shot, ...props }: ShotDisplayCardProps) {
  const { locale, strings } = useLocale();

  if (!shot) return null;

  const outTitleColor = shot.out
    ? shotStatusColors[shot.out.status]
    : undefined;
  const inTitleColor = shotStatusColors[shot.in.status];

  return (
    <Card style={{ width: 300 }} {...props}>
      <Flex direction="column" gap="2">
        <Flex direction="column" gap="1">
          <Text color={inTitleColor} weight="bold">
            {literals(
              strings.website.tools.tankopedia.sandbox.dynamic.shot_card.status[
                shot.in.status
              ],
              [Math.round(shot.damage).toLocaleString(locale)],
            )}
          </Text>

          <Flex direction="column">
            {shot.in.layers.map((layer, index) => {
              const layerName =
                strings.website.tools.tankopedia.sandbox.dynamic.shot_card
                  .element[
                  layer.type === ArmorType.External
                    ? layer.variant
                    : layerTypeNames[`${layer.type}`]
                ];
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
                    layer.type === ArmorType.Primary ||
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
              {literals(
                strings.website.tools.tankopedia.sandbox.dynamic.shot_card
                  .status[shot.out.status],
                [Math.round(shot.damage).toLocaleString(locale)],
              )}
            </Text>

            <Flex direction="column">
              {shot.out.layers.map((layer, index) => {
                const layerName =
                  strings.website.tools.tankopedia.sandbox.dynamic.shot_card
                    .element[
                    layer.type === ArmorType.External
                      ? layer.variant
                      : layerTypeNames[`${layer.type}`]
                  ];
                const shiftedIndex = index + shot.out!.layers.length;
                const layerIndex =
                  layer.type === null
                    ? undefined
                    : `${
                        (shot.containsGaps ? shiftedIndex / 2 : shiftedIndex) +
                        1
                      }.`;
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
                      layer.type === ArmorType.Primary ||
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
