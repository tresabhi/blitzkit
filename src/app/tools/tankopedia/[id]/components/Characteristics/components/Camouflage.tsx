import { Heading } from '@radix-ui/themes';
import { CamouflageButton } from '../../../../../../../components/ModuleButtons/CamouflageButton';
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

      <CamouflageButton
        selected={camouflage}
        first
        last
        onClick={() => {
          mutateTankopediaTemporary((draft) => {
            draft.camouflage = !camouflage;
          });
        }}
      />
    </ConfigurationChildWrapper>
  );
}
