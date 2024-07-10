import * as Duel from '../../../stores/duel';
import * as TankopediaEphemeral from '../../../stores/tankopediaEphemeral';
import * as TankopediaPersistent from '../../../stores/tankopediaPersistent';
import * as TankopediaSort from '../../../stores/tankopediaSort';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Duel.Provider>
      <TankopediaPersistent.Provider>
        <TankopediaEphemeral.Provider>
          <TankopediaSort.Provider>{children}</TankopediaSort.Provider>
        </TankopediaEphemeral.Provider>
      </TankopediaPersistent.Provider>
    </Duel.Provider>
  );
}
