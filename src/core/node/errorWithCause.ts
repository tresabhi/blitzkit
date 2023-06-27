export default function errorWithCause(message: string, cause: string) {
  return new Error(message, { cause });
}
