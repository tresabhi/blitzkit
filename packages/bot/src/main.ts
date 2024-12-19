import { ActivityType } from 'discord.js';
import {
  discoveredIdsDefinitions,
  tankDefinitions,
} from './core/blitzkit/nonBlockingPromises';
import { manager } from './core/discord/manager';

async function setupShardManager() {
  console.log('Pre-manager setup starting...');

  // Set up a promise that resolves when all shards are ready
  const readyShards = new Set();
  const totalShards = manager.totalShards;

  // Create a promise that resolves when all shards are ready
  const allShardsReady = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Shard initialization timed out after 60 seconds'));
    }, 60000); // 60 second timeout

    manager.on('shardCreate', (shard) => {
      console.log(`🟡 Launching shard ${shard.id}`);

      shard.on('ready', () => {
        console.log(`🟢 Launched shard ${shard.id}`);
        readyShards.add(shard.id);

        if (readyShards.size === totalShards) {
          clearTimeout(timeout);
          resolve(true);
        }
      });

      shard.on('error', (error) => {
        console.error(`❌ Shard ${shard.id} encountered an error:`, error);
      });

      shard.on('disconnect', () => {
        console.warn(`⚠️ Shard ${shard.id} disconnected`);
      });
    });
  });

  try {
    console.log('Spawning shards...');
    const shards = await manager.spawn();
    console.log('Shards spawned, waiting for ready state...');

    // Wait for all shards to be ready
    await allShardsReady;
    console.log('All shards ready, setting up presence...');

    // Fetch statistics
    let servers = 0;
    let channels = 0;
    let users = 0;

    for (const [, shard] of shards) {
      try {
        const guilds = (await shard.fetchClientValue('guilds.cache')) as any;
        servers += guilds.length;

        for (const guild of guilds) {
          channels += guild.channels.length;
          users += guild.memberCount;
        }
      } catch (error) {
        console.error(`Failed to fetch statistics from shard:`, error);
      }
    }

    const [awaitedTankDefinitions, awaitedDiscoveredIdsDefinitions] =
      await Promise.all([tankDefinitions, discoveredIdsDefinitions]);

    const tanks = Object.values(awaitedTankDefinitions.tanks).length;
    const usernames = awaitedDiscoveredIdsDefinitions.count;

    await manager.broadcastEval(
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

    console.log('Bot startup complete!');
  } catch (error) {
    console.error('Critical error during startup:', error);
    throw error;
  }
}

setupShardManager().catch((error) => {
  console.error('Failed to start the bot:', error);
  process.exit(1);
});
