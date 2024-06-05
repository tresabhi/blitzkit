import { Flex, Heading, Link, Text } from '@radix-ui/themes';
import { ReactNode } from 'react';
import PageWrapper from '../../../../components/PageWrapper';
import { tankDefinitions } from '../../../../core/blitzkit/tankDefinitions';
import { TIER_ROMAN_NUMERALS } from '../../../../core/blitzkit/tankDefinitions/constants';
import { tankIcon } from '../../../../core/blitzkit/tankIcon';
import { videoDefinitions } from '../../../../core/blitzkit/videos';
import strings from '../../../../lang/en-US.json';

interface TankopediaLayoutProps {
  children: ReactNode;
  params: { id: string };
}

export default async function TankopediaLayout({
  children,
  params,
}: TankopediaLayoutProps) {
  const id = Number(params.id);
  const awaitedTankDefinitions = await tankDefinitions;
  const awaitedVideoDefinitions = await videoDefinitions;
  const tank = awaitedTankDefinitions[id];
  const title = `${tank.name} - Tier ${TIER_ROMAN_NUMERALS[tank.tier]} ${
    (strings.common.nations_adjectives as Record<string, string>)[tank.nation]
  } ${strings.common.tank_class_short[tank.class]}`;
  const description = `Statistics, armor profiles, and equipment for ${tank.name}`;
  const videos = awaitedVideoDefinitions[tank.id]?.videos ?? [];

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:image" content={tankIcon(id)} />
      <meta property="og:description" content={description} />

      {children}

      <PageWrapper noFlex1>
        <Flex direction="column" gap="4" align="start">
          <Flex direction="column">
            <Heading size="6">Review videos</Heading>
            <Text color="gray">
              BlitzKit does not endorse any review videos.
            </Text>
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
      <PageWrapper noFlex1>
        <Heading>History of the {tank.name}</Heading>
        <Text>{tank.description}</Text>
      </PageWrapper>
    </>
  );
}
