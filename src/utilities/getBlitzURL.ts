export default function getBlitzURL(server: string) {
  return `https://api.wotblitz.${server === 'na' ? 'com' : server}/wotb/`;
}
