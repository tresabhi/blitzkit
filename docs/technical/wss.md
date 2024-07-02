# Weighted Standard Score (WSS)

A next generation metric in judging player performance.

## Pre-requisites

This paper delves deep into mathematics and statistics which most may not be familiar with. You will need some basic understanding of normal distributions, correlation analysis, regressions, summation, and set builder notation.

## Preface

WSS delivers a single, easy to consume number that measures the performance of a player independent to their winrate so that it is easy to judge their contribution to the team regardless of the performance of the other players in the team. This allows you to judge wether the player in question is "pulling their own weight."

The mathematics behind this metric has been intentionally generalized such that it isn't limited to just World of Tanks Blitz. You will be easily able to apply this metric in any other game/sport.

## Understanding The Metric

On average, the score across all players will be $0$. This is because the metric is essentially a convolution of multiple standard scores and their corresponding weights. A standard score of $z=\pm1$ implies an offset by $\pm\sigma$ ($1$ standard deviation) from $\mu$ (the mean). And since the scalar of WSS is $C=100$, $z=\pm1\iff Z=\pm C1=\pm100$ (note that capital letter $Z$ is the WSS metric and $z$ is the regular standard score).

About $68.3\%$ of players lie within $\pm1\sigma\implies Z=\pm100$, about $95.4\%$ of players lie within $\pm2\sigma\implies Z=\pm200$, and about $99.7\%$ of players lie within $\pm3\sigma\implies Z=\pm300$.

## Computation

The final metric, $M$, is an integer where $0$ is the average score across all players, $-100$ is $-\sigma$ away from $\mu$, and $100$ is $\sigma$. This allows for a clear distinction between players that are hurting the team and who are actually helping since players with a negative score have a negative standard score, tied tightly with basic distributional statistics.

$M$, the human-readable metric, is a function of $Z$, the raw score where $C=100$ is an arbitrary scaling factor.

$$
M=\text{round}\left(CZ\right)
$$

$Z$ is the weighted average of all $z$ ("standard score," which $z$ stands for, will be discussed later) with weights $w$.

$$
Z=\frac{\sum wz}{\sum w}
$$

$w$, the weight of each standard score is just $r$, the correlation coefficient. This value must be determined for each standard scores through corelation analysis. $r$ is allowed to be negative so that standard scores that actually harm the player's winrate will have a negative effect on the weighted average. We will be using the weighted variant of $r$ where $w_i$, the weight of the sample, is the number of battles, $\overline{x}$ the weighted average of the samples' $x$ components and $\overline{y}$ the weighted average of the samples' $y$ components (usually the winrate).

$$
w=r=\frac{\sum w_{i}\left(x_{i}-\overline{x}\right)\left(y_{i}-\overline{y}\right)}{\sqrt{\sum w_{i}\left(x_{i}-\overline{x}\right)^{2}\sum w_{i}\left(y_{i}-\overline{y}\right)^{2}}}
$$

Calculating $\overline{x}$ and $\overline{y}$ is straightforward. Do note that $\mu=\overline{x}$.

$$
\overline{x}=\mu=\frac{\sum w_{i}x_{i}}{\sum w_{i}}
$$

$$
\overline{y}=\frac{\sum w_{i}y_{i}}{\sum w_{i}}
$$

In a similar fashion, we will also need the standard deviation $\sigma$.

$$
\sigma=\sqrt{\frac{\sum w_{i}\left(x_{i}-\mu\right)^{2}}{\sum w_{i}}}
$$

Note that $r$, $\sigma$, $\mu$, $\overline{x}$, and $\overline{y}$ use many of the same summations just in different places. During real computation, I would highly recommend pre-computing all the summations and deploying them to use to avoid excessive computation. This makes a world of difference when sampling hundreds of millions of players.

$z$ is the standard score which uses the precomputed values of $\mu$ and $\sigma$. The variable $x$ represents the input statistic of the player in question.

$$
z=\frac{x-\mu}{\sigma}
$$

## WoTB Specific Notes

Corelation analysis must be performed on a per-tank basis. If the goal is to evaluate the performance of a player instead of the player's performance in a tank, analysis should still be done on all played tanks severalty and must be averages with weights being the number of battles played by the player in each tank.

The Wargaming API provides many pieces of statistics on a per-tank basis (as listed below). These values cumulate over time as the player plays more games; hence, all of these values must be normalized by dividing each metric by `all.battles`. I will go through and list which of the statistics need to be included as standard scores and why/why not. Omitted statistics must not be included and are obvious why they aren't used.

- ✔️ `battle_life_time`: Normalization of this value results in the average time spent alive in seconds. Good players strive to stay alive for as long as possible and must be rewarded while people who "yolo" at the beginning of the game will be penalized.
- ❌ `all.battles`: Dividing this by itself will result in 1. Corelation analysis will always fail due to division by 0.
- ✔️ `all.capture_points`: Capturing points almost always have a negative corelation coefficient; hence, its inclusion is vital to punish players who waste time capturing points.
- ✔️ `all.damage_dealt`
- ✔️ `all.damage_received`
- ✔️ `all.dropped_capture_points`: Dropping capture points by dealing damage to opponents in base capture usually results in a very tiny positive corelation coefficient; nonetheless, it does have an effect on gameplay thus it is included.
- ✔️ `all.frags`
- ❌ `all.frags8p`: This value is `null` on most tanks below tier VIII because it only measures frags of and above tier VIII. Breaks math, pointless feature; do not include.
- ✔️ `all.hits`
- ❌ `all.losses`: Function of winrate.
- ❌ `all.max_frags`: Normalization with division by `all.battles` renders this metric useless. Do not include.
- ❌ `all.max_xp`: Just like `all.max_frags`, this metric does not accumulate over time. Do not include.
- ✔️ `all.shots`
- ✔️ `all.spotted`
- ❌ `all.survived_battles`: Function of winrate.
- ❌ `all.win_and_survived`: Function of winrate.
- ❌ `all.wins`: Function of winrate.
- ❌ `all.xp`: Function of winrate.
