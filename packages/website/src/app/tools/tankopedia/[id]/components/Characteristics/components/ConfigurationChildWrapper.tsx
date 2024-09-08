import { Flex, FlexProps } from '@radix-ui/themes';
import { ReactNode } from 'react';

type ConfigurationChildWrapperProps = FlexProps & {
  children: ReactNode;
};

export function ConfigurationChildWrapper({
  children,
  ...props
}: ConfigurationChildWrapperProps) {
  return (
    <Flex
      gap="2"
      direction="column"
      align={{ initial: 'center', sm: 'start' }}
      {...props}
    >
      {children}
    </Flex>
  );
}