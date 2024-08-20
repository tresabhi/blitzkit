import { Flex, Heading } from '@radix-ui/themes';
import { Characteristics } from '../Characteristics';
import { Consumables } from '../Characteristics/components/Consumables';
import { Equipment } from '../Characteristics/components/Equipment';
import { Miscellaneous } from '../Characteristics/components/Miscellaneous';
import { Modules } from '../Characteristics/components/Modules';
import { Provisions } from '../Characteristics/components/Provisions';
import { Skills } from '../Characteristics/components/Skills';

export function CharacteristicsSection() {
  return (
    <Flex mt="4" px="4" style={{ boxSizing: 'border-box' }} gap="6">
      <Flex
        flexGrow="1"
        gap="6"
        justify="center"
        direction={{ initial: 'column', sm: 'row' }}
      >
        <Flex direction="column" gap="4" maxWidth="21rem">
          <Heading>Configuration</Heading>
          <Modules />
          <Equipment />
          <Provisions />
          <Consumables />
          <Skills />
          <Miscellaneous />
        </Flex>
        <Flex
          flexGrow="1"
          maxWidth={{
            initial: 'unset',
            md: '640px',
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
