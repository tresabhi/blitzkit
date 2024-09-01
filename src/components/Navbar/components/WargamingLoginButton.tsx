import { Button, ButtonProps, Dialog, Flex, Text } from '@radix-ui/themes';
import { REGIONS } from '../../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../../constants/wargamingApplicationID';
import { WargamingIcon } from '../../../icons/Wargaming';
import strings from '../../../lang/en-US.json';
import { Link } from '../../Link';

export function WargamingLoginButton({ children, ...props }: ButtonProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button
          color="red"
          {...props}
          children={
            <>
              <WargamingIcon width={15} height={15} /> {children ?? 'Wargaming'}
            </>
          }
        />
      </Dialog.Trigger>

      <Dialog.Content width="fit-content">
        <Flex direction="column" gap="4" align="center">
          <Text color="gray">Choose your region</Text>

          <Flex gap="2" wrap="wrap">
            {REGIONS.map((region) => (
              <Dialog.Close key={region}>
                <Link
                  href={
                    typeof window !== 'undefined'
                      ? `https://api.worldoftanks.${region}/wot/auth/login/?application_id=${WARGAMING_APPLICATION_ID}&redirect_uri=${encodeURIComponent(
                          `${location.origin}/auth/wargaming?return=${location.origin}${location.pathname}`,
                        )}`
                      : undefined
                  }
                >
                  <Button color="red">
                    {strings.common.regions.normal[region]}
                  </Button>
                </Link>
              </Dialog.Close>
            ))}
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
