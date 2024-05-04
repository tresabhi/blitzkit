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
  const wideFormat = useWideFormat(880);

  return (
    <Flex
      align="center"
      px="4"
      style={{
        boxSizing: 'border-box',
      }}
      direction={wideFormat ? 'row' : 'column'}
      mt="4"
    >
      <Flex
        gap="6"
        style={{ width: '100%' }}
        direction={wideFormat ? 'row' : 'column'}
        justify="center"
      >
        <Flex direction="column" gap="4">
          <Heading>Configure</Heading>
          <Modules />
          <Equipment />
          <Provisions />
          <Consumables />
          <Skills />
          <Miscellaneous />
        </Flex>

        <Flex
          style={{
            flex: 1,
            maxWidth: wideFormat ? 640 : undefined,
            minWidth: 320,
          }}
          direction="column"
          gap="4"
        >
          <Heading>Characteristics</Heading>
          <Characteristics />
        </Flex>
      </Flex>
    </Flex>
  );
}
