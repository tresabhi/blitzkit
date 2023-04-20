import { config } from 'dotenv';

config();

export default function tokenRequirements() {
  if (!process.env.DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN is not defined');
  }
  if (!process.env.WARGAMING_APPLICATION_ID) {
    throw new Error('WARGAMING_APPLICATION_ID is not defined');
  }
}
