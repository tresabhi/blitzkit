import { manager } from './core/discord/manager';

console.log('pre manager event listeners and spawn');

manager
  .on('shardCreate', (shard) => {
    console.log(`🟡 Launching shard ${shard.id}`);
    shard.on('ready', () => console.log(`🟢 Launched shard ${shard.id}`));
  })
  .spawn();

console.log('post manager event listeners and spawn');
