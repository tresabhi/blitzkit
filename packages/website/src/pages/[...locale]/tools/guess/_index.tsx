import { Box, Flex, Heading } from '@radix-ui/themes';
import { Suspense } from 'react';
import { awaitableModelDefinitions } from '../../../../core/awaitables/modelDefinitions';
import { awaitableProvisionDefinitions } from '../../../../core/awaitables/provisionDefinitions';
import { awaitableTankDefinitions } from '../../../../core/awaitables/tankDefinitions';
import { Var } from '../../../../core/radix/var';
import {
  LocaleProvider,
  useLocale,
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
  const { unwrap } = useLocale();
  const tank = GuessEphemeral.use((state) => state.tank);
  const guessState = GuessEphemeral.use((state) => state.guessState);
  const isRevealed = guessState !== null;

  return (
    <Flex flexGrow="1" position="relative" overflow="hidden">
      <Background />

      <Flex
        position="absolute"
        left="50%"
        top="50%"
        ml="9"
        style={{
          opacity: isRevealed ? 1 : 0,
          transitionDuration: isRevealed ? '2s' : undefined,
          transform: 'translateY(-50%)',
        }}
      >
        <Heading weight="medium" size="9">
          {unwrap(tank.name)}
        </Heading>
      </Flex>

      <Box
        position="absolute"
        width="100%"
        height="100%"
        top="0"
        right={isRevealed ? '16rem' : '0'}
        style={{
          transitionDuration: isRevealed ? '2s' : undefined,
        }}
      >
        <Suspense fallback={<GuessRendererLoader />}>
          <GuessRenderer />
        </Suspense>
      </Box>

      <Flex
        position="absolute"
        left="50%"
        top="50%"
        ml="9"
        style={{
          opacity: isRevealed ? 1 : 0,
          transitionDuration: isRevealed ? '2s' : undefined,
          transform: 'translateY(-50%)',
          color: 'transparent',
          WebkitTextStroke: `1px ${Var('gray-12')}`,
        }}
      >
        <Heading
          style={{
            WebkitTextStroke: `1px inherit`,
          }}
          weight="medium"
          size="9"
        >
          {unwrap(tank.name)}
        </Heading>
      </Flex>

      <Guesser />
    </Flex>
  );
}
