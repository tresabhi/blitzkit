import { Tabs } from '@radix-ui/themes';
import {
  TankPerformanceEphemeral,
  TankPerformanceMode,
} from '../../stores/tankPerformanceEphemeral';

export function ModeSwitcher() {
  const mode = TankPerformanceEphemeral.use((state) => state.mode);
  const mutateTankPerformanceMode = TankPerformanceEphemeral.useMutation();

  return (
    <Tabs.Root
      value={`${mode}`}
      onValueChange={(value) => {
        mutateTankPerformanceMode((draft) => {
          draft.mode = Number(value) as TankPerformanceMode;
        });
      }}
      mb="5"
    >
      <Tabs.List justify="center">
        <Tabs.Trigger value={`${TankPerformanceMode.Table}`}>
          Table
        </Tabs.Trigger>
        <Tabs.Trigger value={`${TankPerformanceMode.Charts}`}>
          Charts
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  );
}
