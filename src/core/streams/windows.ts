import { BufferStream } from './buffer';

export class WindowsStream extends BufferStream {
  dword() {
    return this.uint32();
  }
}
