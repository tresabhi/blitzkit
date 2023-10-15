import { manager } from './core/discord/manager';

manager.on('shardCreate', (shard) => {
  console.log(`🟡 Launching shard ${shard.id}`);
  shard.on('ready', () => console.log(`🟢 Shard ${shard.id} launched`));
});

manager.spawn();
