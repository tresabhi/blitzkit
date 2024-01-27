import { Heading } from '@radix-ui/themes';
import { ModuleButton } from '../../../../../../../components/ModuleButton';
import {
  mutateTankopediaTemporary,
  useTankopediaTemporary,
} from '../../../../../../../stores/tankopedia';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

export function Camouflage() {
  const camouflage = useTankopediaTemporary((state) => state.camouflage);

  return (
    <ConfigurationChildWrapper>
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
    </ConfigurationChildWrapper>
  );
}
