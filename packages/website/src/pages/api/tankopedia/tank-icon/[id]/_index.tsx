import { TankSandbox } from '../../../../../components/Tankopedia/HeroSection/components/TankSandbox';
import { awaitableModelDefinitions } from '../../../../../core/awaitables/modelDefinitions';
import { awaitableProvisionDefinitions } from '../../../../../core/awaitables/provisionDefinitions';
import { awaitableTankDefinitions } from '../../../../../core/awaitables/tankDefinitions';
import { App } from '../../../../../stores/app';
import { Duel } from '../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../stores/tankopediaEphemeral';
import { TankopediaPersistent } from '../../../../../stores/tankopediaPersistent';

const [provisionDefinitions, tankDefinitions, modelDefinitions] =
  await Promise.all([
    awaitableProvisionDefinitions,
    awaitableTankDefinitions,
    awaitableModelDefinitions,
  ]);

interface PageProps {
  id: number;
}

export function Page({ id }: PageProps) {
  const tank = tankDefinitions.tanks[id];
  const model = modelDefinitions.models[id];

  return (
    <App.Provider>
      <TankopediaPersistent.Provider>
        <Duel.Provider data={{ provisionDefinitions, tank }}>
          <TankopediaEphemeral.Provider data={model}>
            <Content />
          </TankopediaEphemeral.Provider>
        </Duel.Provider>
      </TankopediaPersistent.Provider>
    </App.Provider>
  );
}

function Content() {
  return <TankSandbox naked thicknessRange={{ value: 0 }} />;
}
