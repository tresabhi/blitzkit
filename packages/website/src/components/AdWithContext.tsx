import { App } from '../stores/app';
import { Ad, type AdProps } from './Ad';

export function AdWithContext(props: AdProps) {
  return (
    <App.Provider>
      <Ad {...props} />
    </App.Provider>
  );
}
