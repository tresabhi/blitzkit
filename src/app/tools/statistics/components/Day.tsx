import { CaretDownIcon, CaretRightIcon } from '@radix-ui/react-icons';
import { Button, Flex, Table, Text } from '@radix-ui/themes';
import { random } from 'lodash';
import { use, useMemo, useState } from 'react';
import { tankDefinitions } from '../../../../core/blitzkrieg/tankDefinitions';
import { tankIcon } from '../../../../core/blitzkrieg/tankIcon';

interface DayProps {
  offset: number;
}

export function Day({ offset }: DayProps) {
  const awaitedTankDefinitions = use(tankDefinitions);
  const tanksList = useMemo(
    () => Object.values(awaitedTankDefinitions),
    [awaitedTankDefinitions],
  );
  const [expanded, setExpanded] = useState(true);
  const time = new Date(Date.now() - offset * 24 * 60 * 60 * 1000);
  const tanks = tanksList
    .filter((tank) => tank.tier === 10)
    .sort(() => Math.random() - 0.5)
    .slice(0, random(2, 5));

  return (
    <>
      <Table.Row>
        <Table.RowHeaderCell>
          <Button
            style={{
              width: '100%',
            }}
            variant="ghost"
            onClick={() => setExpanded((state) => !state)}
          >
            <Flex
              align="center"
              gap="1"
              style={{
                width: '100%',
              }}
            >
              {expanded ? <CaretDownIcon /> : <CaretRightIcon />}
              {time.toLocaleString('default', {
                month: 'short',
                day: 'numeric',
              })}
            </Flex>
          </Button>
        </Table.RowHeaderCell>
        <Table.Cell align="right">{random(1, 10)}</Table.Cell>
        <Table.Cell align="right">
          {random(60, 80, true).toFixed(0)}%
        </Table.Cell>
      </Table.Row>

      {expanded &&
        tanks.map((tank) => (
          <Table.Row
            key={tank.id}
            style={{
              overflow: 'hidden',
            }}
          >
            <Table.RowHeaderCell
              style={{
                paddingLeft: 32,
                position: 'relative',
                overflowY: 'hidden',
              }}
            >
              <Flex
                align="center"
                justify="center"
                style={{
                  position: 'absolute',
                  width: 128,
                  height: '200%',
                  top: '-50%',
                  left: 16,
                }}
              >
                <img
                  src={tankIcon(tank.id)}
                  style={{
                    objectFit: 'contain',
                    objectPosition: 'left',
                    overflow: 'hidden',
                  }}
                />
              </Flex>

              <Flex
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 128,
                  height: '100%',
                  paddingLeft: 32,
                  background:
                    'linear-gradient(90deg, #00000000, #00000060, #00000000)',
                }}
                align="center"
              >
                <Text
                  style={{
                    textWrap: 'nowrap',
                  }}
                >
                  {tank.name}
                </Text>
              </Flex>
            </Table.RowHeaderCell>
            <Table.Cell align="right">{random(1, 10)}</Table.Cell>
            <Table.Cell align="right">
              {random(60, 80, true).toFixed(0)}%
            </Table.Cell>
          </Table.Row>
        ))}
    </>
  );
}
