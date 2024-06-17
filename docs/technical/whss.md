# Weighted Hyperbolic Standard Score (WHSS)

A next generation metric in judging player performance.

## Pre-requisites

This paper delves deep into mathematics and statistics which most may not be familiar with. You will need some basic understanding of normal distributions, correlation analysis, regressions, summation notation, hyperbolic trigonometric functions, and set builder notation.

## Preface

WHSS delivers a single, easy to consume number that measures the performance of a player independent to their winrate so that it is easy to judge their contribution to the team regardless of the performance of the other players in the team. This allows you to judge wether the player in question is "pulling their own weight."

The mathematics behind this metric has been intentionally generalized such that it isn't limited to just World of Tanks Blitz. You will be easily able to apply this metric in any other game/sport.

## Computation

The final metric, $M$, is an integer in the range $\left[0,200\right]$ where $100$ is the average score across all players, $0$ is "impossibly" bad, and $200$ is "impossible" good. The reason why I say "impossible" is because this scale is asymptotic. For example, it doesn't make sense to have a player to score $400$ which would imply they are $4$ times better than the average player in a linear scale. Though technically speaking, a score of $0$ or $200$ is asymptotic, rounding to the nearest integer allows for certain players to reach these scores.

$M$, the human-readable metric, is a function of $A$, the raw score in the range $\left(-1,1\right)$, where $C=100$ is an arbitrary scaling and offset factor.

$$
M=\operatorname{round}\left(CA+C\right)
$$

$A$ is the weighted average of all $a$ ("asymptotic scores" will be discussed later) with weights $w$.

$$
A=\frac{\sum wa}{\sum w}
$$

$w$, the weight of each asymptotic score, must be determined using $r$, the correlation coefficient, and $m$, the slope of regression line. Both of these values must be determined for each asymptotic scores through corelation analysis. Formulas for both will be discussed later. Here, $\left|r\right|$ represents the "confidence" of corelation and $m$ represents the actual corelation. $m$ is allowed to be negative such that asymptotic scores that actually harm the player's winrate will have a negative effect on the weighted average.

$$
w=\left|r\right|m
$$

$r$ is the corelation coefficient determined by analysis between the effect of $x_{i}$, any individual statistic like damage dealt normalized by the number of battles, against $y_{i}$, the wins also normalized by the number of battles. Normalizing this way makes $x_{i}$ the average of said statistics over all battles and $y_{i}$ the average winrate. Each player will have their own average $x_{i}$ and $y_{i}$ values which can be used to determine $r$. $n$ here is the number of players sampled to determine $r$.

$$
r=\frac{n\sum x_{i}y_{i}-\sum x_{i}\sum y_{i}}{\sqrt{\left(n\sum x_{i}^{2}-\left(\sum x_{i}\right)^{2}\right)\left(n\sum y_{i}^{2}-\left(\sum y_{i}\right)^{2}\right)}}
$$

$m$, in a similar fashion to $r$ can be computed using the slope of the regression line. In case you are wondering, the y-intercept $b$ of the regression line is a not required in our use case.

$$
m=\frac{n\sum x_{i}y_{i}-\sum x_{i}\sum y_{i}}{n\sum x_{i}^{2}-\left(\sum x_{i}\right)^{2}}
$$

Though not discussed yet, we will also be needing the two constants of a normal distribution. $\mu$ is the mean of the distribution.

$$
\mu=\frac{\sum x_{i}}{n}
$$

In a similar fashion, we will also need the standard deviation $\sigma$.

$$
\sigma=\sqrt{\frac{\sum \left(x_{i}-\mu\right)^{2}}{n}}
$$

Note that $r$, $m$, and $\mu$ use many of the same summations just in different places. During real computation, I would highly recommend pre-computing all the summations and deploying them to use to avoid excessive computation. This makes a world of difference when sampling hundreds of millions of players.

$a$ is the asymptotic score. An individual asymptotic score is a function of $z$, the standard score. We will be using the asymptotic scores for all available statistics except for the winrate to allow us to judge player performance based purely off their contribution to the team regardless of wether they win. $z$, as we will discuss next, is not asymptotic (it's possible for it to reach absurd, incomprehensible values that start to loose meaning in extreme cases); thus, the asymptotic score is simply a transformation of the standard score using hyperbolic tangent.

$$
a=\tanh z
$$

$z$ is the standard score which utilizes both the mean $\mu$ and standard deviation $\sigma$. $x$ here is the performance of the player we are trying to judge.

$$
z=\frac{x-\mu}{\sigma}
$$
