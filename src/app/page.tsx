'use client';

import { Box, Flex } from '@radix-ui/themes';
import { Ad, AdType } from '../components/Ad';
import { AdMidSectionResponsive } from '../components/AdMidSectionResponsive';
import {
  compareTool,
  discordTool,
  moreTool,
  playerStatsTool,
  ratingTool,
  sessionTool,
  tankopediaTool,
  tankPerformanceTool,
} from '../constants/tools';
import { useAdExempt } from '../hooks/useAdExempt';
import { Hero } from './components/Hero';
import { PatreonPlug } from './components/PatreonPlug';
import { ToolCard } from './components/ToolCard';

export default function Page() {
  const exempt = useAdExempt();

  return (
    <>
      <Hero />

      <PatreonPlug />

      <Flex
        p="4"
        justify={
          exempt
            ? 'center'
            : {
                initial: 'center',
                lg: 'between',
              }
        }
        gap="4"
      >
        {!exempt && (
          <Ad
            type={AdType.WideSkyscraperVerticalPurple}
            display={{
              initial: 'none',
              lg: 'block',
            }}
          />
        )}

        <Flex maxWidth="1024px" flexGrow="1" gap="4" direction="column">
          <ToolCard tool={tankopediaTool} />

          {!exempt && (
            <Flex
              justify="center"
              display={{
                initial: 'flex',
                lg: 'none',
              }}
            >
              <AdMidSectionResponsive />
            </Flex>
          )}

          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <ToolCard tool={playerStatsTool} />
            <ToolCard tool={compareTool} />
          </Flex>

          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <ToolCard tool={tankPerformanceTool} />
            <ToolCard tool={sessionTool} />
          </Flex>

          {!exempt && (
            <Flex
              justify="center"
              display={{
                initial: 'flex',
                md: 'none',
              }}
            >
              <AdMidSectionResponsive />
            </Flex>
          )}

          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <ToolCard tool={ratingTool} />
            <ToolCard tool={discordTool} />
          </Flex>

          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <ToolCard tool={moreTool} />
            <Box flexGrow="1" />
          </Flex>
        </Flex>

        {!exempt && (
          <Ad
            type={AdType.WideSkyscraperVerticalPurple}
            display={{
              initial: 'none',
              lg: 'block',
            }}
          />
        )}
      </Flex>

      {!exempt && <AdMidSectionResponsive />}

      <div style={{ flex: 1 }} />
    </>
  );
}
