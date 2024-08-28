# KitScore

A performance metric that makes sense. This metric can be applied to any game, virtual or real. Specific pieces of information relating directly to World of Tanks Blitz will be provided within parentheses and with a "WoTB:" prefix.

KS is driven solely by the behavior of other players and finding meaning of a new observation within a pool of condensed data. Generally, we will be provided with a number of statistics (WoTB: `frags`, `damage_dealt`, `spots`, etc.) including a target statistic that all other statistics try to maximize (WoTB: `winrate`).

If the statistics are cumulative, they will have to be normalized (WoTB: `average.frags = frags / battles`, `average.winrate = wins / battles`). Each player will have such average statistics, giving us many points of data to work with.

Though the averages of a single player is technically a $n + 1$ dimensional vector where $n$ is the number of average statistics that are now the target statistic and the $1$ is the dependent variable/target statistic, we will be working with $n$ 2-dimensional plots of each individual average statistic vs. the target statistic.

## Interpreting Observations

## Computing the Score

The final metric $A$ is the weighted average of individual scores $a$ which are functions of the $i$th statistic.

$$
A=\frac{\sum w_{i}a_{i}}{\sum w_{i}}
$$

The weight $w$ is a slice of the Pearson corelation matrix. The numerator is the corelation between the $i$th statistic and the target statistic $j$ while the denominator the sum of the corelations between the $i$th statistic and all statistics but the target statistic $j$ (including itself which will always result in $r=1$).

$$
w_{i}=\frac{r_{i\leftrightarrow j}^2}{\sum_{i_{k}\neq j}r_{i\leftrightarrow i_{k}}^2}
$$

The atomic score $a_i$ is the normalized integral of the skewed normal till the new observation $x_{i}$ such that the range is $[0,1]$.

$$
a_{i}=\Phi\left(\beta_{i}\right)-2T\left(\beta_{i},\alpha\right)
$$

$\beta$ is extrapolated away to remain concise.

$$
\beta_{i}=\frac{x_{i}-\xi_{i}}{\omega_{i}}
$$

$\Phi$ is the cumulative distribution function of the normal distribution.

$$
\Phi\left(x\right)=\frac{1}{2}\left(1+\operatorname{erf}\left(\frac{x}{\sqrt{2}}\right)\right)
$$

$erf$ is the error function.

$$
\operatorname{erf}\left(z\right)=\frac{2}{\sqrt{\pi}}\int_{0}^{z}e^{-t^{2}}dt
$$

$T$ is Owen's T function to deal with skewness.

$$
T\left(h,a\right)=\frac{1}{2\pi}\int_{0}^{a}\frac{e^{-\frac{1}{2}h^{2}\left(1+x^{2}\right)}}{1+x^{2}}dx
$$
