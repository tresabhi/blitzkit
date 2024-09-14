'use client';

import { Flex, Heading } from '@radix-ui/themes';
import { AdMidSectionResponsive } from '../components/AdMidSectionResponsive';
import {
  compareTool,
  discordTool,
  moreTool,
  ratingTool,
  sessionTool,
  tankopediaTool,
  tankPerformanceTool,
} from '../../../website/src/constants/tools';
import { useAdExempt } from '../hooks/useAdExempt';
import { Hero } from './components/Hero';
import { Plugs } from './components/Plugs';
import { ToolCard } from '../../../website/src/components/ToolCard';

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

        {!exempt && <AdMidSectionResponsive />}

        <Heading>Other cool projects</Heading>

        <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
          <ToolCard
            tool={{
              button: {
                text: 'Analyze',
                color: 'blue',
              },
              description: 'Rich historic average stats',
              id: 'blitz-analysis',
              image: 'j76YXGl',
              title: 'BlitzAnalysis[]',
              href: 'https://blitzanalysiz.com/',
            }}
          />
          <ToolCard
            tool={{
              button: {
                color: 'purple',
                text: 'Install',
                highContrast: true,
              },
              image: 'zYrrYbR',
              description: 'In-game session stats',
              id: 'blitz-insider',
              title: 'Blitz Insider',
              href: 'https://discord.gg/UjWf9eGgtR',
            }}
          />
        </Flex>
      </Flex>
    </Flex>

    <div style={{ flex: 1 }} />
    </>
  );
}
