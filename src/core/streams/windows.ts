import { ByteStream } from './byte';

export class WindowsStream extends ByteStream {
  dword() {
    return this.uint32();
  }
}
