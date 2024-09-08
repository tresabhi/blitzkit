import { context } from '@blitzkit/core/src/blitzkit/context';

export function withCORSProxy(url: string) {
  return context === 'website'
    ? `https://corsproxy.io/?${encodeURIComponent(url)}`
    : url;
}
