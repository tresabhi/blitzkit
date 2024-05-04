import { CaretDownIcon, CaretRightIcon } from '@radix-ui/react-icons';
import { Button, Flex, Table, Text } from '@radix-ui/themes';
import { random } from 'lodash';
import { use, useMemo, useState } from 'react';
import { tankDefinitions } from '../../../../core/blitzkit/tankDefinitions';
import { tankIcon } from '../../../../core/blitzkit/tankIcon';

interface DayProps {
  offset: number;
}

export function Day({ offset }: DayProps) {
  const timeTo = new Date(Date.now() - offset * 24 * 60 * 60 * 1000);
  const timeFrom = new Date(Date.now() - (offset + 1) * 24 * 60 * 60 * 1000);
  const awaitedTankDefinitions = use(tankDefinitions);
  const tanksList = useMemo(
    () => Object.values(awaitedTankDefinitions),
    [awaitedTankDefinitions],
  );
  const [expanded, setExpanded] = useState(offset === 0);
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
              {timeTo.toLocaleString('default', {
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
              <img
                alt="Tank icon"
                draggable={false}
                src={tankIcon(tank.id)}
                style={{
                  position: 'absolute',
                  width: 128 + 32,
                  height: '200%',
                  top: '-50%',
                  left: 0,
                  boxShadow: 'inset 128px 0 64px -64px #00000040',
                  objectFit: 'contain',
                  objectPosition: '50% 50%',
                  overflow: 'hidden',
                }}
              />

              <Text
                style={{
                  position: 'relative',
                  textWrap: 'nowrap',
                  textShadow: 'black 0 0 4px',
                }}
              >
                {tank.name}
              </Text>
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
