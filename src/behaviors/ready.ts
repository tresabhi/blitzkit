import { Client } from 'discord.js';
import isDev from '../utilities/isDev.js';

export default function ready(client: Client<true>) {
  console.log(
    `Logged in as ${client.user.tag} in ${
      isDev() ? 'development' : 'production'
    } mode`,
  );
}
