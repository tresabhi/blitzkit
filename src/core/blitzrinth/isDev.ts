const devHostStartNames = [
  'blitzkrieg-',
  'localhost',
  'betakrieg',
  'devkrieg',
  'blitzrinth-',
];

export default function isDev() {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.VERCEL_ENV === 'preview' ||
    (typeof window !== 'undefined' &&
      devHostStartNames.some((name) => window.location.host.startsWith(name)))
  );
}
