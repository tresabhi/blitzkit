const isDevBoolean = process.env.NODE_ENV === 'development';

export default function isDev() {
  return isDevBoolean;
}
