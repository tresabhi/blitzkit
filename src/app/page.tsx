'use client';

import { Box, Flex } from '@radix-ui/themes';
import { Ad, AdType } from '../components/Ad';
import { AdMidSectionResponsive } from '../components/AdMidSectionResponsive';
import {
  compareTool,
  discordTool,
  moreTool,
  ratingTool,
  sessionTool,
  tankopediaTool,
} from '../constants/tools';
import { Hero } from './components/Hero';
import { PatreonPlug } from './components/PatreonPlug';
import { ToolCard } from './components/ToolCard';

export default function Page() {
  return (
    <>
      <Hero />

      <PatreonPlug />

      <Flex p="4" justify="between" gap="4">
        <Ad
          type={AdType.WideSkyscraperVerticalPurple}
          display={{
            initial: 'none',
            lg: 'block',
          }}
        />

        <Flex maxWidth="1024px" flexGrow="1" gap="4" direction="column">
          <ToolCard tool={tankopediaTool} />

          <AdMidSectionResponsive />

          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <ToolCard tool={compareTool} />
            <ToolCard tool={sessionTool} />
          </Flex>

          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <ToolCard tool={ratingTool} />
            <ToolCard tool={discordTool} />
          </Flex>

          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <ToolCard tool={moreTool} />
            <Box flexGrow="1" flexBasis="0" />
          </Flex>
        </Flex>

        <Ad
          type={AdType.WideSkyscraperVerticalPurple}
          display={{
            initial: 'none',
            md: 'block',
          }}
        />
      </Flex>

      <AdMidSectionResponsive />

      <div style={{ flex: 1 }} />
    </>
  );
}
