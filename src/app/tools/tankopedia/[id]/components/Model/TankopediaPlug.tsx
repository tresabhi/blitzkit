import { Flex, Link, Text } from '@radix-ui/themes';
import PageWrapper from '../../../../../../components/PageWrapper';
import { PatreonIcon } from '../../../../../../icons/Patreon';

export function TankopediaPlug() {
  return (
    <PageWrapper>
      <Flex justify="center">
        <Text>
          Liking BlitzKit? Consider donating on{' '}
          <Link
            href="https://www.patreon.com/tresabhi"
            target="_blank"
            underline="hover"
          >
            <PatreonIcon
              style={{
                width: '1em',
                height: '1em',
                transform: 'translateY(12.5%)',
              }}
            />{' '}
            Patreon
          </Link>
          .
        </Text>
      </Flex>
    </PageWrapper>
  );
}
