import { Flex, Text } from '@radix-ui/themes';
import { times } from 'lodash';
import { ReactNode } from 'react';
import { TanksEmbedState } from '../app/tools/embed/customize/tanks/page';
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

interface TanksEmbedWrapperProps {
  children: ReactNode;
  state: TanksEmbedState;
}

export function TanksEmbedWrapper({ children, state }: TanksEmbedWrapperProps) {
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

interface TanksEmbedCardProps {
  tank: TankDefinition | null;
  state: TanksEmbedState;
}

export function TanksEmbedCard({ tank, state }: TanksEmbedCardProps) {
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
            state.cardTitleAutoColor
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
            {tank !== null && state.cardTitleAutoIcon && (
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
