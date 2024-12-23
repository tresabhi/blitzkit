import { Flex, Select, Text } from '@radix-ui/themes';
import { Charts, type ChartsPeriod } from '../../stores/charts';

export function ChartsControl() {
  const period = Charts.use((state) => state.period);
  const mutateCharts = Charts.useMutation();

  return (
    <Flex justify="center" align="center" gap="2">
      <Text>Player count</Text>
      <Select.Root
        value={period}
        onValueChange={(period) => {
          mutateCharts((draft) => {
            draft.period = period as ChartsPeriod;
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
