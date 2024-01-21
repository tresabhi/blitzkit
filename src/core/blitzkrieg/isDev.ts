export default function isDev() {
  return (
    process.env.NODE_ENV === 'development' ||
    window?.location.host.startsWith('blitzkrieg-git')
  );
}
