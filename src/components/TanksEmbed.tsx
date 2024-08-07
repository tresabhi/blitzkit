import { Flex, Text } from '@radix-ui/themes';
import { times } from 'lodash';
import { ReactNode } from 'react';
import { BreakdownEmbedState } from '../app/tools/embed/customize/breakdown/page';
import {
  toColorVar,
  toRadiusVar,
  toWidthVar,
} from '../app/tools/embed/utilities';
import { TankDefinition } from '../core/blitzkit/tankDefinitions';
import { ClassHeavy } from './ClassIcon/components/ClassHeavy';
import { ClassLight } from './ClassIcon/components/ClassLight';
import { ClassMedium } from './ClassIcon/components/ClassMedium';
import { ClassTankDestroyer } from './ClassIcon/components/ClassTankDestroyer';

interface BreakdownEmbedWrapperProps {
  children: ReactNode;
  state: BreakdownEmbedState;
}

export function BreakdownEmbedWrapper({
  children,
  state,
}: BreakdownEmbedWrapperProps) {
  return (
    <Flex
      direction="column"
      gap={state.listGap}
      width={toWidthVar(state.listWidth)}
    >
      {children}
    </Flex>
  );
}

interface BreakdownEmbedCardProps {
  tank: TankDefinition | null;
  state: BreakdownEmbedState;
}

export function BreakdownEmbedCard({ tank, state }: BreakdownEmbedCardProps) {
  const { color: cardTitleColor, ...restCardTitleProps } = state.cardTitle;
  return (
    <Flex
      direction="column"
      style={{
        borderRadius: toRadiusVar(state.cardRadius),
        overflow: 'hidden',
        backgroundColor: toColorVar(state.cardBodyBackgroundColor),
      }}
    >
      <Flex
        justify="center"
        style={{
          backgroundColor: toColorVar(state.cardHeaderBackgroundColor),
        }}
        p={state.cardHeaderPadding}
      >
        <Text
          color={
            state.cardTitleTypeColor
              ? tank === null
                ? cardTitleColor
                : tank.treeType === 'collector'
                  ? 'blue'
                  : tank.treeType === 'premium'
                    ? 'amber'
                    : cardTitleColor
              : cardTitleColor
          }
          {...restCardTitleProps}
        >
          <Flex align="center" gap="1">
            {tank !== null && state.cardTitleClassIcon && (
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

      <Flex p={state.cardBodyPadding}>
        {times(4, (index) => {
          const column = (index + 1) as 1 | 2 | 3 | 4;

          return (
            <Flex
              direction="column"
              align="center"
              gap={state.columnGap}
              flexGrow="1"
            >
              <Text {...state.columnValue}>
                70{state[`column${column}Unit`]}
              </Text>
              <Text {...state.columnLabel}>
                {state[`column${column}Label`]}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}
