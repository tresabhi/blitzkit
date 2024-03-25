# Blitzkrieg Rating Leaderboard

A straightforward way of storing the entire World of Tanks Blitz rating leaderboard to disk.

```cpp
primary BlitzkriegRatingLeaderboard {
  utf8"BKRL" magic;
  Header header;
  primary Body<header> body;
}

Header {
  uint16 version; // always 1
  Format format;
  uint32 count;
}

Format enum<uint8> {
  Minimal,
  Superset1,
}

Body<Header header> match<header.format> {
  Minimal {
    primary {
      uint32 id;
      uint16 score;
    }[header.count] entries;
  };

  Superset1 {
    primary {
      uint32 id;
      uint16 score;

      uint32 battles;
      uint32 wins;
      uint32 survived;

      uint32 damageDealt;
      uint32 damageReceived;

      uint32 shots;
      uint32 hits;

      uint32 kills;
    }[header.count] entries;
  };
}
```
