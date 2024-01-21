export default function isDev() {
  return (
    process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' &&
      window.location.host.startsWith('blitzkrieg-git'))
  );
}
