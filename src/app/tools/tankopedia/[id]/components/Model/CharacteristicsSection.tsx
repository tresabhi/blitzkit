import { Flex, Heading } from '@radix-ui/themes';
import PageWrapper from '../../../../../../components/PageWrapper';
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
    <PageWrapper>
      <Flex
        gap={wideFormat ? '4' : '6'}
        style={{ width: '100%' }}
        direction={wideFormat ? 'row' : 'column'}
      >
        <Flex style={{ flex: 1, maxWidth: 480 }} direction="column" gap="4">
          <Heading>Configure</Heading>
          <Modules />
          <Equipment />
          <Provisions />
          <Consumables />
          <Skills />
          <Miscellaneous />
        </Flex>

        <Flex
          style={{ flex: 1, width: wideFormat ? undefined : '100%' }}
          direction="column"
          gap="4"
        >
          <Heading>Characteristics</Heading>
          <Characteristics />
        </Flex>
      </Flex>
    </PageWrapper>
  );
}
