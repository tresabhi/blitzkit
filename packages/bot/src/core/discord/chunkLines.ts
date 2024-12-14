export function chunkLines(lines: string[], joiner = '\n', maxSize = 2000) {
  const chunks = [''];

  lines.map((line) => {
    if (chunks.at(-1)!.length + line.length > maxSize) {
      chunks.push('');
    }

    if (chunks.at(-1)!.length === 0) {
      chunks[chunks.length - 1] += line;
    } else {
      chunks[chunks.length - 1] += joiner + line;
    }
  });

  return chunks;
}
