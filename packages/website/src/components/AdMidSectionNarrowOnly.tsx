import { Flex, type FlexProps } from '@radix-ui/themes';
import { Ad, AdType } from './Ad';

export function AdMidSectionNarrowOnly(props: FlexProps) {
  return (
    <Flex
      justify="center"
      py="4"
      gap="4"
      display={{
        initial: 'flex',
        sm: 'none',
      }}
      {...props}
    >
      <Ad type={AdType.MediumRectangleHorizontalPurple} />
    </Flex>
  );
}
