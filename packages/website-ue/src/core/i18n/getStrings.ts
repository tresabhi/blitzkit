import en from '@strings/en.json' with { type: 'json' };
import { merge } from 'lodash-es';
import type { BlitzKitStrings } from 'packages/i18n/src';

export async function getStrings(locale: string) {
  const strings = await import(`../../../../i18n/strings/${locale}.json`);
  return merge({}, en, strings) as BlitzKitStrings;
}
