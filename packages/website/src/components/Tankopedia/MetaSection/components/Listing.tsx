import { Flex, Text, type TextProps } from '@radix-ui/themes';

type ListingProps = TextProps & {
  label: string;
};

export function Listing({ label, ...props }: ListingProps) {
  return (
    <Flex minWidth="15rem" justify="between" gap="4">
      <Text color="gray">{label}</Text>
      <Text align="right" {...props} />
    </Flex>
  );
}
