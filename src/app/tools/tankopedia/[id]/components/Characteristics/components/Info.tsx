import { Flex, Text } from '@radix-ui/themes';
import { ReactNode } from 'react';
import { theme } from '../../../../../../../stitches.config';

interface InfoProps {
  name: string;
  children?: ReactNode;
  unit?: string;
  indent?: boolean;
  highlight?: boolean;
}

export function Info({
  name,
  children,
  unit,
  indent = false,
  highlight,
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
        <Text color={highlight ? 'amber' : undefined}>{children}</Text>
      )}
    </Flex>
  );
}
