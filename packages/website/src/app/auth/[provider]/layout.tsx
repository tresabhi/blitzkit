import { PROVIDERS } from './page';

export async function generateStaticParams() {
  return PROVIDERS.map((provider) => ({ provider }));
}
