import { resolveIncludeField } from './resolveIncludeField';

export function resolveParams(
  params: {},
  include: string[] = [],
  exclude: string[] = [],
) {
  return { fields: resolveIncludeField(include, exclude), ...params };
}
