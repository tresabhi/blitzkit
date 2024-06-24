import { Grid, GridProps } from '@radix-ui/themes';

export function TankCardWrapper(props: GridProps) {
  return (
    <Grid
      py="4"
      columns="repeat(auto-fill, minmax(100px, 1fr))"
      gap="2"
      gapY="6"
      {...props}
    />
  );
}
