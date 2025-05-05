import { Box, Flex } from '@radix-ui/themes';
import { Suspense } from 'react';
import { awaitableModelDefinitions } from '../../../../core/awaitables/modelDefinitions';
import { awaitableProvisionDefinitions } from '../../../../core/awaitables/provisionDefinitions';
import { awaitableTankDefinitions } from '../../../../core/awaitables/tankDefinitions';
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from '../../../../hooks/useLocale';
import { Duel } from '../../../../stores/duel';
import { GuessEphemeral } from '../../../../stores/guessEphemeral';
import { TankopediaEphemeral } from '../../../../stores/tankopediaEphemeral';
import { Background } from './components/Background';
import { Guesser } from './components/Guesser';
import { GuessRenderer } from './components/GuessRenderer';
import { GuessRendererLoader } from './components/GuessRendererLoader';

const [tankDefinitions, modelDefinitions, provisionDefinitions] =
  await Promise.all([
    awaitableTankDefinitions,
    awaitableModelDefinitions,
    awaitableProvisionDefinitions,
  ]);

const ids = Object.keys(tankDefinitions.tanks);

export function Page({ locale }: LocaleAcceptorProps) {
  const initialId = Number(ids[Math.floor(Math.random() * ids.length)]);
  const initialTank = tankDefinitions.tanks[initialId];

  return (
    <GuessEphemeral.Provider data={initialTank}>
      <LocaleProvider locale={locale}>
        <Page2 />
      </LocaleProvider>
    </GuessEphemeral.Provider>
  );
}

function Page2() {
  const tank = GuessEphemeral.use((state) => state.tank);
  const model = modelDefinitions.models[tank.id];

  return (
    <TankopediaEphemeral.Provider data={model}>
      <Duel.Provider data={{ tank, model, provisionDefinitions }}>
        <Content />
      </Duel.Provider>
    </TankopediaEphemeral.Provider>
  );
}

function Content() {
  return (
    <Flex flexGrow="1" position="relative" overflow="hidden">
      <Background />

      <Box position="absolute" width="100%" height="100%" top="0" left="0">
        <Suspense fallback={<GuessRendererLoader />}>
          <GuessRenderer />
        </Suspense>
      </Box>

      <Guesser />
    </Flex>
  );
}
