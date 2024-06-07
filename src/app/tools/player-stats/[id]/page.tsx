import { Flex, Heading, Text } from '@radix-ui/themes';
import PageWrapper from '../../../../components/PageWrapper';
import { getAccountInfo } from '../../../../core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../../../../core/blitz/getClanAccountInfo';
import { idToRegion } from '../../../../core/blitz/idToRegion';
import getBkniPercentile from '../../../../core/statistics/getBkniPercentile';
import strings from '../../../../lang/en-US.json';

export default async function Page({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const region = idToRegion(id);
  const accountInfo = await getAccountInfo(region, id);
  const clanAccountInfo = await getClanAccountInfo(region, id, ['clan']);
  const bkniRaw = Math.random() * 2 - 1;
  const bkniFraction = Math.random();
  const bkniMetric = Math.round(bkniFraction * 200);
  const bkniPercentile = getBkniPercentile(bkniMetric);

  return (
    <PageWrapper>
      <Flex gap="2">
        <Heading>{accountInfo.nickname}</Heading>
        {clanAccountInfo?.clan && (
          <Heading color="gray">[{clanAccountInfo.clan.tag}]</Heading>
        )}
      </Flex>

      <Flex direction="column" align="center">
        <svg
          width={180}
          height={100}
          style={{
            transform: 'scaleX(-1)',
          }}
        >
          <circle
            cx={90}
            cy={90}
            r={80}
            strokeLinecap="round"
            fill="none"
            stroke="var(--color-panel-solid)"
            strokeWidth={20}
            strokeDasharray={80 * Math.PI}
            strokeDashoffset={80 * Math.PI}
          />
          <circle
            cx={90}
            cy={90}
            r={80}
            strokeLinecap="round"
            fill="none"
            stroke="purple"
            strokeWidth={20}
            strokeDasharray={(160 - 80 * bkniFraction) * Math.PI}
            strokeDashoffset={(160 - 80 * bkniFraction) * Math.PI}
          />
        </svg>

        <Flex direction="column" align="center" mt="-7">
          <Text weight="bold" size="8">
            {bkniMetric}
          </Text>
          <Text color="gray" size="4">
            {strings.common.bkni_percentile[bkniPercentile]}
          </Text>
        </Flex>
      </Flex>
    </PageWrapper>
  );
}
