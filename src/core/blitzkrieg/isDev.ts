export default function isDev() {
  return (
    process.env.NODE_ENV === 'development' ||
    location?.host.startsWith('blitzkrieg-git')
  );
}
