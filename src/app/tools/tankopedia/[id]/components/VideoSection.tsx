import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Callout, Flex, Heading, Link } from '@radix-ui/themes';
import { use } from 'react';
import PageWrapper from '../../../../../components/PageWrapper';
import { videoDefinitions } from '../../../../../core/blitzkit/videos';
import * as Duel from '../../../../../stores/duel';

export function VideoSection() {
  const tank = Duel.use((state) => state.protagonist.tank);
  const awaitedVideoDefinitions = use(videoDefinitions);
  const videos = awaitedVideoDefinitions[tank.id]?.videos ?? [];

  return (
    <PageWrapper noFlex1>
      <Flex direction="column" gap="6" align="center">
        <Flex direction="column" gap="2" align="center">
          <Heading size="6">Review videos</Heading>

          <Callout.Root size="1">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              BlitzKit does not endorse any review videos.
            </Callout.Text>
          </Callout.Root>
        </Flex>

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
