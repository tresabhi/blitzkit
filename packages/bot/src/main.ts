import { ActivityType } from 'discord.js';
import {
  discoveredIdsDefinitions,
  tankDefinitions,
} from './core/blitzkit/nonBlockingPromises';
import { manager } from './core/discord/manager';

console.log('pre manager event listeners and spawn');

let isFirst = true;
const interval = setInterval(() => {
  if (!isFirst) {
    console.warn('respawning all shards because manager died');
    manager.respawnAll();
  }

  isFirst = false;
}, 5000);

const shards = await manager
  .on('shardCreate', (shard) => {
    clearInterval(interval);
    console.log(`🟡 Launching shard ${shard.id}`);
    shard.on('ready', () => console.log(`🟢 Launched shard ${shard.id}`));
  })
  .spawn();

console.log('post manager event listeners and spawn');

try {
  let servers = 0;
  let channels = 0;
  let users = 0;

  for (const [, shard] of shards) {
    // wtf is this typing bro???
    const guilds = (await shard.fetchClientValue('guilds.cache')) as any;

    servers += guilds.length;

    for (const guild of guilds) {
      channels += guild.channels.length;
      users += guild.memberCount;
    }
  }

  const awaitedTankDefinitions = await tankDefinitions;
  const tanks = Object.values(awaitedTankDefinitions.tanks).length;
  const awaitedDiscoveredIdsDefinitions = await discoveredIdsDefinitions;
  const usernames = awaitedDiscoveredIdsDefinitions.count;

  manager.broadcastEval(
    (client, { servers, users, channels, tanks, usernames }) => {
      const bios = [
        `Living in ${servers.toLocaleString()} servers`,
        `Serving ${users.toLocaleString()} users`,
        `Observing ${channels.toLocaleString()} channels`,
        `Tinkering with ${tanks.toLocaleString()} tanks`,
        `Memorizing ${usernames.toLocaleString()} usernames`,
      ];

      client.user?.setPresence({
        activities: [
          {
            type: ActivityType.Custom,
            name: bios[Math.floor(Math.random() * bios.length)],
          },
        ],
      });
    },
    { context: { servers, channels, users, tanks, usernames } },
  );
} catch (error) {
  console.warn(
    'An error occurred when setting up presence, ignoring to keep the process alive',
    error,
  );
}
