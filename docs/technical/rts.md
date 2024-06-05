# BlitzKit Regular Tank Stats

A straightforward way of storing the entire World of Tanks Blitz tank statistics for players to disk.

## Manifest `manifest.rtsm`

```cpp
primary RegularTankStatisticsManifest {
  utf8"RTSM" magic;
  Header header;
  primary Body body;
}

Header {
  uint16 version; // always 1
}

Body {
  uint32 time;
  uint8 base;
}
```

## Chunk `*.rtsc`

```cpp
primary RegularTankStatisticsChunk {
  utf8"RTSC" magic;
  Header header;
  primary Body body<header.playerCount>;
}

Header {
  uint16 version; // always 1
  uint32 playerCount;
}

Body<uint32 playerCount> {
  Player[playerCount] players;
}

Player {
  uint32 id;
  uint16 tankCount;
  Tank[tankCount] tanks;
}

Tank {
  uint32 id;
  uint32 battleLifeTime;
  uint32 lastBattleTime;
  uint8 markOfMastery;
  uint32 battles;
  uint32 capturePoints;
  uint32 damageDealt;
  uint32 damageReceived;
  uint32 droppedCapturePoints;
  uint32 frags;
  uint32 frags8p;
  uint32 hits;
  uint32 losses;
  uint8 maxFrags;
  uint16 maxXp;
  uint32 shots;
  uint32 spotted;
  uint32 survivedBattles;
  uint32 winAndSurvived;
  uint32 wins;
  uint32 xp;
}
```
