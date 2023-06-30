export default function throwError(message: string, cause?: string) {
  return new Error(message, { cause });
}
