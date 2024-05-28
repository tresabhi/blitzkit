import { Heading } from '@radix-ui/themes';
import { TOOLS } from '../constants/tools';
import { imgur } from '../core/blitzkit/imgur';

export default function Page() {
  const tool = TOOLS[0];

  return (
    <>
      {/* <Hero /> */}

      <div
        style={{
          background: `url(${imgur(tool.image)})`,
          height: '50vh',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Heading>Tankopedia</Heading>
      </div>

      <div style={{ flex: 1 }} />
    </>
  );
}
