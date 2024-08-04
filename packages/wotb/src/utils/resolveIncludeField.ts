export function resolveIncludeField(
  include: string[] = [],
  exclude: string[] = [],
) {
  if (include.length === 0 && exclude.length === 0) return undefined;
  return [...new Set([...include, ...exclude.map((field) => `-${field}`)])];
}
