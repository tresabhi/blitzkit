export type ChildrenArgument = string | string[];

export default function Children(children: string[]) {
  return children.join('\n');
}
