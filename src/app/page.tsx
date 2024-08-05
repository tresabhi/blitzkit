'use client';

import { Box, Flex } from '@radix-ui/themes';
import { AdMidSectionResponsive } from '../components/AdMidSectionResponsive';
import {
  compareTool,
  discordTool,
  embedTool,
  moreTool,
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

      <Flex p="4" justify="center" gap="4">
        <Flex maxWidth="1024px" flexGrow="1" gap="4" direction="column">
          <ToolCard tool={tankopediaTool} />

          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            {/* <ToolCard tool={playerStatsTool} /> */}
            <ToolCard tool={compareTool} />
            <ToolCard tool={tankPerformanceTool} />
          </Flex>

          {!exempt && (
            <Flex justify="center">
              <AdMidSectionResponsive />
            </Flex>
          )}

          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <ToolCard tool={sessionTool} />
            <ToolCard tool={embedTool} />
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
      </Flex>

      {!exempt && <AdMidSectionResponsive />}

      <div style={{ flex: 1 }} />
    </>
  );
}
