import { Flex, Heading, Link } from '@radix-ui/themes';
import { use } from 'react';
import PageWrapper from '../../../../../components/PageWrapper';
import { videoDefinitions } from '../../../../../core/blitzkit/videos';
import { useDuel } from '../../../../../stores/duel';

export function Videos() {
  const tank = useDuel((state) => state.protagonist!.tank);
  const awaitedVideoDefinitions = use(videoDefinitions);
  const videos = awaitedVideoDefinitions[tank.id]?.videos ?? [];

  if (videos.length === 0) return null;

  return (
    <PageWrapper noFlex1>
      <Flex direction="column" gap="4" align="start">
        <Heading size="6">Review videos</Heading>

        <Flex gap="3" wrap="wrap">
          {videos.map((video) => (
            <Link
              key={video}
              href={`https://www.youtube.com/watch?v=${video}`}
              target="_blank"
            >
              <img
                alt="Video thumbnail"
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
        </Flex>
      </Flex>
    </PageWrapper>
  );
}
