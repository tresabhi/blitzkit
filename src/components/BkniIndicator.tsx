import { TimerIcon } from '@radix-ui/react-icons';
import { Button, Flex, Heading, Popover, Text } from '@radix-ui/themes';
import getBkniPercentile, {
  BKNI_COLORS,
  BKNI_PERCENTILES,
  BkniPercentile,
} from '../core/statistics/getBkniPercentile';
import strings from '../lang/en-US.json';

interface BkniIndicatorProps {
  bkni: number;
}

export function BkniIndicator({ bkni }: BkniIndicatorProps) {
  const bkniFraction = (bkni + 1) / 2;
  const bkniMetric = Math.round(bkniFraction * 200);
  const bkniPercentile = getBkniPercentile(bkniMetric);
  const lastBkniPercentile = Math.max(0, bkniPercentile - 1) as BkniPercentile;
  const bkniColor = BKNI_COLORS[bkniPercentile];
  const lastBkniColor = BKNI_COLORS[lastBkniPercentile];

  return (
    <Flex direction="column" align="center">
      <svg
        width={180}
        height={100}
        style={{
          transform: 'scaleX(-1)',
        }}
      >
        <defs>
          <linearGradient id="bkni-gradient">
            <stop offset="0%" stopColor={`var(--${bkniColor}-indicator)`} />
            <stop offset="50%" stopColor={`var(--${bkniColor}-indicator)`} />
            <stop
              offset="100%"
              stopColor={`var(--${lastBkniColor}-indicator)`}
            />
          </linearGradient>
        </defs>

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
          stroke="url(#bkni-gradient)"
          strokeWidth={20}
          strokeDasharray={(160 - 80 * bkniFraction) * Math.PI}
          strokeDashoffset={(160 - 80 * bkniFraction) * Math.PI}
        />
      </svg>

      <Flex direction="column" align="center" mt="-8">
        <Text weight="bold" size="8">
          {bkniMetric}
        </Text>

        <Popover.Root>
          <Popover.Trigger>
            <Button color="gray" size="2" variant="ghost">
              <TimerIcon />
              {strings.common.bkni_percentile[bkniPercentile]}
            </Button>
          </Popover.Trigger>

          <Popover.Content align="center">
            <Flex
              direction="column"
              style={{
                width: 'fit-content',
              }}
            >
              <Flex direction="column" mb="3">
                <Heading weight="bold" size="5">
                  BlitzKit Neutrality Index
                </Heading>
                <Text size="2" color="gray" wrap="wrap">
                  A next generation performance metric
                </Text>
              </Flex>

              {BKNI_PERCENTILES.map(({ percentile, min }, index) => (
                <Button radius="none" color={BKNI_COLORS[percentile]}>
                  <Flex align="center" justify="between" width="100%" gap="2">
                    <Text>{strings.common.bkni_percentile[percentile]}</Text>
                    <Text size="1">
                      {min} - {BKNI_PERCENTILES[index + 1]?.min ?? 200}
                    </Text>
                  </Flex>
                </Button>
              ))}
            </Flex>
          </Popover.Content>
        </Popover.Root>
      </Flex>
    </Flex>
  );
}
