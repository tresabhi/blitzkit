import { Flex, Text } from '@radix-ui/themes';
import { times } from 'lodash';
import { ReactNode } from 'react';
import { breakdownConfig } from '../app/tools/embed/configurations/breakdown';
import { toRadiusVar } from '../app/tools/embed/utilities';
import { TankDefinition } from '../core/blitzkit/tankDefinitions';
import { useEmbedStateCurry } from '../stores/embedState/utilities';
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
    <Flex
      direction="column"
      gap={useState('listGap')}
      width={`${useState('listWidth')}px`}
    >
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
  const { color: cardTitleColor, ...restCardTitleProps } =
    useState('cardTitle');

  return (
    <Flex
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
          style={{
            color: useState('cardTitleTypeColor')
              ? tank === null
                ? cardTitleColor
                : tank.treeType === 'collector'
                  ? 'blue'
                  : tank.treeType === 'premium'
                    ? 'amber'
                    : cardTitleColor
              : cardTitleColor,
          }}
          {...restCardTitleProps}
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

          return (
            <Flex
              direction="column"
              align="center"
              gap={useState('columnGap')}
              flexGrow="1"
            >
              <Text {...useRichText('columnValue')}>
                70{useState(`column${column}Unit`)}
              </Text>
              <Text {...useRichText('columnLabel')}>
                {useState(`column${column}Label`)}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}
