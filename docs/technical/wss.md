# Weighted Standard Score (WSS)

A next generation metric in judging player performance.

## Pre-requisites

This paper delves deep into mathematics and statistics which most may not be familiar with. You will need some basic understanding of normal distributions, correlation analysis, regressions, summation, set builder notation, and calculus.

## Preface

WSS delivers a single, easy to consume number that measures the performance of a player independent to their winrate so that it is easy to judge their contribution to the team regardless of the performance of the other players in the team. This allows you to judge wether the player in question is "pulling their own weight."

The mathematics behind this metric has been intentionally generalized such that it isn't limited to just World of Tanks Blitz. You will be easily able to apply this metric in any other game/sport.

## Understanding The Metric

On average, the score across all players will be $0$. This is because the metric is essentially a convolution of multiple standard scores and their corresponding weights. A standard score of $z=\pm1$ implies an offset by $\pm\sigma$ ($1$ standard deviation) from $\mu$ (the mean). And since the scalar of WSS is $C=1000$, $z=\pm1\iff M=\pm 1C=\pm1000$.

About $68.3\%$ of players lie within $\pm1\sigma\implies M=\pm1000$, about $95.4\%$ of players lie within $\pm2\sigma\implies M=\pm200$, and about $99.7\%$ of players lie within $\pm3\sigma\implies M=\pm300$.

## Computation

The final metric, $M$, is an integer where $0$ is the average score across all players, $-1000$ is $-\sigma$ away from $\mu$, and $1000$ is $\sigma$. This allows for a clear distinction between players that are hurting the team and who are actually helping since players with a negative score have a negative standard score, tied tightly with basic distributional statistics.

$M$, the human-readable metric, is a function of $Z$, the raw score where $C=1000$ is an arbitrary scaling factor.

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

## Human-Readability

### Bar Size and Position

> [!NOTE]
> The bar colors in the example graphics below may not be representative of the real scale. Read "Bar Color" for more details.

Presenting $M$ may not be sufficient in conveying the metric. It is convention to display a "progress bar" that directly represents the percentile of the player which can be derived directly from the raw score, $Z$, since its a weighted average of standard scores.

A standard score of $z=0.65\implies Z=650$ corresponds to the $75\%$ percentile. That is $25\%$ above the average $50\%$. This is visualized by a green bar halfway full.

![](https://i.imgur.com/MdKZj36.png)

$z=1.20\implies Z=1200$ is the $88\%$ percentile. The bar is now three quarters full.

![](https://i.imgur.com/p1vG7B2.png)

Thus, by extension, negative scores are red bars originating from the right. $z=-1.20\implies Z=-1200$ is the $12\%$ percentile.

![](https://i.imgur.com/0ncSOn4.png)

Generalizing this, for any given raw score $Z$, the percentile can be calculated as follows.

$P=\Phi\left(Z\right)$

And $\Phi$ is the cumulative distribution function. That being said, most languages will offer some library or built-in function to compute $\Phi$.

$\Phi\left(x\right)=\frac{1}{\sqrt{2\pi}}\int_{-\infty}^{x}e^{-\frac{t^{2}}{2}}dt$

For any given value of $P$, the size of the bar is $B$.

$B=\left|2P-1\right|$

The bar originates from the left if $P>0.5=50\%\iff Z>0\implies M\ge0$ ($M$ may still be $0$ due to rounding). It originates from the right if $P<0.5=50\%\iff Z=0\implies M\le0$. And when $P=0.5=50\%\iff Z=0\implies M=0$, it is completely empty.

### Bar Color

The color of the bar is also a function of the percentile. $\Phi$ isn't a cheap function, so I would recommend computing these on-demand and memoize the results. Or, alternatively, you could precompute the associated $Z$ values for $P$ and use those to determine the colors. The colors that [BlitzKit](https://blitzkit.app/) uses are shown in the image below.

![](https://i.imgur.com/3T4BchO.png)

BlitzKit uses [Radix Colors](https://www.radix-ui.com/colors/docs/palette-composition/scales) and the scales used in the image above are as follows respectively.

- tomato
- orange
- amber
- yellow
- lime
- green
- teal
- cyan
- pink
- plum
- purple

## FAQ

### (WoTB specific) Why WSS over WN8?

- Lot less aggressive: the weights of WN8 are disproportionately distinct from one another allow people to easily find "what makes the metric tick" and exploit it to "farm" higher WN8 with that being the only the explicit goal. WSS, on the other hand, because of its symmetric and normal nature, will remain at a similar value even if a player choses to aggressively maximize one statistic.
- Mathematically grounded: every constant of WSS is based in data. Unlike WN8, it is recommended to recompute the constants of WSS often. In BlitzKit's implementation, an approximate 24 million players are samples every day to keep the metric relevant.
- Easy to read: WN8 provides no clear indication of where the average is. WSS, on the other hand, clearly states that negative scores cause a lower than average chances of winning, a positive score causes a higher chance of winning, and 0 being the average.
- Doesn't use winrate: WSS is strictly not a function of winrate. WN8, on the other hand, is majorly influenced by winrate and even XP. WSS is a measurement of your true performance regardless of what RNG may throw at you.

### Why doesn't the weight include the slope of the linear regression?

Doing this would make $w=\left|r\right|m$ or $w=r^{2}m$ where $\left|r\right|$ or $r^{2}$ represents the "confidence" in the standard score and $m$ is the "rate of effectiveness". Doing this was decided against because a drop in $m$ inherently implies a drop in the corelation $r$.

To rephrase, this is what real data looks like where $r$ drops with $m$; there is no need to include both (https://www.desmos.com/calculator/0p5kye1s7z).

![](https://i.imgur.com/6gHCYUZ.gif)

And this is what real data **DOES NOT** look like where $r$ remains constant as $m$ drops (https://www.desmos.com/calculator/5yfl2ulemf).

![](https://i.imgur.com/iCbuun3.gif)

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
