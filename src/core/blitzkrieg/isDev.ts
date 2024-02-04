const devHostStartNames = ['blitzkrieg-', 'localhost'];

export default function isDev() {
  return (
    process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' &&
      devHostStartNames.some((name) => window.location.host.startsWith(name)))
  );
}
