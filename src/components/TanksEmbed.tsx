import { amberDark, blueDark } from '@radix-ui/colors';
import { Flex, Text } from '@radix-ui/themes';
import { times } from 'lodash';
import { ReactNode } from 'react';
import { useEmbedStateCurry } from '../../packages/website/src/stores/embedState/utilities';
import { breakdownConfig } from '../app/tools/embed/configurations/breakdown';
import { toRadiusVar } from '../app/tools/embed/utilities';
import { TankDefinition } from '../core/blitzkit/tankDefinitions';
import { previewCompositeStat } from '../core/statistics/compositeStats';
import { CompositeStatsKey } from '../core/statistics/compositeStats/constants';
import strings from '../lang/en-US.json';
import { ClassHeavy } from './ClassIcon/components/ClassHeavy';
import { ClassLight } from './ClassIcon/components/ClassLight';
import { ClassMedium } from './ClassIcon/components/ClassMedium';
import { ClassTankDestroyer } from './ClassIcon/components/ClassTankDestroyer';

interface BreakdownEmbedWrapperProps {
  children: ReactNode;
}

export function BreakdownEmbedWrapper({
  children,
}: BreakdownEmbedWrapperProps) {
  const { useState } = useEmbedStateCurry<typeof breakdownConfig>();

  return (
    <Flex direction="column" gap={useState('listGap')} height="100%">
      {children}
    </Flex>
  );
}

interface BreakdownEmbedCardProps {
  tank: TankDefinition | null;
}

export function BreakdownEmbedCard({ tank }: BreakdownEmbedCardProps) {
  const { useState, useRichText } =
    useEmbedStateCurry<typeof breakdownConfig>();

  return (
    <Flex
      flexShrink="0"
      direction="column"
      style={{
        borderRadius: toRadiusVar(useState('cardRadius')),
        overflow: 'hidden',
        backgroundColor: useState('cardBodyBackgroundColor'),
      }}
    >
      <Flex
        justify="center"
        style={{
          backgroundColor: useState('cardHeaderBackgroundColor'),
        }}
        p={useState('cardHeaderPadding')}
      >
        <Text
          {...{
            ...useRichText('cardTitle'),
            style:
              tank === null
                ? undefined
                : tank.treeType === 'researchable' ||
                    !useState('cardTitleTypeColor')
                  ? undefined
                  : {
                      color:
                        tank.treeType === 'premium'
                          ? amberDark.amber11
                          : blueDark.blue11,
                    },
          }}
        >
          <Flex align="center" gap="1">
            {useState('cardTitleClassIcon') && tank !== null && (
              <>
                {tank.class === 'lightTank' && (
                  <ClassLight width="1em" height="1em" />
                )}
                {tank.class === 'mediumTank' && (
                  <ClassMedium width="1em" height="1em" />
                )}
                {tank.class === 'heavyTank' && (
                  <ClassHeavy width="1em" height="1em" />
                )}
                {tank.class === 'AT-SPG' && (
                  <ClassTankDestroyer width="1em" height="1em" />
                )}
              </>
            )}{' '}
            {tank === null ? 'Total' : tank.name}
          </Flex>
        </Text>
      </Flex>

      <Flex p={useState('cardBodyPadding')}>
        {times(4, (index) => {
          const column = (index + 1) as 1 | 2 | 3 | 4;
          const columnState = useState(`column${column}`) as CompositeStatsKey;
          const customLabel = useState(`column${column}CustomLabel`);

          return (
            <Flex
              direction="column"
              align="center"
              gap={useState('columnGap')}
              flexGrow="1"
            >
              <Text {...useRichText('columnValue')}>
                {previewCompositeStat(columnState)}
              </Text>
              <Text {...useRichText('columnLabel')}>
                {customLabel.length === 0
                  ? strings.common.composite_stats[columnState]
                  : customLabel}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}
