import { Root } from 'protobufjs';
import { context } from '../blitzkit/context';

export async function lookup(proto: string) {
  const [file, message] = proto.split('/')[0];
  const root = await new Root().load(
    context === 'server'
      ? `public/protos/${file}.proto`
      : `/protos/${file}.proto`,
    { keepCase: true },
  );

  return root.lookupType(message);
}
