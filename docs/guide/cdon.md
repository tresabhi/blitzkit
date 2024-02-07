# Cedilla Object Notation

A compact binary representation similar to JSON objects. This documentation uses some funky (yet concise) syntax I developed (don't worry, my C++ isn't that bad!).

1. JSON compressed as CDON, written directly to disk (a direct 50% reduction).
2. CDON further compressed with LZ4 (a clean 90% reduction).
3. The raw JSON file as fetched from a random data source.
4. CDON decompressed once again to JSON. Note that this file is a little larger than the original JSON file as it contains a lot more decimal places due to float precision (this shouldn't affect the size in memory).

![an image of file sizes](https://i.imgur.com/AHJiFpq.png)

## Primitives

```cpp
struct String {
  uint32 length;
  utf8[length] value;
}
```

## Reading

- Everything is little endian
- Magic is always `"CDON"`
- The index of fast strings must be read as mentioned by the fast string format

```cpp
struct BlitzkriegObjectNotation {
  ascii[4] magic;
  Header header;
  Body body;
}
```

### Header

- Version is always `1`

```cpp
struct Header {
  uint16 version;
  FastStringFormat fastStringFormat;
  StringTable stringTable;
}

// read as uint8
enum FastStringFormat {
  Format8,
  Format16,
  Format32,
}

struct StringTable {
  (uint8 | uint16 | uint32) count;
  String[count] strings;
}
```

### Body

```cpp
struct Body {
  Value object;
}

// read as uint8
enum ValueType {
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
  FastString,
  Array,
  Object,
}

struct Value = `Value${ValueType}`

struct ValueNull {
  ValueType.Null type;
}

struct ValueBoolean {
  ValueType.Boolean type;
  uint8 value;
}

struct ValueUint8 {
  ValueType.Uint8 type;
  uint8 value;
}

struct ValueUint16 {
  ValueType.Uint16 type;
  uint16 value;
}

struct ValueUint32 {
  ValueType.Uint32 type;
  uint32 value;
}

struct ValueUint64 {
  ValueType.Uint64 type;
  uint64 value;
}

struct ValueInt8 {
  ValueType.Int8 type;
  int8 value;
}

struct ValueInt16 {
  ValueType.Int16 type;
  int16 value;
}

struct ValueInt32 {
  ValueType.Int32 type;
  int32 value;
}

struct ValueInt64 {
  ValueType.Int64 type;
  int64 value;
}

struct ValueFloat32 {
  ValueType.Float32 type;
  float32 value;
}

struct ValueFloat64 {
  ValueType.Float64 type;
  float64 value;
}

struct ValueString {
  ValueType.String type;
  String value;
}

struct ValueFastString {
  ValueType.FastString type;
  (uint8 | uint16 | uint32) index;
}

struct ValueArray {
  ValueType.Array type;
  uint32 count;
  Value[count] values;
}

struct ValueObject {
  ValueType.Object type;
  uint32 count;
  (ValueString | ValueFastString)[count] keys;
  Value[count] values;
}
```

## Writing

It's pretty obvious how to write. Remember that a `FastString` should only be applied to the string table if the string shows up more than once in the body. Otherwise, there's no point and `String` should be used.
