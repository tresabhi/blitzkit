# Cedilla Object Notation

This documentation uses an experimental binary notation syntax called "Buffer Up".

1. JSON compressed as CDON, written directly to disk (a direct 50% reduction).
2. CDON further compressed with LZ4 (a clean 90% reduction).
3. The raw JSON file as fetched from a random data source.
4. CDON decompressed once again to JSON. Note that this file is a little larger than the original JSON file as it contains a lot more decimal places due to float precision (this shouldn't affect the size in memory).

![an image of file sizes](https://i.imgur.com/AHJiFpq.png)

FS stands for "Fast String".

```cpp
primary CedillaObjectNotation {
  utf8"CDON" magic;
  Header header;
  primary Body<header.fsFormat> body;
}

Header {
  uint16 version;
  FSFormat fsFormat;
  StringTable<fsFormat> stringTable;
}

FSFormat enum<uint8> {
  Format8,
  Format16,
  Format32,
}

FSPrimitive<FSFormat fsFormat> match(fsFormat) {
  Format8: uint8;
  Format16: uint16;
  Format32: uint32;
}

StringTable<FSFormat fsFormat> {
  FSPrimitive<fsFormat> count;
  String[count] strings;
}

Body<FSFormat fsFormat> {
  primary Value<fsFormat> object;
}

ValueType enum<uint8> {
  Null,
  Boolean,
  Uint8,
  Uint16,
  Uint32,
  Uint64,
  Int8,
  Int16,
  Int32,
  Int64,
  Float32,
  Float64,
  String,
  FS,
  Array,
  Object,
}

String {
  uint32 length;
  primary utf8<length> value;
}

StringValue Value & { (ValueType.String | ValueType.FS) type }

Value<FSFormat fsFormat> {
  ValueType type;
  match<type> {
    Boolean: { uint8 value; }
    Uint8: { uint8 value; }
    Uint16: { uint16 value; }
    Uint32: { uint32 value; }
    Uint64: { uint64 value; }
    Int8: { int8 value; }
    Int16: { int16 value; }
    Int32: { int32 value; }
    Int64: { int64 value; }
    Float32: { float32 value; }
    Float64: { float64 value; }
    String: { String value; }
    FS: { FSPrimitive<fsFormat> index; }
    Array: {
      uint32 count;
      Value[count] values;
    }
    Object: {
      uint32 count;
      StringValue[count] keys;
      Value[count] values;
    }
  }
}
```
