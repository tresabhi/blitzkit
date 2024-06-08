import { Box, Flex, Heading, Text } from '@radix-ui/themes';
import { BkniIndicator } from '../../../../components/BkniIndicator';
import PageWrapper from '../../../../components/PageWrapper';
import { getAccountInfo } from '../../../../core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../../../../core/blitz/getClanAccountInfo';
import { idToRegion } from '../../../../core/blitz/idToRegion';
import strings from '../../../../lang/en-US.json';

export default async function Page({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const region = idToRegion(id);
  const accountInfo = await getAccountInfo(region, id);
  const clanAccountInfo = await getClanAccountInfo(region, id, ['clan']);
  const bkni = Math.random() * 2 - 1;

  return (
    <>
      <PageWrapper
        py="8"
        color="blue"
        containerProps={{
          style: {
            backgroundColor: 'var(--color-surface)',
          },
        }}
      >
        <Flex justify="between" align="center">
          <Flex direction="column">
            <Heading size="8">{accountInfo.nickname} </Heading>

            <Text color="gray">
              {clanAccountInfo?.clan && `[${clanAccountInfo.clan.tag}] • `}
              {strings.common.regions.normal[region]}
            </Text>
          </Flex>

          <BkniIndicator bkni={bkni} />
        </Flex>
      </PageWrapper>

      <Box flexGrow="1" />
    </>
  );
}
