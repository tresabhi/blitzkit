import { UpdateIcon } from '@radix-ui/react-icons';
import { Button, Flex, Heading } from '@radix-ui/themes';
import { TREE_TYPE_ICONS } from '../../../../../components/Tanks';
import { useDuel } from '../../../../../stores/duel';

export function Title() {
  const protagonist = useDuel((state) => state.protagonist!);

  return (
    <Flex gap="6" justify="center" align="center" style={{ padding: 16 }}>
      <Flex gap="2" align="center">
        <Heading
          color={
            protagonist.tank.tree_type === 'premium'
              ? 'amber'
              : protagonist.tank.tree_type === 'collector'
                ? 'blue'
                : undefined
          }
        >
          <Flex align="center" gap="2">
            <img
              src={
                TREE_TYPE_ICONS[protagonist.tank.tree_type][
                  protagonist.tank.type
                ]
              }
              style={{
                width: '1em',
                height: '1em',
              }}
            />{' '}
            {protagonist.tank.name}
          </Flex>
        </Heading>
      </Flex>

      <Button variant="ghost">
        Change <UpdateIcon />
      </Button>
    </Flex>
  );
}
