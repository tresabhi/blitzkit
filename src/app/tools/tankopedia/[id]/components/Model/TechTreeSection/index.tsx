import { CaretLeftIcon, CaretRightIcon, PlusIcon } from '@radix-ui/react-icons';
import { Flex, Heading, IconButton, ScrollArea, Text } from '@radix-ui/themes';
import { use, useEffect, useMemo, useRef, useState } from 'react';
import { tankDefinitions } from '../../../../../../../core/blitzkit/tankDefinitions';
import * as Duel from '../../../../../../../stores/duel';
import { Arrow } from './components/Arrow';
import { Node } from './components/Node';

// function Ancestry({ line }: { line: Line }) {
//   return (
//     <Card>
//       <Flex align="center">
//         {line.map((node) => {
//           if (typeof node === 'number') {
//             return <Node key={node} id={node} />;
//           } else {
//             return (
//               <Flex direction="column">
//                 {node.map((line) => (
//                   <Ancestry line={line} />
//                 ))}
//               </Flex>
//             );
//           }
//         })}
//       </Flex>
//     </Card>
//   );
// }

type Line = number[];

export function TechTreeSection() {
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
      my="6"
      direction="column"
      align="center"
      gap="4"
      style={{
        backgroundColor: 'var(--color-surface)',
      }}
      py="6"
    >
      <Flex gap="0" direction="column" align="center">
        <Heading size="6">Tech tree</Heading>

        {lines.length > 1 && (
          <Flex align="center" gap="2">
            <IconButton
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
              variant="soft"
              onClick={() => setLineIndex((lineIndex + 1) % lines.length)}
            >
              <CaretRightIcon />
            </IconButton>
          </Flex>
        )}
      </Flex>

      <ScrollArea type="hover" scrollbars="horizontal" ref={container}>
        <Flex align="center" gap="2" justify="center" p="4">
          {line.map((id, index) => (
            <>
              {index > 0 && <Arrow />}
              <Node key={id} id={id} highlight={index === line.length - 1} />
            </>
          ))}

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
    </Flex>
  );
}
