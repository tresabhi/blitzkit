import { Flex, Select, Text } from '@radix-ui/themes';
import {
  TankPerformanceEphemeral,
  type PlayerCountPeriod,
} from '../../stores/tankPerformanceEphemeral';

export function PlayerCountControl() {
  const playerCountPeriod = TankPerformanceEphemeral.use(
    (state) => state.playerCountPeriod,
  );
  const mutateTankPerformanceSort = TankPerformanceEphemeral.useMutation();

  return (
    <Flex justify="center" align="center" gap="2">
      <Text>Player count</Text>
      <Select.Root
        value={playerCountPeriod}
        onValueChange={(period) => {
          mutateTankPerformanceSort((draft) => {
            draft.playerCountPeriod = period as PlayerCountPeriod;
          });
        }}
      >
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="total">Total</Select.Item>
          <Select.Item value="d_120">Past 120 days</Select.Item>
          <Select.Item value="d_90">Past 90 days</Select.Item>
          <Select.Item value="d_60">Past 60 days</Select.Item>
          <Select.Item value="d_30">This month</Select.Item>
          <Select.Item value="d_7">This week</Select.Item>
          <Select.Item value="d_1">Yesterday</Select.Item>
        </Select.Content>
      </Select.Root>
    </Flex>
  );
}
