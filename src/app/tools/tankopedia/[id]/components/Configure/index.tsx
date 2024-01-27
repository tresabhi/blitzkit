import { Flex, Heading } from '@radix-ui/themes';
import { Camouflage } from './components/Camouflage';
import { Consumables } from './components/Consumables';
import { Crew } from './components/Crew';
import { Equipments } from './components/Equipments';
import { Modules } from './components/Modules';
import { Provisions } from './components/Provisions';

export function Configure() {
  return (
    <Flex gap="4" direction="column">
      <Heading>Configure</Heading>

      <Flex wrap="wrap" direction="column" gap="4">
        <Modules />
        <Crew />
        <Camouflage />
        <Provisions />
        <Consumables />
        <Equipments />
      </Flex>
    </Flex>
  );
}
