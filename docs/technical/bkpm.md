<div style="display: flex; flex-direction: column; align-items: center">
  <img src="https://i.imgur.com/ytgXskL.png">
  <h1>BlitzKit Performance Metric</h1>
  <span>Revision 1</span>
</div>

## Preface

> [!CAUTION]
> This is a working draft and is incomplete. Do not implement.

The goal of this paper is to deliver a numerical metric for judging player performance by converging all statistics down to a single, easy-to-consume, human-readable value. This must be a mathematically elegant process that yields a reasonable number that asymptotes under extreme situations. More specifically, this value should equal 1, on average across all players and tanks. Extreme cases should be mapped between 0 and 2. This value will be multiplied by 100 and rounded to the nearest integer for readability purposes.

Wargaming provides cumulative statistics for players and tanks. The big idea is to average all provided statistics together to get one unified value. We will also incorporate other composite values based on these default statistics into the average. However, averaging this way poses two problems:

1. All statistics do not scale equally. For example, good players performing with 3,000 damage per battle could also attain a kill-to-death ratio of 3. But averaging them as-is would imply damage per battle has weight 1000 times that of the kill ratio. In other words, damage per battle would totally diminish the impact of kill ratios on the average. Hence, there’s a need for normalization. Normalization, in most cases, simply means dividing by the corresponding averages.
2. All statistics are not equally important. For example, dealing damage is arguably far more important than base capture; hence, it does not make sense to average them together. But this does not mean we totally discard this value as it does make an impact albeit very small. Instead, we will be incorporating weighted averages where the weights will be calculated through correlational analysis against win rate. Specifically, the weights of the statistics will be the corresponding correlation coefficient, r. One caveat to look out for is that r can be negative for statistics like damage received which must be minimized. Fortunately, negative weights are okay and make intuitive sense; after all, bleeding health should punish the metric.

## Constants

A few constants that the rest of the paper depends on. Available under the “constants” object.

```ts
players_per_team = 7;
```

## Wargaming-Provided Statistics

Wargaming provides the following pieces of statistics for each player and tank. These are cumulative; in other words, they simply add up over time and it is up to the recorder to contrast two snapshots of said statistics in time to get periodical statistics. Available under the “all” object.

```ts
battles;
capture_points;
damage_dealt;
damage_received;
dropped_capture_points;
frags; // kills
frags8p; // frags against tanks at or above tier 8
hits;
losses;
max_frags;
max_frags_tank_id;
max_xp;
max_xp_tank_id;
shots;
spotted;
survived_battles;
win_and_survived;
wins;
xp;
```

## Composite Statistics

Raw statistics from Wargaming can be combined into more meaningful numeric snippets. Most of these values are divided by all.battles indicating they are the average across all battles in the given period. Assigned under the “composite” object.

```ts
win_rate = all.wins / all.battles;
capture_points = all.capture_points / all.battles;
damage_dealt = all.damage_dealt / all.battles;
damage_received = all.damage_received / all.battles;
dropped_capture_points = all.dropped_capture_points / all.battles;
frags = all.frags / all.battles;
hits = all.hits / all.battles;
shots = all.shots / all.battles;
spotted = all.spotted / all.battles;
survival_rate = all.survived_battles / all.battles;
xp = all.xp / all.battles;
damage_ratio = all.damage_dealt / all.damage_received;
accuracy = all.hits / all.shots;
damage_per_hit = composite.damage_dealt / composite.hits;
```

## Normalized Statistics

The goal is to adjust all values such that each value individually averages out to 1 across all players. Most normalizations are simple. The more complex ones will be represented mathematically. Assigned under the “normalized” object.

```
win_rate = composite.win_rate / average.win_rate
damage_dealt = composite.damage_dealt / tier_average.health
damage_received = composite.damage_received / tier_average.health
```

Now the complex normalizations.

### `frags`

On average, a player kills 1 player on the enemy team. However, the max is 7. We need to map 0 frags to 0, 1 to 1, and 7 to 2 to maintain, for the lack of a better term, an asymptotic behavior in extreme cases. $\sqrt{x}$ serves as an excellent choice as a parent function as it already features points $\left( 0, 0 \right)$ and $\left( 1, 1 \right)$. However, at $x = 7 \Leftrightarrow y = \sqrt{7}$ but we desire 2. We can achieve this by applying a coefficient of $\frac{2}{\sqrt{7}}$. This however shifts the point $\left( 1, 1 \right)$; hence, we have to linearly interpolate the coefficient between 1 and $\frac{2}{\sqrt{7}}$ on the interval $\left[ 1, 6 \right]$. Proof for the coefficient is left as an exercise for the reader.

$$
normalized.frags = \left[ \frac{composite.frags - 1}{constants.players\_per\_team - 1} \left( \frac{2}{\sqrt{constants.players\_per\_team}} -1 \right) +1 \right] \sqrt{composite.frags}
$$
