import { use } from 'react';

export function TestComponent() {
  const content = use(
    fetch('https://example.com/').then((response) => response.text()),
  );

  return <pre children={content} />;
}
