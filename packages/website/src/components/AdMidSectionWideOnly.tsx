import { Flex, type FlexProps } from '@radix-ui/themes';
import { Ad, AdType } from './Ad';

export function AdMidSectionWideOnly(props: FlexProps) {
  return (
    <Flex
      justify="center"
      py="4"
      gap="4"
      display={{
        initial: 'none',
        sm: 'flex',
      }}
      {...props}
    >
      <Ad type={AdType.LeaderboardHorizontalPurple} />
    </Flex>
  );
}
