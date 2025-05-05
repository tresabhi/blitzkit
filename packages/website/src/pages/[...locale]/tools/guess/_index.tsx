import { Box, Flex } from '@radix-ui/themes';
import { awaitableModelDefinitions } from '../../../../core/awaitables/modelDefinitions';
import { awaitableProvisionDefinitions } from '../../../../core/awaitables/provisionDefinitions';
import { awaitableTankDefinitions } from '../../../../core/awaitables/tankDefinitions';
import { Var } from '../../../../core/radix/var';
import {
  LocaleProvider,
  type LocaleAcceptorProps,
} from '../../../../hooks/useLocale';
import { Duel } from '../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../stores/tankopediaEphemeral';
import { GuessRenderer } from './components/GuessRenderer';
import { Guesser } from './components/Guesser';

const [tankDefinitions, modelDefinitions, provisionDefinitions] =
  await Promise.all([
    awaitableTankDefinitions,
    awaitableModelDefinitions,
    awaitableProvisionDefinitions,
  ]);

const ids = Object.keys(tankDefinitions.tanks);

export function Page({ locale }: LocaleAcceptorProps) {
  const id = Number(ids[Math.floor(Math.random() * ids.length)]);
  const tank = tankDefinitions.tanks[id];
  const model = modelDefinitions.models[id];

  return (
    <LocaleProvider locale={locale}>
      <TankopediaEphemeral.Provider data={model}>
        <Duel.Provider data={{ tank, model, provisionDefinitions }}>
          <Content />
        </Duel.Provider>
      </TankopediaEphemeral.Provider>
    </LocaleProvider>
  );
}

function Content() {
  return (
    <Flex
      flexGrow="1"
      position="relative"
      style={{
        backgroundColor: Var('cyan-3'),
      }}
    >
      <Box
        position="absolute"
        width="100%"
        height="100%"
        top="0"
        left="0"
        style={{
          backgroundImage: `
                radial-gradient(circle, ${Var('white-a1')} 20%, transparent 20%),
                radial-gradient(circle at 0 0, ${Var('white-a1')} 10%, transparent 10%),
                radial-gradient(circle at 100% 0, ${Var('white-a1')} 10%, transparent 10%),
                radial-gradient(circle at 0 100%, ${Var('white-a1')} 10%, transparent 10%),
                radial-gradient(circle at 100% 100%, ${Var('white-a1')} 10%, transparent 10%)
              `,
          backgroundSize: '4rem 4rem',
          // background: `radial-gradient(circle, ${Var('cyan-a1')} 15%, ${Var('cyan-a3')}, ${Var('cyan-a1')}, ${Var('gray-1')} 50%)`,
          // background: `linear-gradient(90deg, ${Var('black-a3')}, ${Var('black-a9')} 66%)`,
        }}
      />

      <Box position="absolute" width="100%" height="100%" top="0" left="0">
        <GuessRenderer />
      </Box>

      <Guesser />
    </Flex>
  );
}
