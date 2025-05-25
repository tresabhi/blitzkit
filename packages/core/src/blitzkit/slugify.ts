import { deburr } from 'lodash-es';

const nonAlphanumericRegex = /[^a-z0-9]/g;
const multipleDashesRegex = /--+/g;
const trailingDashRegex = /-$/g;
const leadingDashRegex = /^-/g;

export function slugify(name: string) {
  let slug = deburr(name).toLowerCase();
  slug = slug.replaceAll(nonAlphanumericRegex, '-');
  slug = slug.replaceAll(multipleDashesRegex, '-');
  slug = slug.replaceAll(trailingDashRegex, '');
  slug = slug.replaceAll(leadingDashRegex, '');

  return slug;
}
