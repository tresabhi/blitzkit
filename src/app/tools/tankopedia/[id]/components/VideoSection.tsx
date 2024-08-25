import { PlusIcon } from '@radix-ui/react-icons';
import { Box, Flex, Heading, Text } from '@radix-ui/themes';
import { use } from 'react';
import { Link } from '../../../../../components/Link';
import PageWrapper from '../../../../../components/PageWrapper';
import { VerifiedIcon } from '../../../../../components/VerifiedIcon';
import { youtubers } from '../../../../../constants/youtubers';
import { reviews } from '../../../../../core/blitzkit/reviews';
import { Var } from '../../../../../core/blitzkit/var';
import * as Duel from '../../../../../stores/duel';

export function VideoSection() {
  const tank = Duel.use((state) => state.protagonist.tank);
  const awaitedReviews = use(reviews);
  const videos = awaitedReviews.reviews[tank.id]?.videos;

  if (!videos) return null;

  return (
    <PageWrapper noFlex1>
      <Flex direction="column" gap="6" align="center">
        <Flex direction="column" align="center">
          <Heading size="6">Review videos</Heading>

          <Text color="gray">BlitzKit does not endorse any review videos.</Text>
        </Flex>

        <Flex gap="3" wrap="wrap">
          {videos.map((video) => {
            const image = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
            const youtuber = youtubers.find(
              (youtuber) => youtuber.id === video.author,
            );

            if (!youtuber) return null;

            return (
              <Link
                color="gray"
                highContrast
                underline="hover"
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
              >
                <Flex
                  direction="column"
                  style={{
                    borderRadius: 'var(--radius-3)',
                    overflow: 'hidden',
                    background: `url(${image})`,
                    backgroundPosition: '0 18px',
                    backgroundSize: 'cover',
                  }}
                >
                  <Box
                    style={{
                      background: `url(${image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      height: 128,
                      aspectRatio: '16 / 9',
                    }}
                  />
                  <Flex
                    p="2"
                    width="100%"
                    justify="center"
                    style={{
                      backdropFilter: 'blur(4rem)',
                      WebkitBackdropFilter: 'blur(4rem)',
                    }}
                    align="center"
                    gap="1"
                  >
                    <Text>{youtuber.name}</Text>
                    <VerifiedIcon width="1em" height="1em" />
                  </Flex>
                </Flex>
              </Link>
            );
          })}

          <Link
            href="https://discord.gg/nDt7AjGJQH"
            target="_blank"
            color="gray"
          >
            <Flex
              align="center"
              justify="center"
              gap="2"
              p="3"
              direction="column"
              height="100%"
              style={{
                backgroundColor: Var('color-panel-solid'),
                borderRadius: Var('radius-3'),
                width: '9rem',
              }}
            >
              <PlusIcon />
              <Text align="center">Apply to feature your video</Text>
            </Flex>
          </Link>
        </Flex>
      </Flex>
    </PageWrapper>
  );
}
