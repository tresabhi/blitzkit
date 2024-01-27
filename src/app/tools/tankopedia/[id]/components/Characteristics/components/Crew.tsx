import { Flex, Heading, Slider, TextField } from '@radix-ui/themes';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

export function Crew() {
  return (
    <ConfigurationChildWrapper>
      <Heading size="4">Crew</Heading>

      <Flex
        align="center"
        gap="4"
        justify="end"
        style={{
          width: 240,
        }}
      >
        <Slider min={50} max={100} defaultValue={[100]} style={{ flex: 1 }} />
        <TextField.Root style={{ width: 64 }}>
          <TextField.Input defaultValue={100} />
          <TextField.Slot>%</TextField.Slot>
        </TextField.Root>
      </Flex>
    </ConfigurationChildWrapper>
  );
}
