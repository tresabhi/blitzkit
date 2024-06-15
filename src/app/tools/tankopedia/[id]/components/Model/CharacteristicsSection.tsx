import { Flex, Heading } from '@radix-ui/themes';
import { Ad, AdType } from '../../../../../../components/Ad';
import { useAdExempt } from '../../../../../../hooks/useAdExempt';
import { Characteristics } from '../Characteristics';
import { Consumables } from '../Characteristics/components/Consumables';
import { Equipment } from '../Characteristics/components/Equipment';
import { Miscellaneous } from '../Characteristics/components/Miscellaneous';
import { Modules } from '../Characteristics/components/Modules';
import { Provisions } from '../Characteristics/components/Provisions';
import { Skills } from '../Characteristics/components/Skills';

export function CharacteristicsSection() {
  const exempt = useAdExempt();

  return (
    <Flex
      mt={exempt ? '4' : '0'}
      // align="center"
      px="4"
      style={{
        boxSizing: 'border-box',
      }}
      gap="6"
    >
      {!exempt && (
        <Flex
          direction="column"
          gap="4"
          display={{
            initial: 'none',
            lg: 'flex',
          }}
          pt={{
            initial: '9',
            md: '0',
          }}
        >
          <Ad type={AdType.WideSkyscraperVerticalPurple} />
          <Ad type={AdType.WideSkyscraperVerticalPurple} />
        </Flex>
      )}

      <Flex
        flexGrow="1"
        gap="6"
        justify="center"
        direction={{
          initial: 'column',
          sm: 'row',
        }}
      >
        <Flex direction="column" gap="4">
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
            xs: exempt ? undefined : '320px',
            md: '640px',
          }}
          direction="column"
          gap="4"
        >
          <Heading>Characteristics</Heading>
          <Characteristics />
        </Flex>
      </Flex>

      {!exempt && (
        <Flex
          direction="column"
          gap="4"
          height="100%"
          display={{
            initial: 'none',
            xs: 'flex',
          }}
          pt={{
            initial: '9',
            md: '0',
          }}
        >
          <Ad type={AdType.WideSkyscraperVerticalPurple} />
          <Ad type={AdType.WideSkyscraperVerticalPurple} />
        </Flex>
      )}
    </Flex>
  );
}
