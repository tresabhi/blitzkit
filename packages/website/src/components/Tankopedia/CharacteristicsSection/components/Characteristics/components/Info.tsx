import { CaretDownIcon, CaretUpIcon } from '@radix-ui/react-icons';
import { Flex, Separator, Text } from '@radix-ui/themes';
import type { ReactNode } from 'react';

export interface InfoProps {
  name: ReactNode;
  children?: ReactNode;
  unit?: string;
  indent?: boolean;
  delta?: number;
  decimals?: number;
  prefix?: string;
  deltaType?: 'higherIsBetter' | 'lowerIsBetter';
}

export function Info({
  name,
  children,
  unit,
  indent = false,
  delta,
  decimals,
  prefix,
  deltaType = 'higherIsBetter',
}: InfoProps) {
  return (
    <Flex
      align="center"
      style={{ width: '100%', paddingLeft: indent ? 24 : 0 }}
      gap="4"
    >
      <Text color="gray">
        {name}
        {unit != undefined && (
          <>
            {' '}
            <Text color="gray" size="1">
              {unit}
            </Text>
          </>
        )}
      </Text>

      {children !== undefined && <Separator style={{ flex: 1 }} />}

      {children !== undefined && (
        <Flex align="center" gap="1">
          {delta !== undefined && delta !== 0 && !isNaN(delta) && (
            <>
              <Text
                color={
                  delta * (deltaType === 'lowerIsBetter' ? -1 : 1) > 0
                    ? 'green'
                    : 'tomato'
                }
              >
                {decimals !== undefined
                  ? Math.abs(delta).toFixed(decimals)
                  : Math.abs(delta)}
              </Text>
              <Text
                color={
                  delta * (deltaType === 'lowerIsBetter' ? -1 : 1) > 0
                    ? 'green'
                    : 'tomato'
                }
              >
                {delta > 0 ? <CaretUpIcon /> : <CaretDownIcon />}
              </Text>
            </>
          )}
          <Text>
            {prefix}
            {decimals !== undefined && typeof children === 'number'
              ? children.toFixed(decimals)
              : children}
          </Text>
        </Flex>
      )}
    </Flex>
  );
}
