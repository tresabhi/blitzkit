export const discordToken = process.env.DISCORD_TOKEN!;
export const wargamingApplicationId = process.env.WARGAMING_APPLICATION_ID!;

if (!discordToken) {
  throw new Error('No Discord token provided');
}
if (!wargamingApplicationId) {
  throw new Error('No Wargaming application id provided}');
}
