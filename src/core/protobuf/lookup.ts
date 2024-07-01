import { Root } from 'protobufjs';
import { context } from '../blitzkit/context';

export async function lookup(proto: string) {
  const name = proto.split('.')[0];
  const root = await new Root().load(
    context === 'server'
      ? `public/protos/${name}.proto`
      : `/protos/${name}.proto`,
    { keepCase: true },
  );

  return root.lookupType(proto);
}
