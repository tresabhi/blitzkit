import { Flex, Heading } from '@radix-ui/themes';
import { compareVersions } from 'compare-versions';
import versions from '../../../../public/assets/versions.json';
import { Link } from '../../../components/Link';
import PageWrapper from '../../../components/PageWrapper';

export default async function Page() {
  return (
    <>
      <title>BlitzKit - Patch Notes</title>
      <PageWrapper>
        <Heading>BlitzKit patch notes</Heading>

        <Flex wrap="wrap" gap="4">
          {versions
            .sort(compareVersions)
            .reverse()
            .map((version) => {
              return (
                <Link key={version} href={`/docs/changelogs/${version}`}>
                  {version}
                </Link>
              );
            })}
        </Flex>
      </PageWrapper>{' '}
    </>
  );
}
