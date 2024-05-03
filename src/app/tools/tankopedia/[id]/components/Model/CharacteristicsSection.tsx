import { Flex, Heading } from '@radix-ui/themes';
import { useWideFormat } from '../../../../../../hooks/useWideFormat';
import { Characteristics } from '../Characteristics';
import { Consumables } from '../Characteristics/components/Consumables';
import { Equipment } from '../Characteristics/components/Equipment';
import { Miscellaneous } from '../Characteristics/components/Miscellaneous';
import { Modules } from '../Characteristics/components/Modules';
import { Provisions } from '../Characteristics/components/Provisions';
import { Skills } from '../Characteristics/components/Skills';

export function CharacteristicsSection() {
  const wideFormat = useWideFormat(720);

  return (
    <Flex justify="center" mt="4" direction={wideFormat ? 'row' : 'column'}>
      <Flex gap="4">
        <Flex style={{ flex: 1, maxWidth: 320 }} direction="column" gap="4">
          <Heading>Configure</Heading>
          <Modules />
          <Equipment />
          <Provisions />
          <Consumables />
          <Skills />
          <Miscellaneous />
        </Flex>

        <Flex direction="column" gap="4">
          <Heading>Characteristics</Heading>
          <Characteristics />
        </Flex>
      </Flex>
    </Flex>
  );
}
