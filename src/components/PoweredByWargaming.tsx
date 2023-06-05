import { theme } from '../stitches.config.js';

export default function PoweredByWargaming() {
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
      <img
        src="https://i.imgur.com/jADGWm0.png"
        style={{ height: 16, width: 16 }}
      />
      <span style={{ color: theme.colors.textLowContrast, fontSize: 16 }}>
        Powered by Wargaming
      </span>
    </div>
  );
}
