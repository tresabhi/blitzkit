# KitScore

## Memo

KitScore is a performance metric that makes sense. This metric can be applied to any game, virtual or real. Specific pieces of information relating directly to World of Tanks Blitz will be provided within parentheses and with a "WoTB:" prefix.

## Consumption of Observations

KitScore is driven solely by the behavior of other players and finding meaning of a new observation within a pool of condensed data based on previously observed data. Generally, we will be provided with a number of statistics (the $x_i$ of an observation) per player (WoTB: $x_\text{frags}$, $x_\text{xp}$, $x_\text{spots}$, etc.) including a target statistic (the $x_j$ of an observation) that all other statistics try to maximize (WoTB: "winrate" which we will defined later as $x_j$).

If the statistics are cumulative, they will have to be normalized (WoTB: statistics fetched from Wargaming are indeed cumulative even for a single player; $x_\text{frags}=\frac{\Sigma x_\text{frags}}{\Sigma x_\text{battles}}$, $x_\text{spots}=\frac{\Sigma x_\text{spots}}{\Sigma x_\text{battles}}$, $x_j=\frac{\Sigma x_\text{wins}}{\Sigma x_\text{battles}}$, etc.). Each player will have such average statistics, giving us many points of data to work with. If the statistics are not cumulative, then you will be dealing with multiple observations per player which will only help improve accuracy.

## It's Impossible to "Find What Makes the Metric Tick"

WN8, a widely adopted metric in the World of Tanks and World of Tanks Blitz communities is plagued with problems. One of them being that people often find and exploit "what makes the metric tick." In other words, people easily exploit the rudimentary nature of WN8 to score undeservedly high.

In WN8, the gains of some rewarding categories overshadow the losses of others though that may not necessarily be in the best interest in maximizing winrate. KitScore makes this nearly impossible as it punishes a player for scoring well solely high in a certain category. You will never exploit KitScore. Period.

## Generating Reasonable Values

TODO: there's like no runaway cases

## Symbol Interpretation

| Symbol           | Interpretation                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| $A_\text{human}$ | The human readable version of the raw score $A$.                                                                                                       |
| $A$              | The raw KitScore.                                                                                                                                      |
| $C$              | An arbitrary coefficient.                                                                                                                              |
| $I$              | The number of statistics including the target statistic. This means that there are $I-1$ entries for $x_i$ and $1$ entry for $y$ for each observation. |
| $i$              | The statistic index of where there are $I$ entries.                                                                                                    |
| $j$              | A discriminator for the target statistic. There may never be more than $1$ entries for $j$.                                                            |
| $m$              | The degree of the polynomial regression.                                                                                                               |
| $n$              | The number of observations.                                                                                                                            |
| $a$              | An "atomic" score which is a function of the $i$th statistic.                                                                                          |
| $w$              | The weight of the $i$th atomic statistic.                                                                                                              |

## Computing the Score

The final metric $A_\text{human}$ is an arbitrarily scaled value of the raw score $A$ where $C$ is any coefficient of your liking. BlitzKit uses $C=10^3$.

$$
A_\text{human}=CA
$$

The final metric $A$ is the weighted average of individual scores $a$ which are functions of the $i$th statistic excluding the target statistic $j$ itself.

$$
A=\frac{\sum_{i \neq j} w_{i}a_{i}}{\sum_{i \neq j} w_{i}}
$$

The "atomic" score $a$ is the difference between the predicted target statistic $P_{i \leftrightarrow j}(x_i)$ acquired using a polynomial regression of degree $m$ and the actual newly observed $x_j$.

$$
a_i=x_j-P_{i \leftrightarrow j}(x_i)
$$

The polynomial regression of $m$th degree can be written as follows:

$$
P(x)=\beta_0x^0+\beta_1x^1+\beta_2x^2+\dots+\beta_mx^m
$$

Polynomial regression coefficients $\beta$ can be acquired through basic linear algebra where an $m \times m$ of constants is multiplied with $m \times 1$ of unknowns which equals another $m \times 1$ of constants.

```math
\begin{bmatrix}
\sum_{k=1}^n x_i^0 & \sum_{k=1}^n x_i^1 & \sum_{k=1}^n x_i^2 & \dots & \sum_{k=1}^n x_i^m \\
\sum_{k=1}^n x_i^1 & \sum_{k=1}^n x_i^2 & \sum_{k=1}^n x_i^3 & \dots & \sum_{k=1}^n x_i^{m+1} \\
\sum_{k=1}^n x_i^2 & \sum_{k=1}^n x_i^3 & \sum_{k=1}^n x_i^4 & \dots & \sum_{k=1}^n x_i^{m+2} \\
\vdots & \vdots & \vdots & \ddots & \vdots \\
\sum_{k=1}^n x_i^m & \sum_{k=1}^n x_i^{m+1} & \sum_{k=1}^n x_i^{m+1} & \dots & \sum_{k=1}^n x_i^{2m} \\
\end{bmatrix}

\begin{bmatrix}
\beta_0 \\
\beta_1 \\
\beta_2 \\
\vdots \\
\beta_m
\end{bmatrix}

=

\begin{bmatrix}
\sum_{k=1}^n x_jx_i^0 \\
\sum_{k=1}^n x_jx_i^1 \\
\sum_{k=1}^n x_jx_i^2 \\
\vdots \\
\sum_{k=1}^n x_jx_i^m
\end{bmatrix}
```

The weight $w$ is a slice of the Pearson corelation matrix. The numerator is the corelation between the $i$th statistic and the target statistic $j$ while the denominator the sum of the corelations between the $i$th statistic and all statistics but the target statistic $j$.

$$
w_{i}=\frac{r_{i\leftrightarrow j}^2}{\sum_{i_{k}\neq j}r_{i\leftrightarrow i_{k}}^2}
$$

## Understanding the Corelation Matrix

Forming the corelation matrix will create an $I \times I$ matrix where. This matrix is best represented as a table. The example below illustrates a matrix/table for $I=4$ which includes $3$ entries for $i$ statistics and $1$ entry for the $j$ target statistic.

|       | $x_1$                       | $x_2$                       | $x_3$                       | $x_j$                       |
| ----- | --------------------------- | --------------------------- | --------------------------- | --------------------------- |
| $x_1$ | $1$                         | $r_{1 \leftrightarrow 2}^2$ | $r_{1 \leftrightarrow 3}^2$ | $r_{1 \leftrightarrow j}^2$ |
| $x_2$ | $r_{1 \leftrightarrow 2}^2$ | $1$                         | $r_{2 \leftrightarrow 3}^2$ | $r_{2 \leftrightarrow j}^2$ |
| $x_3$ | $r_{1 \leftrightarrow 3}^2$ | $r_{2 \leftrightarrow 3}^2$ | $1$                         | $r_{3 \leftrightarrow j}^2$ |
| $x_j$ | $r_{1 \leftrightarrow j}^2$ | $r_{2 \leftrightarrow j}^2$ | $r_{3 \leftrightarrow j}^2$ | $1$                         |

It should not be a surprise to find $r_{i \leftrightarrow i}^2=1$ which forms a neat diagonal across the table. Note that there are many duplicates within the $I^2$ entries. The "bottom-right triangle" can be eliminated to remove redundancies leaving us with only $\frac{I(I+1)}{2}$ fields occupied.

|       | $x_1$ | $x_2$                       | $x_3$                       | $x_j$                       |
| ----- | ----- | --------------------------- | --------------------------- | --------------------------- |
| $x_1$ | $1$   | $r_{1 \leftrightarrow 2}^2$ | $r_{1 \leftrightarrow 3}^2$ | $r_{1 \leftrightarrow j}^2$ |
| $x_2$ |       | $1$                         | $r_{2 \leftrightarrow 3}^2$ | $r_{2 \leftrightarrow j}^2$ |
| $x_3$ |       |                             | $1$                         | $r_{3 \leftrightarrow j}^2$ |
| $x_j$ |       |                             |                             | $1$                         |

When programming this matrix into an array, $r_{i \leftrightarrow i}^2=1$ will be redundant. I recommend condensing the matrix into an array of size $\frac{I(I+1)}{2}+I=\frac{I(I-1)}{2}$ to avoid all redundant entries. For $I=4$, the array will look something like the one illustrated below (here, $j=4$).

$$
[r_{1 \leftrightarrow 2}^2, r_{1 \leftrightarrow 3}^2, r_{1 \leftrightarrow 4}^2, r_{2 \leftrightarrow 3}^2, r_{2 \leftrightarrow 4}^2, r_{3 \leftrightarrow 4}^2]
$$

## Understanding the Weights

Some may find the weight equation arbitrary; it evidently isn't. The goal of $w$ is to eliminate over-rewarding the same behavior represented in multiple statistics. It makes all atomic statistics concurrent by leveraging the Pearson corelation matrix.

A simplified example will clarify the idea. First, we compute a Pearson corelation matrix for $I=3$ statistics. We have $x_1$ and $x_2$, the statistics that are trying to maximize $x_j$. Reminder: a Pearson corelation matrix finds the $r$ value not only between $x_i$ and $x_j$ but also between all combinations of $x_i$ and themselves. Here, $r^2$ is calculated using polynomial regression corelation analysis to the $m$th degree.

|       | $x_1$ | $x_2$       | $x_3$ | $x_j$ |
| ----- | ----- | ----------- | ----- | ----- |
| $x_1$ | $1$   | $\boxed{0}$ | $0$   | $1$   |
| $x_2$ |       | $1$         | $0$   | $1$   |
| $x_3$ |       |             | $1$   | $1$   |
| $x_j$ |       |             |       | $1$   |

In the case above, $r^2_{1 \leftrightarrow 2}=0$ meaning that both statistics have absolutely nothing to do with each other. Hence, the player will be awarded for optimizing both individually. And since $r^2_{1 \leftrightarrow j}=r^2_{2 \leftrightarrow j}$, they should both be rewarded equally; in other words, they should have equal weights.

$$
w_{1}=\frac{1}{1 + 0 + 0}=1
$$

$$
w_{2}=\frac{1}{0 + 1 + 0}=1
$$

$$
w_{3}=\frac{1}{0 + 0 + 1}=1
$$

Now consider a case where $x_1$ and $x_2$ are fully correlated. It would be a bad idea to reward them equally; hence, their weights suffer.

|       | $x_1$ | $x_2$       | $x_3$ | $x_j$ |
| ----- | ----- | ----------- | ----- | ----- |
| $x_1$ | $1$   | $\boxed{1}$ | $0$   | $1$   |
| $x_2$ |       | $1$         | $0$   | $1$   |
| $x_3$ |       |             | $1$   | $1$   |
| $x_j$ |       |             |       | $1$   |

$$
w_{1}=\frac{1}{1 + 1 + 0}=0.5
$$

$$
w_{2}=\frac{1}{1 + 1 + 0}=0.5
$$

$$
w_{3}=\frac{1}{0 + 0 + 1}=1
$$
