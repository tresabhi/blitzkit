import { Code } from '@radix-ui/themes';
import { use } from 'react';
import { gameDefinitions } from '../../../core/blitzkit/gameDefinitions';

export function WoTBVersion() {
  const awaitedGameDefinitions = use(gameDefinitions);

  return (
    <Code color="gray" size="2">
      {awaitedGameDefinitions.version}
    </Code>
  );
}
