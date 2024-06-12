import { Flex, FlexProps, Text } from '@radix-ui/themes';
import { ReactNode } from 'react';

type SpeedometerProps = FlexProps & {
  value: ReactNode;
  color: string;
  fill: number;
  label: ReactNode;
};

export function Speedometer({
  value,
  color,
  fill,
  label,
  ...props
}: SpeedometerProps) {
  return (
    <Flex direction="column" align="center" {...props}>
      <svg
        width={180}
        height={98}
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
          stroke={`var(--${color}-3)`}
          strokeWidth={16}
          strokeDasharray={80 * Math.PI}
          strokeDashoffset={80 * Math.PI}
        />
        <circle
          cx={90}
          cy={90}
          r={80}
          strokeLinecap="round"
          fill="none"
          stroke={`var(--${color}-indicator)`}
          strokeWidth={16}
          strokeDasharray={(160 - 80 * fill) * Math.PI}
          strokeDashoffset={(160 - 80 * fill) * Math.PI}
        />
      </svg>

      <Flex direction="column" align="center" mt="-8">
        <Text weight="bold" size="8" mt="-1">
          {value}
        </Text>

        {label}
      </Flex>
    </Flex>
  );
}
