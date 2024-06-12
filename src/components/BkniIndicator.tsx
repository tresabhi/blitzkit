import { TimerIcon } from '@radix-ui/react-icons';
import {
  Button,
  Flex,
  FlexProps,
  Heading,
  Popover,
  Text,
} from '@radix-ui/themes';
import { parseBkni } from '../core/blitzkit/parseBkni';
import {
  BKNI_COLORS,
  BKNI_PERCENTILES,
} from '../core/statistics/getBkniPercentile';
import strings from '../lang/en-US.json';

type BkniIndicatorProps = FlexProps & {
  bkni: number;
};

export function BkniIndicator({ bkni, ...props }: BkniIndicatorProps) {
  const { bkniColor, bkniFraction, bkniMetric, bkniPercentile } =
    parseBkni(bkni);

  return (
    <Flex direction="column" align="center" {...props}>
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
          stroke="var(--color-surface)"
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
          stroke={`var(--${bkniColor}-indicator)`}
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
            <Button
              style={{ position: 'relative' }}
              color="gray"
              size="2"
              variant="ghost"
            >
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
              <Flex direction="column" mb="3" align="center">
                <Heading weight="bold" size="5">
                  BkNI
                </Heading>
                <Text size="2" color="gray" wrap="wrap">
                  A next generation performance metric
                </Text>
              </Flex>

              {BKNI_PERCENTILES.map(({ percentile, min }, index) => (
                <Button
                  radius="none"
                  color={BKNI_COLORS[percentile]}
                  key={percentile}
                >
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
