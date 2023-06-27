export type TableInputEntry = [string, string | number] | [];
export type TableInput = TableInputEntry[];

export default function markdownTable(input: TableInput) {
  return input
    .filter((array) => array[1] !== undefined)
    .map((array) => (array.length === 0 ? '' : `**${array[0]}**: ${array[1]}`))
    .join('\n');
}
