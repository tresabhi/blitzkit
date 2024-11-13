import { Flex, Heading } from '@radix-ui/themes';
import { Characteristics } from './components/Characteristics';
import { CharacteristicsHeading } from './components/Characteristics/components/Heading';
import { Consumables } from './components/Consumables';
import { Equipment } from './components/Equipment';
import { Miscellaneous } from './components/Miscellaneous';
import { Modules } from './components/Modules';
import { Provisions } from './components/Provisions';
import { Skills } from './components/Skills';

export function CharacteristicsSection() {
  return (
    <Flex mt="4" px="4" style={{ boxSizing: 'border-box' }} gap="6">
      <Flex
        flexGrow="1"
        gap="9"
        justify="center"
        align={{ initial: 'center', sm: 'start' }}
        direction={{ initial: 'column', sm: 'row' }}
      >
        <Flex
          direction="column"
          gap="6"
          maxWidth="21rem"
          align={{ initial: 'center', sm: 'start' }}
        >
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
          maxWidth={{ initial: '20rem', md: '40rem' }}
          direction="column"
          gap="6"
          width="100%"
        >
          <CharacteristicsHeading />
          <Characteristics />
        </Flex>
      </Flex>
    </Flex>
  );
}
