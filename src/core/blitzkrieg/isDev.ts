const devHostStartNames = ['blitzkrieg-', 'localhost'];

export default function isDev() {
  console.log(
    process.env,
    typeof window !== 'undefined' && window.location.host,
  );

  return (
    process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' &&
      devHostStartNames.some((name) => window.location.host.startsWith(name)))
  );
}
