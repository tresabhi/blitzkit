import { gameDefinitions } from '@blitzkit/core';
import { Code } from '@radix-ui/themes';
import { use } from 'react';

export function WoTBVersion() {
  const awaitedGameDefinitions = use(gameDefinitions);

  return (
    <Code color="gray" size="2">
      {awaitedGameDefinitions.version}
    </Code>
  );
}
