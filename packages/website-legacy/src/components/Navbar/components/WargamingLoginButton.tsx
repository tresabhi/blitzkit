import { assertSecret, REGIONS } from '@blitzkit/core';
import strings from '@blitzkit/core/lang/en-US.json';
import { Button, ButtonProps, Dialog, Flex } from '@radix-ui/themes';
import { Link } from '../../Link';
import { WargamingIcon } from '../../WargamingIcon';

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
        <Dialog.Title align="center">Choose your region</Dialog.Title>

        <Flex gap="2" wrap="wrap" justify="center" align="center">
          {REGIONS.map((region) => (
            <Dialog.Close key={region}>
              <Link
                href={
                  typeof window !== 'undefined'
                    ? `https://api.worldoftanks.${region}/wot/auth/login/?application_id=${assertSecret(
                        process.env.NEXT_PUBLIC_WARGAMING_APPLICATION_ID,
                      )}&redirect_uri=${encodeURIComponent(
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
      </Dialog.Content>
    </Dialog.Root>
  );
}