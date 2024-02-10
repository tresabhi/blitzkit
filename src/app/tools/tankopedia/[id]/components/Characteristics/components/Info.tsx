import { CaretDownIcon, CaretUpIcon } from '@radix-ui/react-icons';
import { Flex, Text } from '@radix-ui/themes';
import { ReactNode } from 'react';
import { theme } from '../../../../../../../stitches.config';

export interface InfoProps {
  name: ReactNode;
  children?: ReactNode;
  unit?: string;
  indent?: boolean;
  highlight?: boolean;
  delta?: number;
  decimals?: number;
  prefix?: string;
}

export function Info({
  name,
  children,
  unit,
  indent = false,
  highlight,
  delta,
  decimals,
  prefix,
}: InfoProps) {
  return (
    <Flex
      align="center"
      style={{ width: '100%', paddingLeft: indent ? 24 : 0 }}
      gap="4"
    >
      <Text color={highlight ? 'amber' : undefined}>
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

      {children !== undefined && (
        <div
          style={{
            flex: 1,
            height: 1,
            backgroundColor: highlight
              ? theme.colors.componentCallToActionInteractive_amberAlpha
              : theme.colors.componentCallToActionInteractive_alpha,
          }}
        />
      )}

      {children !== undefined && (
        <Flex align="center" gap="1">
          {delta !== undefined && delta !== 0 && (
            <>
              <Text color={delta > 0 ? 'green' : 'tomato'}>
                {decimals !== undefined
                  ? Math.abs(delta).toFixed(decimals)
                  : Math.abs(delta)}
              </Text>
              <Text color={delta > 0 ? 'green' : 'tomato'}>
                {delta > 0 ? <CaretUpIcon /> : <CaretDownIcon />}
              </Text>
            </>
          )}
          <Text color={highlight ? 'amber' : undefined}>
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
