export function entityName(entity: string) {
  const [_, ...name] = entity.split('.');
  return name.join('.');
}
