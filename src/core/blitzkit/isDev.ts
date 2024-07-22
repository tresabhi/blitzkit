import { config } from 'dotenv';

config();

const devHostStartNames = [
  'dev',
  'beta',
  'blitzkrieg-',
  'localhost',
  'betakrieg',
  'devkrieg',
  'blitzrinth-',
  'blitzkit-',
];

export default function isDev() {
  if (process.env.NODE_ENV === 'production') return false;

  return (
    process.env.NODE_ENV === 'development' ||
    process.env.VERCEL_ENV === 'preview' ||
    (typeof window !== 'undefined' &&
      devHostStartNames.some((name) => window.location.host.startsWith(name)))
  );
}
