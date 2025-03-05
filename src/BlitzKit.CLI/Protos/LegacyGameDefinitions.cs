// <auto-generated>
//     Generated by the protocol buffer compiler.  DO NOT EDIT!
//     source: packages/core/src/protos/legacy_game_definitions.proto
// </auto-generated>
#pragma warning disable 1591, 0612, 3021, 8981
#region Designer generated code

using pb = global::Google.Protobuf;
using pbc = global::Google.Protobuf.Collections;
using pbr = global::Google.Protobuf.Reflection;
using scg = global::System.Collections.Generic;
namespace Blitzkit {

  /// <summary>Holder for reflection information generated from packages/core/src/protos/legacy_game_definitions.proto</summary>
  public static partial class LegacyGameDefinitionsReflection {

    #region Descriptor
    /// <summary>File descriptor for packages/core/src/protos/legacy_game_definitions.proto</summary>
    public static pbr::FileDescriptor Descriptor {
      get { return descriptor; }
    }
    private static pbr::FileDescriptor descriptor;

    static LegacyGameDefinitionsReflection() {
      byte[] descriptorData = global::System.Convert.FromBase64String(
          string.Concat(
            "CjZwYWNrYWdlcy9jb3JlL3NyYy9wcm90b3MvbGVnYWN5X2dhbWVfZGVmaW5p",
            "dGlvbnMucHJvdG8SCGJsaXR6a2l0GipwYWNrYWdlcy9jb3JlL3NyYy9wcm90",
            "b3MvbGVnYWN5X2kxOG4ucHJvdG8isQIKD0dhbWVEZWZpbml0aW9ucxIPCgd2",
            "ZXJzaW9uGAEgAigJEg8KB25hdGlvbnMYAiADKAkSOwoJZ2FtZU1vZGVzGAMg",
            "AygLMiguYmxpdHpraXQuR2FtZURlZmluaXRpb25zLkdhbWVNb2Rlc0VudHJ5",
            "EjMKBXJvbGVzGAQgAygLMiQuYmxpdHpraXQuR2FtZURlZmluaXRpb25zLlJv",
            "bGVzRW50cnkaRAoOR2FtZU1vZGVzRW50cnkSCwoDa2V5GAEgASgNEiEKBXZh",
            "bHVlGAIgASgLMhIuYmxpdHpraXQuR2FtZU1vZGU6AjgBGkQKClJvbGVzRW50",
            "cnkSCwoDa2V5GAEgASgNEiUKBXZhbHVlGAIgASgLMhYuYmxpdHpraXQuR2Ft",
            "ZU1vZGVSb2xlOgI4ASIuCghHYW1lTW9kZRIiCgRuYW1lGAEgAigLMhQuYmxp",
            "dHpraXQuSTE4blN0cmluZyI3CgxHYW1lTW9kZVJvbGUSEgoKcHJvdmlzaW9u",
            "cxgBIAMoDRITCgtjb25zdW1hYmxlcxgCIAMoDQ=="));
      descriptor = pbr::FileDescriptor.FromGeneratedCode(descriptorData,
          new pbr::FileDescriptor[] { global::Blitzkit.LegacyI18NReflection.Descriptor, },
          new pbr::GeneratedClrTypeInfo(null, null, new pbr::GeneratedClrTypeInfo[] {
            new pbr::GeneratedClrTypeInfo(typeof(global::Blitzkit.GameDefinitions), global::Blitzkit.GameDefinitions.Parser, new[]{ "Version", "Nations", "GameModes", "Roles" }, null, null, null, new pbr::GeneratedClrTypeInfo[] { null, null, }),
            new pbr::GeneratedClrTypeInfo(typeof(global::Blitzkit.GameMode), global::Blitzkit.GameMode.Parser, new[]{ "Name" }, null, null, null, null),
            new pbr::GeneratedClrTypeInfo(typeof(global::Blitzkit.GameModeRole), global::Blitzkit.GameModeRole.Parser, new[]{ "Provisions", "Consumables" }, null, null, null, null)
          }));
    }
    #endregion

  }
  #region Messages
  [global::System.Diagnostics.DebuggerDisplayAttribute("{ToString(),nq}")]
  public sealed partial class GameDefinitions : pb::IMessage<GameDefinitions>
  #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
      , pb::IBufferMessage
  #endif
  {
    private static readonly pb::MessageParser<GameDefinitions> _parser = new pb::MessageParser<GameDefinitions>(() => new GameDefinitions());
    private pb::UnknownFieldSet _unknownFields;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public static pb::MessageParser<GameDefinitions> Parser { get { return _parser; } }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public static pbr::MessageDescriptor Descriptor {
      get { return global::Blitzkit.LegacyGameDefinitionsReflection.Descriptor.MessageTypes[0]; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    pbr::MessageDescriptor pb::IMessage.Descriptor {
      get { return Descriptor; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public GameDefinitions() {
      OnConstruction();
    }

    partial void OnConstruction();

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public GameDefinitions(GameDefinitions other) : this() {
      version_ = other.version_;
      nations_ = other.nations_.Clone();
      gameModes_ = other.gameModes_.Clone();
      roles_ = other.roles_.Clone();
      _unknownFields = pb::UnknownFieldSet.Clone(other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public GameDefinitions Clone() {
      return new GameDefinitions(this);
    }

    /// <summary>Field number for the "version" field.</summary>
    public const int VersionFieldNumber = 1;
    private readonly static string VersionDefaultValue = "";

    private string version_;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public string Version {
      get { return version_ ?? VersionDefaultValue; }
      set {
        version_ = pb::ProtoPreconditions.CheckNotNull(value, "value");
      }
    }
    /// <summary>Gets whether the "version" field is set</summary>
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public bool HasVersion {
      get { return version_ != null; }
    }
    /// <summary>Clears the value of the "version" field</summary>
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public void ClearVersion() {
      version_ = null;
    }

    /// <summary>Field number for the "nations" field.</summary>
    public const int NationsFieldNumber = 2;
    private static readonly pb::FieldCodec<string> _repeated_nations_codec
        = pb::FieldCodec.ForString(18);
    private readonly pbc::RepeatedField<string> nations_ = new pbc::RepeatedField<string>();
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public pbc::RepeatedField<string> Nations {
      get { return nations_; }
    }

    /// <summary>Field number for the "gameModes" field.</summary>
    public const int GameModesFieldNumber = 3;
    private static readonly pbc::MapField<uint, global::Blitzkit.GameMode>.Codec _map_gameModes_codec
        = new pbc::MapField<uint, global::Blitzkit.GameMode>.Codec(pb::FieldCodec.ForUInt32(8, 0), pb::FieldCodec.ForMessage(18, global::Blitzkit.GameMode.Parser), 26);
    private readonly pbc::MapField<uint, global::Blitzkit.GameMode> gameModes_ = new pbc::MapField<uint, global::Blitzkit.GameMode>();
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public pbc::MapField<uint, global::Blitzkit.GameMode> GameModes {
      get { return gameModes_; }
    }

    /// <summary>Field number for the "roles" field.</summary>
    public const int RolesFieldNumber = 4;
    private static readonly pbc::MapField<uint, global::Blitzkit.GameModeRole>.Codec _map_roles_codec
        = new pbc::MapField<uint, global::Blitzkit.GameModeRole>.Codec(pb::FieldCodec.ForUInt32(8, 0), pb::FieldCodec.ForMessage(18, global::Blitzkit.GameModeRole.Parser), 34);
    private readonly pbc::MapField<uint, global::Blitzkit.GameModeRole> roles_ = new pbc::MapField<uint, global::Blitzkit.GameModeRole>();
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public pbc::MapField<uint, global::Blitzkit.GameModeRole> Roles {
      get { return roles_; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public override bool Equals(object other) {
      return Equals(other as GameDefinitions);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public bool Equals(GameDefinitions other) {
      if (ReferenceEquals(other, null)) {
        return false;
      }
      if (ReferenceEquals(other, this)) {
        return true;
      }
      if (Version != other.Version) return false;
      if(!nations_.Equals(other.nations_)) return false;
      if (!GameModes.Equals(other.GameModes)) return false;
      if (!Roles.Equals(other.Roles)) return false;
      return Equals(_unknownFields, other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public override int GetHashCode() {
      int hash = 1;
      if (HasVersion) hash ^= Version.GetHashCode();
      hash ^= nations_.GetHashCode();
      hash ^= GameModes.GetHashCode();
      hash ^= Roles.GetHashCode();
      if (_unknownFields != null) {
        hash ^= _unknownFields.GetHashCode();
      }
      return hash;
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public override string ToString() {
      return pb::JsonFormatter.ToDiagnosticString(this);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public void WriteTo(pb::CodedOutputStream output) {
    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
      output.WriteRawMessage(this);
    #else
      if (HasVersion) {
        output.WriteRawTag(10);
        output.WriteString(Version);
      }
      nations_.WriteTo(output, _repeated_nations_codec);
      gameModes_.WriteTo(output, _map_gameModes_codec);
      roles_.WriteTo(output, _map_roles_codec);
      if (_unknownFields != null) {
        _unknownFields.WriteTo(output);
      }
    #endif
    }

    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    void pb::IBufferMessage.InternalWriteTo(ref pb::WriteContext output) {
      if (HasVersion) {
        output.WriteRawTag(10);
        output.WriteString(Version);
      }
      nations_.WriteTo(ref output, _repeated_nations_codec);
      gameModes_.WriteTo(ref output, _map_gameModes_codec);
      roles_.WriteTo(ref output, _map_roles_codec);
      if (_unknownFields != null) {
        _unknownFields.WriteTo(ref output);
      }
    }
    #endif

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public int CalculateSize() {
      int size = 0;
      if (HasVersion) {
        size += 1 + pb::CodedOutputStream.ComputeStringSize(Version);
      }
      size += nations_.CalculateSize(_repeated_nations_codec);
      size += gameModes_.CalculateSize(_map_gameModes_codec);
      size += roles_.CalculateSize(_map_roles_codec);
      if (_unknownFields != null) {
        size += _unknownFields.CalculateSize();
      }
      return size;
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public void MergeFrom(GameDefinitions other) {
      if (other == null) {
        return;
      }
      if (other.HasVersion) {
        Version = other.Version;
      }
      nations_.Add(other.nations_);
      gameModes_.MergeFrom(other.gameModes_);
      roles_.MergeFrom(other.roles_);
      _unknownFields = pb::UnknownFieldSet.MergeFrom(_unknownFields, other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public void MergeFrom(pb::CodedInputStream input) {
    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
      input.ReadRawMessage(this);
    #else
      uint tag;
      while ((tag = input.ReadTag()) != 0) {
      if ((tag & 7) == 4) {
        // Abort on any end group tag.
        return;
      }
      switch(tag) {
          default:
            _unknownFields = pb::UnknownFieldSet.MergeFieldFrom(_unknownFields, input);
            break;
          case 10: {
            Version = input.ReadString();
            break;
          }
          case 18: {
            nations_.AddEntriesFrom(input, _repeated_nations_codec);
            break;
          }
          case 26: {
            gameModes_.AddEntriesFrom(input, _map_gameModes_codec);
            break;
          }
          case 34: {
            roles_.AddEntriesFrom(input, _map_roles_codec);
            break;
          }
        }
      }
    #endif
    }

    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    void pb::IBufferMessage.InternalMergeFrom(ref pb::ParseContext input) {
      uint tag;
      while ((tag = input.ReadTag()) != 0) {
      if ((tag & 7) == 4) {
        // Abort on any end group tag.
        return;
      }
      switch(tag) {
          default:
            _unknownFields = pb::UnknownFieldSet.MergeFieldFrom(_unknownFields, ref input);
            break;
          case 10: {
            Version = input.ReadString();
            break;
          }
          case 18: {
            nations_.AddEntriesFrom(ref input, _repeated_nations_codec);
            break;
          }
          case 26: {
            gameModes_.AddEntriesFrom(ref input, _map_gameModes_codec);
            break;
          }
          case 34: {
            roles_.AddEntriesFrom(ref input, _map_roles_codec);
            break;
          }
        }
      }
    }
    #endif

  }

  [global::System.Diagnostics.DebuggerDisplayAttribute("{ToString(),nq}")]
  public sealed partial class GameMode : pb::IMessage<GameMode>
  #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
      , pb::IBufferMessage
  #endif
  {
    private static readonly pb::MessageParser<GameMode> _parser = new pb::MessageParser<GameMode>(() => new GameMode());
    private pb::UnknownFieldSet _unknownFields;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public static pb::MessageParser<GameMode> Parser { get { return _parser; } }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public static pbr::MessageDescriptor Descriptor {
      get { return global::Blitzkit.LegacyGameDefinitionsReflection.Descriptor.MessageTypes[1]; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    pbr::MessageDescriptor pb::IMessage.Descriptor {
      get { return Descriptor; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public GameMode() {
      OnConstruction();
    }

    partial void OnConstruction();

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public GameMode(GameMode other) : this() {
      name_ = other.name_ != null ? other.name_.Clone() : null;
      _unknownFields = pb::UnknownFieldSet.Clone(other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public GameMode Clone() {
      return new GameMode(this);
    }

    /// <summary>Field number for the "name" field.</summary>
    public const int NameFieldNumber = 1;
    private global::Blitzkit.I18nString name_;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public global::Blitzkit.I18nString Name {
      get { return name_; }
      set {
        name_ = value;
      }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public override bool Equals(object other) {
      return Equals(other as GameMode);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public bool Equals(GameMode other) {
      if (ReferenceEquals(other, null)) {
        return false;
      }
      if (ReferenceEquals(other, this)) {
        return true;
      }
      if (!object.Equals(Name, other.Name)) return false;
      return Equals(_unknownFields, other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public override int GetHashCode() {
      int hash = 1;
      if (name_ != null) hash ^= Name.GetHashCode();
      if (_unknownFields != null) {
        hash ^= _unknownFields.GetHashCode();
      }
      return hash;
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public override string ToString() {
      return pb::JsonFormatter.ToDiagnosticString(this);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public void WriteTo(pb::CodedOutputStream output) {
    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
      output.WriteRawMessage(this);
    #else
      if (name_ != null) {
        output.WriteRawTag(10);
        output.WriteMessage(Name);
      }
      if (_unknownFields != null) {
        _unknownFields.WriteTo(output);
      }
    #endif
    }

    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    void pb::IBufferMessage.InternalWriteTo(ref pb::WriteContext output) {
      if (name_ != null) {
        output.WriteRawTag(10);
        output.WriteMessage(Name);
      }
      if (_unknownFields != null) {
        _unknownFields.WriteTo(ref output);
      }
    }
    #endif

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public int CalculateSize() {
      int size = 0;
      if (name_ != null) {
        size += 1 + pb::CodedOutputStream.ComputeMessageSize(Name);
      }
      if (_unknownFields != null) {
        size += _unknownFields.CalculateSize();
      }
      return size;
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public void MergeFrom(GameMode other) {
      if (other == null) {
        return;
      }
      if (other.name_ != null) {
        if (name_ == null) {
          Name = new global::Blitzkit.I18nString();
        }
        Name.MergeFrom(other.Name);
      }
      _unknownFields = pb::UnknownFieldSet.MergeFrom(_unknownFields, other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public void MergeFrom(pb::CodedInputStream input) {
    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
      input.ReadRawMessage(this);
    #else
      uint tag;
      while ((tag = input.ReadTag()) != 0) {
      if ((tag & 7) == 4) {
        // Abort on any end group tag.
        return;
      }
      switch(tag) {
          default:
            _unknownFields = pb::UnknownFieldSet.MergeFieldFrom(_unknownFields, input);
            break;
          case 10: {
            if (name_ == null) {
              Name = new global::Blitzkit.I18nString();
            }
            input.ReadMessage(Name);
            break;
          }
        }
      }
    #endif
    }

    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    void pb::IBufferMessage.InternalMergeFrom(ref pb::ParseContext input) {
      uint tag;
      while ((tag = input.ReadTag()) != 0) {
      if ((tag & 7) == 4) {
        // Abort on any end group tag.
        return;
      }
      switch(tag) {
          default:
            _unknownFields = pb::UnknownFieldSet.MergeFieldFrom(_unknownFields, ref input);
            break;
          case 10: {
            if (name_ == null) {
              Name = new global::Blitzkit.I18nString();
            }
            input.ReadMessage(Name);
            break;
          }
        }
      }
    }
    #endif

  }

  [global::System.Diagnostics.DebuggerDisplayAttribute("{ToString(),nq}")]
  public sealed partial class GameModeRole : pb::IMessage<GameModeRole>
  #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
      , pb::IBufferMessage
  #endif
  {
    private static readonly pb::MessageParser<GameModeRole> _parser = new pb::MessageParser<GameModeRole>(() => new GameModeRole());
    private pb::UnknownFieldSet _unknownFields;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public static pb::MessageParser<GameModeRole> Parser { get { return _parser; } }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public static pbr::MessageDescriptor Descriptor {
      get { return global::Blitzkit.LegacyGameDefinitionsReflection.Descriptor.MessageTypes[2]; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    pbr::MessageDescriptor pb::IMessage.Descriptor {
      get { return Descriptor; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public GameModeRole() {
      OnConstruction();
    }

    partial void OnConstruction();

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public GameModeRole(GameModeRole other) : this() {
      provisions_ = other.provisions_.Clone();
      consumables_ = other.consumables_.Clone();
      _unknownFields = pb::UnknownFieldSet.Clone(other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public GameModeRole Clone() {
      return new GameModeRole(this);
    }

    /// <summary>Field number for the "provisions" field.</summary>
    public const int ProvisionsFieldNumber = 1;
    private static readonly pb::FieldCodec<uint> _repeated_provisions_codec
        = pb::FieldCodec.ForUInt32(8);
    private readonly pbc::RepeatedField<uint> provisions_ = new pbc::RepeatedField<uint>();
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public pbc::RepeatedField<uint> Provisions {
      get { return provisions_; }
    }

    /// <summary>Field number for the "consumables" field.</summary>
    public const int ConsumablesFieldNumber = 2;
    private static readonly pb::FieldCodec<uint> _repeated_consumables_codec
        = pb::FieldCodec.ForUInt32(16);
    private readonly pbc::RepeatedField<uint> consumables_ = new pbc::RepeatedField<uint>();
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public pbc::RepeatedField<uint> Consumables {
      get { return consumables_; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public override bool Equals(object other) {
      return Equals(other as GameModeRole);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public bool Equals(GameModeRole other) {
      if (ReferenceEquals(other, null)) {
        return false;
      }
      if (ReferenceEquals(other, this)) {
        return true;
      }
      if(!provisions_.Equals(other.provisions_)) return false;
      if(!consumables_.Equals(other.consumables_)) return false;
      return Equals(_unknownFields, other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public override int GetHashCode() {
      int hash = 1;
      hash ^= provisions_.GetHashCode();
      hash ^= consumables_.GetHashCode();
      if (_unknownFields != null) {
        hash ^= _unknownFields.GetHashCode();
      }
      return hash;
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public override string ToString() {
      return pb::JsonFormatter.ToDiagnosticString(this);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public void WriteTo(pb::CodedOutputStream output) {
    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
      output.WriteRawMessage(this);
    #else
      provisions_.WriteTo(output, _repeated_provisions_codec);
      consumables_.WriteTo(output, _repeated_consumables_codec);
      if (_unknownFields != null) {
        _unknownFields.WriteTo(output);
      }
    #endif
    }

    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    void pb::IBufferMessage.InternalWriteTo(ref pb::WriteContext output) {
      provisions_.WriteTo(ref output, _repeated_provisions_codec);
      consumables_.WriteTo(ref output, _repeated_consumables_codec);
      if (_unknownFields != null) {
        _unknownFields.WriteTo(ref output);
      }
    }
    #endif

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public int CalculateSize() {
      int size = 0;
      size += provisions_.CalculateSize(_repeated_provisions_codec);
      size += consumables_.CalculateSize(_repeated_consumables_codec);
      if (_unknownFields != null) {
        size += _unknownFields.CalculateSize();
      }
      return size;
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public void MergeFrom(GameModeRole other) {
      if (other == null) {
        return;
      }
      provisions_.Add(other.provisions_);
      consumables_.Add(other.consumables_);
      _unknownFields = pb::UnknownFieldSet.MergeFrom(_unknownFields, other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    public void MergeFrom(pb::CodedInputStream input) {
    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
      input.ReadRawMessage(this);
    #else
      uint tag;
      while ((tag = input.ReadTag()) != 0) {
      if ((tag & 7) == 4) {
        // Abort on any end group tag.
        return;
      }
      switch(tag) {
          default:
            _unknownFields = pb::UnknownFieldSet.MergeFieldFrom(_unknownFields, input);
            break;
          case 10:
          case 8: {
            provisions_.AddEntriesFrom(input, _repeated_provisions_codec);
            break;
          }
          case 18:
          case 16: {
            consumables_.AddEntriesFrom(input, _repeated_consumables_codec);
            break;
          }
        }
      }
    #endif
    }

    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    [global::System.CodeDom.Compiler.GeneratedCode("protoc", null)]
    void pb::IBufferMessage.InternalMergeFrom(ref pb::ParseContext input) {
      uint tag;
      while ((tag = input.ReadTag()) != 0) {
      if ((tag & 7) == 4) {
        // Abort on any end group tag.
        return;
      }
      switch(tag) {
          default:
            _unknownFields = pb::UnknownFieldSet.MergeFieldFrom(_unknownFields, ref input);
            break;
          case 10:
          case 8: {
            provisions_.AddEntriesFrom(ref input, _repeated_provisions_codec);
            break;
          }
          case 18:
          case 16: {
            consumables_.AddEntriesFrom(ref input, _repeated_consumables_codec);
            break;
          }
        }
      }
    }
    #endif

  }

  #endregion

}

#endregion Designer generated code
