import { times } from 'lodash';
import { Hero } from './components/Hero';

export default function Page() {
  return (
    <>
      <Hero />

      {times(64, () => (
        <br />
      ))}

      <div style={{ flex: 1 }} />
    </>
  );
}
