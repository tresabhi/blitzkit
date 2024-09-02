'use client';

import { Flex } from '@radix-ui/themes';
import { AdMidSectionResponsive } from '../components/AdMidSectionResponsive';
import {
  compareTool,
  discordTool,
  moreTool,
  ratingTool,
  sessionTool,
  tankopediaTool,
  tankPerformanceTool,
} from '../constants/tools';
import { useAdExempt } from '../hooks/useAdExempt';
import { Hero } from './components/Hero';
import { Plugs } from './components/Plugs';
import { ToolCard } from './components/ToolCard';

export default function Page() {
  const exempt = useAdExempt();

  return (
    <>
      <Hero />

      <Plugs />

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
            {/* <ToolCard tool={embedTool} /> */}
            <ToolCard tool={ratingTool} />
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
            <ToolCard tool={discordTool} />
            <ToolCard tool={moreTool} />
          </Flex>
        </Flex>
      </Flex>

      {!exempt && <AdMidSectionResponsive />}

      <div style={{ flex: 1 }} />
    </>
  );
}
