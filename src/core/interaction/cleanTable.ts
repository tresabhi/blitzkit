export type TableInput = ([] | [string, string | number])[];

export default function cleanTable(input: TableInput) {
  return input
    .filter((array) => array[1] !== `${-Infinity}`)
    .map((array) => (array.length === 0 ? '' : `**${array[0]}**: ${array[1]}`))
    .join('\n');
}
