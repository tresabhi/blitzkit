import { Flex, Heading } from '@radix-ui/themes';
import { Characteristics } from '../Characteristics';
import { Consumables } from '../Characteristics/components/Consumables';
import { Modules } from '../Characteristics/components/Modules';

export function CharacteristicsSection() {
  return (
    <Flex justify="center">
      <Flex style={{ maxWidth: 640 }}>
        <Flex style={{ flex: 1 }} direction="column" gap="4">
          <Heading>Configure</Heading>

          <Modules />
          <Consumables />
        </Flex>

        <Characteristics />
      </Flex>
    </Flex>
  );
}
