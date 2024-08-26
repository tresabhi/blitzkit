import { CaretLeftIcon, CaretRightIcon, PlusIcon } from '@radix-ui/react-icons';
import { Flex, Heading, IconButton, ScrollArea, Text } from '@radix-ui/themes';
import { use, useEffect, useMemo, useRef, useState } from 'react';
import { asset } from '../../../../../../../core/blitzkit/asset';
import { imgur } from '../../../../../../../core/blitzkit/imgur';
import { tankDefinitions } from '../../../../../../../core/blitzkit/tankDefinitions';
import * as Duel from '../../../../../../../stores/duel';
import * as TankopediaEphemeral from '../../../../../../../stores/tankopediaEphemeral';
import { Arrow } from './components/Arrow';
import { Node } from './components/Node';

type Line = number[];

export const XP_MULTIPLIERS = [1, 2, 3, 4, 5, 10];

export function TechTreeSection() {
  const xpMultiplier = TankopediaEphemeral.use((state) => state.xpMultiplier);
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  const master = Duel.use((state) => state.protagonist.tank);
  const awaitedTankDefinitions = use(tankDefinitions);
  const container = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => {
    function extend(line: Line): Line[] {
      const root = awaitedTankDefinitions[line.at(-1)!];

      if (root.ancestors === undefined || root.tier === 1) {
        return [line];
      } else {
        if (root.ancestors.length === 1 || root.tier === 2) {
          line.push(root.ancestors[0]);
          return extend(line);
        } else {
          return root.ancestors
            .map((ancestor) => {
              const newLine = [...line, ancestor];
              return extend(newLine);
            })
            .flat();
        }
      }
    }

    return extend([master.id]);
  }, [master]);
  const [lineIndex, setLineIndex] = useState(0);
  const line = useMemo(
    () => [...lines[lineIndex]].toReversed(),
    [master, lineIndex],
  );
  const totalXp = line.reduce(
    (xp, id) =>
      xp +
      (awaitedTankDefinitions[id].xp === undefined ||
      awaitedTankDefinitions[id].tier === 1
        ? 0
        : awaitedTankDefinitions[id].xp),
    0,
  );
  const totalCredits = line.reduce(
    (credits, id) => credits + awaitedTankDefinitions[id].price.value,
    0,
  );

  if (
    master.treeType !== 'researchable' ||
    master.ancestors === undefined ||
    master.ancestors.length === 0
  ) {
    return null;
  }

  useEffect(() => {
    if (!container.current) return;

    container.current.scrollLeft = container.current.scrollWidth;
  });

  return (
    <Flex
      direction="column"
      align="center"
      gap="0"
      style={{ backgroundColor: 'var(--color-surface)' }}
      py="6"
    >
      <Flex direction="column" align="center">
        <Heading size="6">Tech tree</Heading>

        {master.tier > 1 && (
          <Flex gap="4" align="center">
            <Text color="gray" wrap="nowrap">
              <Flex gap="1" align="center">
                <img
                  alt="XP"
                  src={asset('icons/currencies/xp.webp')}
                  style={{
                    width: '1em',
                    height: '1em',
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                />
                {Math.round(totalXp / xpMultiplier).toLocaleString()}
              </Flex>
            </Text>

            <Text color="gray" wrap="nowrap">
              <Flex gap="1" align="center">
                <img
                  alt="Silver"
                  src={asset('icons/currencies/silver.webp')}
                  style={{
                    width: '1em',
                    height: '1em',
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                />
                {totalCredits.toLocaleString()}
              </Flex>
            </Text>
          </Flex>
        )}

        <Flex gap="1" mt="2">
          {XP_MULTIPLIERS.map((multiplier) => {
            const selected = xpMultiplier === multiplier;

            return (
              <Flex
                style={{
                  background: `url(${imgur('7hDltb4')})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  opacity: selected ? 1 : 0.5,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  mutateTankopediaEphemeral((draft) => {
                    draft.xpMultiplier = multiplier;
                  });
                }}
                key={multiplier}
                width="2.5rem"
                justify="center"
                align="center"
                pt="1"
                pl="1"
              >
                <Text size="2">
                  x<b>{multiplier}</b>
                </Text>
              </Flex>
            );
          })}
        </Flex>
      </Flex>

      <ScrollArea type="hover" scrollbars="horizontal" ref={container}>
        <Flex align="center" gap="2" justify="center" p="4">
          {line.map((id, index) => {
            const last = index === line.length - 1;
            const tank = awaitedTankDefinitions[id];

            return (
              <>
                {index > 0 && <Arrow />}
                <Node
                  key={id}
                  id={id}
                  nextIds={last ? tank.successors : [line[index + 1]]}
                  highlight={last}
                />
              </>
            );
          })}

          {master.tier < 10 && (
            <>
              <Arrow />
              {master.successors!.map((id, index) => (
                <>
                  {index > 0 && (
                    <Text color="gray">
                      <PlusIcon />
                    </Text>
                  )}
                  <Node key={id} id={id} />
                </>
              ))}
            </>
          )}
        </Flex>
      </ScrollArea>

      <Flex>
        {lines.length > 1 && (
          <Flex align="center" gap="2">
            <IconButton
              size="2"
              variant="soft"
              onClick={() =>
                setLineIndex((lines.length + lineIndex - 1) % lines.length)
              }
            >
              <CaretLeftIcon />
            </IconButton>
            <Text>
              Route {lineIndex + 1} of {lines.length}
            </Text>
            <IconButton
              size="2"
              variant="soft"
              onClick={() => setLineIndex((lineIndex + 1) % lines.length)}
            >
              <CaretRightIcon />
            </IconButton>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}
