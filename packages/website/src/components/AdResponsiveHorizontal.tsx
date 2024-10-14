import { Ad, type AdProps } from './Ad';

type AdResponsiveHorizontal = AdProps;

export function AdResponsiveHorizontal(props: AdResponsiveHorizontal) {
  return <Ad height="250px" width="100%" {...props} />;
}
