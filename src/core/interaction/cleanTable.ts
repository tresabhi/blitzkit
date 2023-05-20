export type TableInputEntry = [string, string | number] | [];
export type TableInput = TableInputEntry[];

export default function cleanTable(input: TableInput) {
  return input
    .filter((array) => array[1] !== `${-Infinity}`)
    .map((array) => (array.length === 0 ? '' : `**${array[0]}**: ${array[1]}`))
    .join('\n');
}
