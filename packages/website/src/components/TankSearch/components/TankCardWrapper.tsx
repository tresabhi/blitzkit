import { Grid, type GridProps } from '@radix-ui/themes';

export function TankCardWrapper(props: GridProps) {
  return (
    <Grid
      py="4"
      columns={{
        initial: 'repeat(auto-fill, minmax(6rem, 1fr))',
        sm: 'repeat(auto-fill, minmax(7rem, 1fr))',
      }}
      flow="dense"
      gap="2"
      gapY="6"
      {...props}
    />
  );
}
