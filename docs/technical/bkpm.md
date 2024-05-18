![Neutrality Index](https://i.imgur.com/XcGy5rh.png 'Neutrality Index')

# BlitzKit Neutrality Index

> [!CAUTION]
> This is a working draft and is incomplete. Do not implement.

## Why BkPM over WN8?

BkPM addresses a lot of issues with WN8:

- WN8 incorporates win rate into the metric; a metric like this must be a correlate of win rate, not a dependent
- The weights and biases are not dynamic and their formulation is not transparent
- WN8 values do not asymptote under extreme conditions resulting in meaninglessly large or negative values
- WN8 has too many digits; it doesn't make sense to differentiate between players with sub-one-thousandth's worth of precision

## Preface

The goal of this paper is to deliver a numerical metric for judging player performance by converging all statistics down to a single, easy-to-consume, human-readable value. This must be a mathematically elegant process that yields a reasonable number that asymptotes under extreme situations. More specifically, this value should equal 0, on average across all players and tanks. Extreme cases should be mapped onto the range $[-1, 1]$. To attain the human readable value, we will be transforming the raw metric to a scale of $[0, 2s]$ using $M=\operatorname{round}\left(sR+s\right)$ where $M$ is the resulting human-readable metric, $s = 100$ is an arbitrary scaling factor, and $R$ is the raw metric.

Wargaming provides cumulative statistics for players and tanks. The big idea is to average all provided statistics together to get one unified value. We will also incorporate other composite values based on these default statistics into the average. However, averaging this way poses two problems:

1. All statistics do not scale equally. For example, good players performing with 3,000 damage per battle could also attain a kill-to-death ratio of 3. But averaging them as-is would imply damage per battle has weight 1000 times that of the kill ratio. In other words, damage per battle would totally diminish the impact of kill ratios on the average. Hence, there’s a need for normalization. Normalization, in most cases, simply means dividing by the corresponding averages.
2. All statistics are not equally important. For example, dealing damage is arguably far more important than base capture; hence, it does not make sense to average them together. But this does not mean we totally discard this value as it does make an impact albeit very small. Instead, we will be incorporating weighted averages where the weights will be calculated through correlational analysis against win rate. Specifically, the weights of the statistics will be the corresponding correlation coefficient, r. One caveat to look out for is that r can be negative for statistics like damage received which must be minimized. Fortunately, negative weights are okay and make intuitive sense; after all, bleeding health should punish the metric.

## Computation

$\mu$ is a simple weighted average of statistics across all players where $C_{battles}$ is the number of player battles and $x_{i}$ is the statistic for player $i$.

$$
\mu=\frac{\sum_{ }^{ }C_{battles}x_{i}}{\sum_{ }^{ }C_{battles}}
$$

$\sigma$ is the standard deviation of the statistic across all players. Below is a refresher of the formula where $x_{i}$ is the statistic for player $i$ and $n$ is the number of players (or the sample size).

$$
\sigma=\sqrt{\frac{\sum_{ }^{ }\left(x_{i}-\mu\right)^{2}}{n}}
$$

A normalized atomic statistic is provided by the equation below where $x$ is the player's statistic being evaluated, $\mu$ is the mean of the statistic across all players, and $\sigma$ is the standard deviation of the statistic across all players. During computation, one may pre-compute and reuse $\gamma=x-\mu$.

$$
A=\frac{x-\mu}{\left|x-\mu\right|}\left(1-e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^{2}}\right)=\frac{\gamma}{\left|\gamma\right|}\left(1-e^{-\frac{1}{2}\left(\frac{\gamma}{\sigma}\right)^{2}}\right)
$$

$r$ is the correlation coefficient of the statistic across all players. Below is a refresher of the formula where $x_{i}$ is the statistic for player, $y_{i}$ is the player's win rate, $\mu$ is the mean of the statistic across all players, and $\overline{y}$ is the average win rate across all players.

$$
r=\frac{\sum_{ }^{ }\left(x_{i}-\mu\right)\left(y_{i}-\overline{y}\right)}{\sqrt{\sum_{ }^{ }\left(x_{i}-\mu\right)^{2}\sum_{ }^{ }\left(y_{i}-\overline{y}\right)^{2}}}
$$

$m$ is the slope of the least squares regression line. Below is a refresher of the formula where $x_i$ is the player's statistic being evaluated, $y_i$ is the player's win rate, and $n$ is the number of players (or the sample size).

$$
m=\frac{n\sum_{ }^{ }x_{i}y_{i}-\sum_{ }^{ }x_{i}\sum_{ }^{ }y_{i}}{n\sum_{ }^{ }x_{i}^{2}-\left(\sum_{ }^{ }x_{i}\right)^{2}}
$$

The weight of an atomic statistic is $w$ where $r$ is the correlation coefficient between the statistic and win rate, $\mu$ is the mean of the statistic across all players, and $m$ is the slope of the least squares regression line.

$$
w=\mu mr
$$

The raw metric is the weighted average of all atomic statistics.

$$
R=\frac{\sum_{ }^{ }wA}{\sum_{ }^{ }w}
$$

The final human-readable metric will be passed through the following transformation where $s=100$.

$$
M=\operatorname{round}\left(sR+s\right)
$$

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

We will be using the standard deviation and the mean of each metric supplied to this expression below to normalize each metric in the range $[-1, 1]$. The goal is to map the mean of the statistic to $0$, and the extrema to $-1$ and $1$ (whichever direction that may be in).

$$
\frac{x-\mu}{\left|x-\mu\right|}\left[1-e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^{2}}\right]
$$

During computation, one may pre-compute and reuse $\gamma=x-\mu$ in:

$$
\frac{\gamma}{\left|\gamma\right|}\left[1-e^{-\frac{1}{2}\left(\frac{\gamma}{\sigma}\right)^{2}}\right]
$$

Here is an example of HisRoyalFatness scoring a very high $0.988$ with the frags metric with his [XM551 Sheridan](https://blitzkit.app/tools/tankopedia/20257). $\mu=0.7694$, $\sigma=0.2492$, and $x=1.5113$, HisRoyalFatness' average frags. At $x = 0$ (if the player manages to get no frags), the metric drops nearly to $-1$ and vice versa. And, at $x=\mu$, the metric is exactly $0$.

![](https://i.imgur.com/aIUQmGF.png)

### Derivation

We start with the standard normal distribution formula

$$
\frac{1}{\sigma\sqrt{2\pi}}e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^{2}}
$$

![](https://i.imgur.com/a10m8Xz.png)

We remove the coefficient to transform the range of the function from $\left(0,\frac{1}{\sigma\sqrt{2\pi}}\right]$ to $\left(0,1\right]$. From this point onwards, I will be using the substitution $\gamma=x-\mu$.

$$
e^{-\frac{1}{2}\left(\frac{\gamma}{\sigma}\right)^{2}}
$$

![](https://i.imgur.com/67DO69i.png)

Then we mirror the function across $y=\frac{1}{2}$ to allow the function to be rewarding as you reach the extrema.

$$
1-e^{-\frac{1}{2}\left(\frac{\gamma}{\sigma}\right)^{2}}
$$

![](https://i.imgur.com/1J0cTyb.png)

Finally, to punish the function as you approach the left extreme, we flip the sign of the function when $x<\mu$. One may choose to implement this as a piece-wise function (especially when implementing this in a computer), but I have chosen to represent it as one unified coefficient in this paper.

$$
\frac{\gamma}{\left|\gamma\right|}\left[1-e^{-\frac{1}{2}\left(\frac{\gamma}{\sigma}\right)^{2}}\right]
$$

![](https://i.imgur.com/O8stVlJ.png)
