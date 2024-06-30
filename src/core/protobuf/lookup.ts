import { Root } from 'protobufjs';

export async function lookup(proto: string) {
  const root = await new Root().load(
    `src/protos/${proto.split('.')[0]}.proto`,
    { keepCase: true },
  );

  return root.lookupType(proto);
}
