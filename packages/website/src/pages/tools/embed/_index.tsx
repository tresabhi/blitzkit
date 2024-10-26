import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Callout, Flex, Link } from '@radix-ui/themes';
import { PageWrapper } from '../../../components/PageWrapper';
import { WargamingLoginButton } from '../../../components/WargamingLoginButton';
import { configurations } from '../../../constants/embeds';
import { App, type WargamingLogin } from '../../../stores/app';

export function Page() {
  return (
    <App.Provider>
      <Content />
    </App.Provider>
  );
}

function Content() {
  const wargaming = App.useDeferred((state) => state.logins.wargaming, {
    expires: 0,
    id: 0,
    token: '',
  } satisfies WargamingLogin);

  return (
    <PageWrapper color="red">
      {!wargaming && (
        <>
          <Flex justify="center">
            <Callout.Root size="1">
              <Callout.Icon>
                <ExclamationTriangleIcon />
              </Callout.Icon>

              <Callout.Text>
                You must be logged in with your Wargaming account to export
                embeds.
              </Callout.Text>
            </Callout.Root>
          </Flex>

          <Flex justify="center">
            <WargamingLoginButton>Log in with Wargaming</WargamingLoginButton>
          </Flex>
        </>
      )}

      {Object.entries(configurations).map(([embed, config]) => (
        <Link href={`/tools/embed/${embed}`}>{embed}</Link>
      ))}
    </PageWrapper>
  );
}
