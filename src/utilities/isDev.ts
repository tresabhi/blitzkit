const isDevBoolean = process.argv.includes('--dev');

export default function isDev() {
  return isDevBoolean;
}
