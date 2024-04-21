import { PlusIcon } from '@radix-ui/react-icons';
import { Card, Flex, Heading, Link, Text } from '@radix-ui/themes';
import { use } from 'react';
import { videoDefinitions } from '../../../../../core/blitzkrieg/videos';
import { useFullScreen } from '../../../../../hooks/useFullScreen';
import { useDuel } from '../../../../../stores/duel';

export function Videos() {
  const isFullScreen = useFullScreen();
  const id = useDuel((state) => state.protagonist!.tank.id);
  const awaitedVideoDefinitions = use(videoDefinitions);
  const videos = awaitedVideoDefinitions[id] ?? [];

  if (isFullScreen) return null;

  return (
    <Flex direction="column" gap="2" mt="4">
      <Heading size="6">Review videos</Heading>

      <Flex gap="3" wrap="wrap">
        {videos.map((video) => (
          <Link
            key={video}
            href={`https://www.youtube.com/watch?v=${video}`}
            target="_blank"
          >
            <img
              src={`https://i.ytimg.com/vi/${video}/hqdefault.jpg`}
              style={{
                aspectRatio: '16 / 9',
                objectFit: 'cover',
                height: 128,
                borderRadius: 8,
              }}
            />
          </Link>
        ))}

        <Link href="https://discord.gg/nDt7AjGJQH" target="_blank">
          <Card
            style={{
              aspectRatio: '16 / 9',
              height: 128,
            }}
          >
            <Flex
              align="center"
              justify="center"
              gap="1"
              style={{
                width: '100%',
                height: '100%',
              }}
            >
              <Text color="purple">
                {videos.length === 0 ? 'Suggest' : 'Suggest more'} <PlusIcon />
              </Text>
            </Flex>
          </Card>
        </Link>
      </Flex>
    </Flex>
  );
}
