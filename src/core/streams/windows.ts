import { PrimitiveStream } from './primitive';

export class WindowsStream extends PrimitiveStream {
  dword() {
    return this.uint32();
  }

  uint() {
    return this.uint32();
  }
}
