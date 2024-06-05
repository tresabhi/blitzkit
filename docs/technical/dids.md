# Discovered Ids

```c
primary DiscoveredIds {
  utf8"DIDS" magic;
  Header header;
  primary Body body;
}

Header {
  uint16 version; // always 1
}

Body {
  uint32 count;
  uint32[count] ids;
}
```
