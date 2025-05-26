import { useEffect } from 'react';

export function TestComponent({ data }: { data: any }) {
  useEffect(() => {
    console.log(data);
  }, []);

  return 'TestComponent';
}
