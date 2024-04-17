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
    .sort(() => Math.random() - 0.5)
    .slice(0, random(2, 5));

  return (
    <>
      <Table.Row>
        <Table.RowHeaderCell>
          <Button
            variant="ghost"
            onClick={() => setExpanded((state) => !state)}
          >
            <Flex align="center" gap="1">
              {expanded ? <CaretDownIcon /> : <CaretRightIcon />}
              {`${time.getDate()}/${time.getMonth()}`}
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
                src={tankIcon(tank.id)}
                style={{
                  position: 'absolute',
                  width: 128,
                  height: '200%',
                  top: '-50%',
                  left: 'calc(128px)',
                  objectFit: 'contain',
                  objectPosition: 'left',
                  overflow: 'hidden',
                }}
              />

              <Text>{tank.name}</Text>
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
