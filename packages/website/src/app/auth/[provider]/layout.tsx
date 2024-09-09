import { PROVIDERS } from './constants';

export async function generateStaticParams() {
  return PROVIDERS.map((provider) => ({ provider }));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
