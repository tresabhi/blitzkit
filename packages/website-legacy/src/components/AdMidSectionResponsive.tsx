import { Flex, FlexProps } from '@radix-ui/themes';
import { Ad, AdType } from './Ad';

export function AdMidSectionResponsive(props: FlexProps) {
  return (
    <Flex justify="center" py="4" gap="4" {...props}>
      <Ad
        display={{
          initial: 'none',
          sm: 'block',
        }}
        type={AdType.LeaderboardHorizontalPurple}
      />
      <Ad
        display={{
          initial: 'block',
          sm: 'none',
        }}
        type={AdType.MediumRectangleHorizontalPurple}
      />
    </Flex>
  );
}
