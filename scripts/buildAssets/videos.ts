import { google } from 'googleapis';
import { env } from 'process';
import { commitAssets } from '../../src/core/blitzkrieg/commitAssets';

export async function videos(production: boolean) {
  console.log('Building videos...');

  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.VIDEOS_SHEET,
    range: 'Sheet1!A:E',
  });

  if (!response.data.values) {
    console.warn('Google returned no data; skipping videos...');
    return;
  }

  const content = response.data.values
    .slice(1)
    .map((row) => {
      const [idString, ...videosRaw] = row.slice(1);
      const id = Number(idString);
      const videos = videosRaw
        .map((raw) => new URL(raw).searchParams.get('v'))
        .filter((video) => video !== null);
      return `${id},${videos.join(',')}`;
    })
    .join('\n');

  await commitAssets(
    'videos',
    [
      {
        content,
        encoding: 'utf-8',
        path: 'definitions/videos.csv',
      },
    ],
    production,
  );
}
