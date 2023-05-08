import fetch from 'node-fetch';
import { AllStats } from '../types/accountInfo.js';

/*
[
  {
    "_id": 1,
    "battle_life_time": 87518,
    "total_battle_life_time": 875184684,
    "number_of_players": 10000,
    "tank_id": 1,
    "all": {
      "spotted": 616.4213,
      "hits": 3994.2422,
      "wins": 290.8189,
      "losses": 265.5425,
      "capture_points": 239.7655,
      "battles": 567.3393,
      "damage_dealt": 325559.6622,
      "damage_received": 316424.7297,
      "shots": 5125.5252,
      "max_xp": 1199.4879,
      "xp": 210141.9274,
      "frags": 403.2506,
      "survived_battles": 170.2097,
      "dropped_capture_points": 619.8172
    },
    "special": {
      "winrate": 51.2601,
      "damageRatio": 1.0289,
      "kdr": 1.0154,
      "damagePerBattle": 573.8359,
      "killsPerBattle": 0.7108,
      "hitsPerBattle": 7.0403,
      "spotsPerBattle": 1.0865,
      "wpm": 0.1994,
      "dpm": 223.1938,
      "kpm": 0.2765,
      "hitRate": 77.9284,
      "survivalRate": 30.0014
    },
    "percentiles": {
      "winRate": [
        43.714,
        46.429,
        48.3395,
        50.101,
        51.835,
        53.755,
        55.8765,
        58.58,
        62.749
      ],
      "damageRatio": [
        0.622,
        0.7585,
        0.861,
        0.955,
        1.051,
        1.1535,
        1.269,
        1.428,
        1.686
      ],
      "kdr": [
        0.4935,
        0.655,
        0.79,
        0.9245,
        1.0665,
        1.226,
        1.424,
        1.702,
        2.2165
      ],
      "damagePerBattle": [
        361.925,
        437.475,
        493.325,
        544.06,
        593.75,
        645.125,
        702.875,
        776.97,
        896.835
      ],
      "killsPerBattle": [
        0.381,
        0.489,
        0.574,
        0.655,
        0.735,
        0.82,
        0.917,
        1.0425,
        1.2385
      ],
      "hitsPerBattle": [
        3.9295,
        4.6525,
        5.335,
        6.04,
        7.0145,
        8.14,
        9.343,
        10.594,
        12.313
      ],
      "spotsPerBattle": [
        0.648,
        0.789,
        0.903,
        1.008,
        1.11,
        1.214,
        1.337,
        1.474,
        1.671
      ],
      "wpm": [
        0.1582,
        0.1717,
        0.182,
        0.1908,
        0.1992,
        0.208,
        0.2179,
        0.2295,
        0.2459
      ],
      "dpm": [
        139.612,
        167.501,
        188.5304,
        207.8887,
        226.5041,
        246.3742,
        268.8646,
        297.8587,
        339.6516
      ],
      "kpm": [
        0.1511,
        0.1916,
        0.222,
        0.2502,
        0.2791,
        0.31,
        0.3448,
        0.39,
        0.463
      ],
      "hitRate": [
        69.3035,
        73.4495,
        75.77,
        77.587,
        79.0885,
        80.4375,
        81.807,
        83.251,
        84.895
      ],
      "survivalRate": [
        20.495,
        24.071,
        26.696,
        29.07,
        31.2725,
        33.632,
        36.387,
        39.651,
        44.9655
      ]
    },
    "percentiles_player_count": 10000,
    "meanSd": {
      "winrateMean": 52.6691,
      "winrateSd": 7.501,
      "hitRateMean": 76.8419,
      "hitRateSd": 11.8812,
      "survivalRateMean": 31.8702,
      "survivalRateSd": 10.2378,
      "damageRatioMean": 1.1025,
      "damageRatioSd": 0.4427,
      "kdrMean": 1.2394,
      "kdrSd": 0.7795,
      "dpbMean": 608.4002,
      "dpbSd": 217.8841,
      "kpbMean": 0.774,
      "kpbSd": 0.3449,
      "hpbMean": 7.5795,
      "hpbSd": 3.3543,
      "spbMean": 1.1317,
      "spbSd": 0.4135
    },
    "shotEff": 81.3044,
    "last_update": 1678771055585
  },
  {
    "_id": 17,
    "battle_life_time": 106463,
    "total_battle_life_time": 1064627816,
    "number_of_players": 10000,
    "tank_id": 17,
    "all": {
      "spotted": 707.8467,
      "hits": 3128.9507,
      "wins": 337.453,
      "losses": 326.723,
      "capture_points": 273.1936,
      "battles": 673.9891,
      "damage_dealt": 371207.8193,
      "damage_received": 386415.786,
      "shots": 4144.258,
      "max_xp": 1191.7719,
      "xp": 242667.5486,
      "frags": 462.8709,
      "survived_battles": 200.5843,
      "dropped_capture_points": 595.6305
    },
    "special": {
      "winrate": 50.068,
      "damageRatio": 0.9606,
      "kdr": 0.9777,
      "damagePerBattle": 550.7623,
      "killsPerBattle": 0.6868,
      "hitsPerBattle": 4.6424,
      "spotsPerBattle": 1.0502,
      "wpm": 0.1902,
      "dpm": 209.2043,
      "kpm": 0.2609,
      "hitRate": 75.5009,
      "survivalRate": 29.7608
    },
    "percentiles": {
      "winRate": [
        43.103,
        45.24,
        46.8795,
        48.332,
        49.8065,
        51.196,
        52.918,
        55.1185,
        59.0235
      ],
      "damageRatio": [
        0.584,
        0.704,
        0.789,
        0.861,
        0.935,
        1.018,
        1.112,
        1.244,
        1.465
      ],
      "kdr": [
        0.485,
        0.617,
        0.726,
        0.827,
        0.9345,
        1.056,
        1.2155,
        1.428,
        1.845
      ],
      "damagePerBattle": [
        345.69,
        412.49,
        459.44,
        499.55,
        540.035,
        584.985,
        633.355,
        699.025,
        811.67
      ],
      "killsPerBattle": [
        0.375,
        0.465,
        0.533,
        0.596,
        0.659,
        0.73,
        0.811,
        0.918,
        1.102
      ],
      "hitsPerBattle": [
        3.195,
        3.69,
        4.068,
        4.362,
        4.647,
        4.9485,
        5.271,
        5.656,
        6.2055
      ],
      "spotsPerBattle": [
        0.629,
        0.752,
        0.8575,
        0.956,
        1.049,
        1.1465,
        1.262,
        1.4,
        1.603
      ],
      "wpm": [
        0.1528,
        0.1655,
        0.1743,
        0.1825,
        0.19,
        0.1979,
        0.2065,
        0.2171,
        0.2339
      ],
      "dpm": [
        131.2505,
        155.7725,
        174.1863,
        189.9051,
        205.3328,
        221.5702,
        240.8529,
        264.8677,
        307.253
      ],
      "kpm": [
        0.1463,
        0.1799,
        0.2042,
        0.2268,
        0.2493,
        0.2736,
        0.3036,
        0.3432,
        0.4089
      ],
      "hitRate": [
        65.617,
        70.051,
        72.553,
        74.549,
        76.2425,
        77.7385,
        79.2765,
        80.858,
        83.018
      ],
      "survivalRate": [
        20.444,
        23.447,
        25.6725,
        27.725,
        29.6715,
        31.6955,
        33.923,
        36.803,
        41.437
      ]
    },
    "percentiles_player_count": 10000,
    "meanSd": {
      "winrateMean": 50.5356,
      "winrateSd": 6.6334,
      "hitRateMean": 74.5835,
      "hitRateSd": 9.6505,
      "survivalRateMean": 30.3145,
      "survivalRateSd": 8.9155,
      "damageRatioMean": 0.9912,
      "damageRatioSd": 0.3822,
      "kdrMean": 1.0923,
      "kdrSd": 0.6887,
      "dpbMean": 562.3008,
      "dpbSd": 195.5684,
      "kpbMean": 0.7088,
      "kpbSd": 0.312,
      "hpbMean": 4.6704,
      "hpbSd": 1.2382,
      "spbMean": 1.0833,
      "spbSd": 0.3853
    },
    "shotEff": 154.9048,
    "last_update": 1677561392794
  },
  {
    "_id": 33,
    "battle_life_time": 47339,
    "total_battle_life_time": 473389371,
    "number_of_players": 10000,
    "tank_id": 33,
    "all": {
      "spotted": 318.6163,
      "hits": 1918.026,
      "wins": 161.9938,
      "losses": 135.1226,
      "capture_points": 163.6557,
      "battles": 300.0921,
      "damage_dealt": 199194.9486,
      "damage_received": 183696.4883,
      "shots": 2420.9167,
      "max_xp": 1377.8881,
      "xp": 148216.5586,
      "frags": 257.9868,
      "survived_battles": 103.0862,
      "dropped_capture_points": 260.2245
    },
    "special": {
      "winrate": 53.9814,
      "damageRatio": 1.0844,
      "kdr": 1.3095,
      "damagePerBattle": 663.7794,
      "killsPerBattle": 0.8597,
      "hitsPerBattle": 6.3915,
      "spotsPerBattle": 1.0617,
      "wpm": 0.2053,
      "dpm": 252.4707,
      "kpm": 0.327,
      "hitRate": 79.2273,
      "survivalRate": 34.3515
    },
    "percentiles": {
      "winRate": [
        45.669,
        48.923,
        51.2915,
        53.4155,
        55.4195,
        57.519,
        59.783,
        62.553,
        66.882
      ],
      "damageRatio": [
        0.695,
        0.839,
        0.949,
        1.05,
        1.156,
        1.261,
        1.378,
        1.5385,
        1.7965
      ],
      "kdr": [
        0.705,
        0.915,
        1.086,
        1.254,
        1.424,
        1.617,
        1.86,
        2.1795,
        2.7895
      ],
      "damagePerBattle": [
        450.59,
        533.78,
        595.96,
        652.085,
        702.07,
        755.18,
        810.885,
        880.155,
        980.285
      ],
      "killsPerBattle": [
        0.521,
        0.653,
        0.743,
        0.831,
        0.912,
        0.994,
        1.09,
        1.208,
        1.382
      ],
      "hitsPerBattle": [
        4.8345,
        5.4535,
        5.933,
        6.3205,
        6.716,
        7.0945,
        7.508,
        8,
        8.7625
      ],
      "spotsPerBattle": [
        0.67,
        0.812,
        0.919,
        1.0105,
        1.096,
        1.188,
        1.284,
        1.401,
        1.568
      ],
      "wpm": [
        0.1667,
        0.1817,
        0.1923,
        0.2014,
        0.2098,
        0.2185,
        0.2272,
        0.2377,
        0.2524
      ],
      "dpm": [
        170.9212,
        203.7661,
        227.6935,
        247.3242,
        266.3126,
        284.356,
        303.8913,
        325.3216,
        359.4345
      ],
      "kpm": [
        0.2015,
        0.2506,
        0.2854,
        0.3168,
        0.3443,
        0.3722,
        0.4033,
        0.4413,
        0.4974
      ],
      "hitRate": [
        72.5495,
        75.8405,
        77.7595,
        79.216,
        80.451,
        81.597,
        82.783,
        83.9565,
        85.5015
      ],
      "survivalRate": [
        24.224,
        28.201,
        31.128,
        33.803,
        36.3355,
        38.8445,
        41.722,
        45.3425,
        51.186
      ]
    },
    "percentiles_player_count": 10000,
    "meanSd": {
      "winrateMean": 55.9148,
      "winrateSd": 8.2526,
      "hitRateMean": 79.1161,
      "hitRateSd": 8.4723,
      "survivalRateMean": 36.9185,
      "survivalRateSd": 10.7729,
      "damageRatioMean": 1.2076,
      "damageRatioSd": 0.454,
      "kdrMean": 1.6293,
      "kdrSd": 0.9557,
      "dpbMean": 709.1817,
      "dpbSd": 212.8413,
      "kpbMean": 0.9358,
      "kpbSd": 0.3445,
      "hpbMean": 6.7378,
      "hpbSd": 1.634,
      "spbMean": 1.1089,
      "spbSd": 0.3544
    },
    "shotEff": 117.2326,
    "last_update": 1681791408996
  },
  {
    "_id": 49,
    "battle_life_time": 107010,
    "total_battle_life_time": 1070098258,
    "number_of_players": 10000,
    "tank_id": 49,
    "all": {
      "spotted": 998.0054,
      "hits": 3884.2635,
      "wins": 334.7506,
      "losses": 306.5336,
      "capture_points": 69.2516,
      "battles": 646.2226,
      "damage_dealt": 789251.7596,
      "damage_received": 715410.0777,
      "shots": 4686.3514,
      "max_xp": 1912.2171,
      "xp": 465914.6865,
      "frags": 489.4052,
      "survived_battles": 205.6315,
      "dropped_capture_points": 272.3055
    },
    "special": {
      "winrate": 51.8011,
      "damageRatio": 1.1032,
      "kdr": 1.1108,
      "damagePerBattle": 1221.3311,
      "killsPerBattle": 0.7573,
      "hitsPerBattle": 6.01
    }
  }
]
*/

export const tankAverages = (await (
  await fetch('https://www.blitzstars.com/api/tankaverages.json')
).json()) as TankAverages;

export type TankAverages = {
  _id: number;
  battle_life_time: number;
  total_battle_life_time: number;
  number_of_players: number;
  tank_id: number;
  all: AllStats;
  special: {
    winrate: number;
    damageRatio: number;
    kdr: number;
    damagePerBattle: number;
    killsPerBattle: number;
    hitsPerBattle: number;
  };
}[];
