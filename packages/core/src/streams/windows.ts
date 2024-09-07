import { ReadStream } from './buffer';

export class WindowsReadStream extends ReadStream {
  dword() {
    return this.uint32();
  }
}
