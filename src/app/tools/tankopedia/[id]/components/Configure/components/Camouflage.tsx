import { Flex, Heading } from '@radix-ui/themes';
import { ModuleButton } from '../../../../../../../components/ModuleButton';
import {
  mutateTankopediaTemporary,
  useTankopediaTemporary,
} from '../../../../../../../stores/tankopedia';

export function Camouflage() {
  const camouflage = useTankopediaTemporary((state) => state.camouflage);

  return (
    <Flex gap="2" direction="column">
      <Heading size="4">Camouflage</Heading>

      <ModuleButton
        selected={camouflage}
        first
        last
        type="camouflage"
        onClick={() => {
          mutateTankopediaTemporary((draft) => {
            draft.camouflage = !camouflage;
          });
        }}
      />
    </Flex>
  );
}
