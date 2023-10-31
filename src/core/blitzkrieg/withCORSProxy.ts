import { context } from './context';

export function withCORSProxy(url: string) {
  return context === 'website'
    ? `https://corsproxy.wotblitz.com/?${encodeURIComponent(url)}`
    : url;
}
