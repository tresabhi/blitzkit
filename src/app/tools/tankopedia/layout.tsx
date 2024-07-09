import * as TankopediaEphemeral from '../../../stores/tankopediaEphemeral';
import * as TankopediaPersistent from '../../../stores/tankopediaPersistent';
import * as TankopediaSort from '../../../stores/tankopediaSort';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TankopediaPersistent.Provider>
      <TankopediaEphemeral.Provider>
        <TankopediaSort.Provider>{children}</TankopediaSort.Provider>
      </TankopediaEphemeral.Provider>
    </TankopediaPersistent.Provider>
  );
}
