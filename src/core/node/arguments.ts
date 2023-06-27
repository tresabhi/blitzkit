export const DISCORD_TOKEN = process.env.DISCORD_TOKEN!;
export const WARGAMING_APPLICATION_ID = process.env.WARGAMING_APPLICATION_ID!;

if (!DISCORD_TOKEN) {
  throw new Error('No Discord token provided');
}
if (!WARGAMING_APPLICATION_ID) {
  throw new Error('No Wargaming application id provided}');
}
