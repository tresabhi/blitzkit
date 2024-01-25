import { Flex, Heading } from '@radix-ui/themes';
import { Consumables } from './components/Consumables';
import { Equipments } from './components/Equipments';
import { Modules } from './components/Modules';

export function Configure() {
  return (
    <Flex gap="4" direction="column">
      <Heading>Configure</Heading>

      <Flex gap="4" direction="column" wrap="wrap">
        <Modules />
        <Equipments />
        <Consumables />
      </Flex>

      {/*
      <Flex gap="4" direction="column">
        <Heading size="5">Camouflage</Heading>
      </Flex>

      <Flex gap="4" direction="column">
        <Heading size="5">Consumables</Heading>
      </Flex>

      <Flex gap="4" direction="column">
        <Heading size="5">Provisions</Heading>
      </Flex> */}
    </Flex>
  );
}
