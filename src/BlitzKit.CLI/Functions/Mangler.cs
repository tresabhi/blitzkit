using System.Text.Json;
using System.Text.RegularExpressions;
using Blitzkit;
using BlitzKit.CLI.Models;
using BlitzKit.CLI.Quicktype.Locales;
using BlitzKit.CLI.Utils;
using CUE4Parse.UE4.Assets.Exports;
using CUE4Parse.UE4.Assets.Exports.Engine;
using CUE4Parse.UE4.Assets.Exports.StaticMesh;
using CUE4Parse.UE4.Assets.Exports.Texture;
using CUE4Parse.UE4.Assets.Objects;
using CUE4Parse.UE4.Objects.Core.Math;
using CUE4Parse.UE4.Objects.UObject;
using CUE4Parse.Utils;
using Google.Protobuf;
using YamlDotNet.Serialization;

namespace BlitzKit.CLI.Functions
{
  public partial class Mangler(string[] args)
  {
    static readonly string PenetrationGroupNameMapPrefix =
      "EMintSDKProtoData_BlitzStaticTankUpgradeSingleStage_PenetrationGroupUpgrade_TankPart";
    static readonly Dictionary<string, string> PenetrationGroupNameMap = new()
    {
      { $"{PenetrationGroupNameMapPrefix}::TANK_PART_CHASSIS", "chassis" },
      { $"{PenetrationGroupNameMapPrefix}::TANK_PART_HULL", "hull" },
      { $"{PenetrationGroupNameMapPrefix}::TANK_PART_TURRET", "turret" },
      { $"{PenetrationGroupNameMapPrefix}::TANK_PART_GUN", "gun" },
    };

    private static readonly List<string> CollisionDTs =
    [
      "DT_Chassis",
      "DT_Hulls",
      "DT_Turrets",
      "DT_Guns",
    ];

    [GeneratedRegex("[^a-z0-9]")]
    private static partial Regex NonAlphanumericRegex();

    [GeneratedRegex("--+")]
    private static partial Regex MultipleDashesRegex();

    [GeneratedRegex("-$")]
    private static partial Regex TrailingDashRegex();

    readonly BlitzProvider provider = new(args.Contains("--depot"));
    Locales? locales;
    readonly Dictionary<string, Dictionary<string, string>> strings = [];

    public async Task<TanksFull> TanksFull()
    {
      var dirs = provider.RootDirectory.GetDirectory("Blitz/Content/Tanks").Directories;
      TanksFull tanksFull = new();

      foreach (var dir in dirs)
      {
        if (dir.Key == "TankStub")
          continue;

        foreach (var tankDir in dir.Value.Directories)
        {
          var tank = MangleTank(tankDir.Value);
          tanksFull.Tanks.Add(tank);
        }
      }

      DeduplicateSlugs(tanksFull);

      return tanksFull;
    }

    Tank MangleTank(VFS tankDir)
    {
      var pdaName = $"PDA_{tankDir.Name}";
      var pda = provider.LoadObject($"{tankDir.Path}/{pdaName}.{pdaName}");

      var id = pda.Get<FName>("TankId").Text;
      var name = GetString($"TankEntity__{id.ToLowerInvariant()}__Short_Name");
      var slug = Diacritics.Remove(name.Locales["en"]).ToLower();
      slug = NonAlphanumericRegex().Replace(slug, "-");
      slug = MultipleDashesRegex().Replace(slug, "-");
      slug = TrailingDashRegex().Replace(slug, "");

      Tank tank = new()
      {
        Id = id,
        Name = name,
        Slug = slug,
      };

      return tank;
    }

    public async Task<Tanks> Tanks()
    {
      var tanksFull = await TanksFull();
      Tanks tanks = new();

      foreach (var tank in tanksFull.Tanks)
      {
        tanks.Tanks_.Add(tank.Id);
      }

      return tanks;
    }

    public async Task Initialize()
    {
      await FetchStrings();
    }

    ///////////////////////////////////////////////////////////////////////////

    I18n GetString(string name)
    {
      I18n i18n = new();

      if (strings[locales!.Default].TryGetValue(name, out var defaultString))
      {
        foreach (var locale in locales!.Supported)
        {
          if (strings[locale.Locale].TryGetValue(name, out var localeString))
          {
            if (locale.Locale == locales.Default || localeString != defaultString)
            {
              i18n.Locales[locale.Locale] = localeString;
            }
          }
          else
          {
            PrettyLog.Warn($"String missing from {locale.Locale} locale: {name}");
          }
        }
      }
      else
      {
        PrettyLog.Warn($"String missing from default locale: {name}");
        i18n.Locales[locales!.Default] = name;
      }

      return i18n;
    }

    async Task FetchStrings()
    {
      using var client = new HttpClient();
      var text = File.ReadAllText("../../packages/i18n/locales.json");
      locales =
        JsonSerializer.Deserialize<Locales>(text)
        ?? throw new Exception("Failed to deserialize locales");

      foreach (var locale in locales.Supported)
      {
        var blitzLocale = locale.Blitz ?? locale.Locale;
        var url =
          $"{Unpacker.WG_DLC_DOMAIN}/dlc/{Unpacker.CONTENT_GROUP}/ue_localizations/development/stuff/{blitzLocale}.yaml";
        var yaml = await client.GetStringAsync(url);
        var deserializer = new DeserializerBuilder().Build();
        var parsedYaml = deserializer.Deserialize<Dictionary<string, string>>(yaml);

        strings[locale.Locale] = parsedYaml;
      }
    }

    void DeduplicateSlugs(TanksFull tanksFull)
    {
      List<string> checkedSlugs = [];
      Dictionary<string, List<Tank>> duplicates = [];

      foreach (var tank in tanksFull.Tanks)
      {
        if (checkedSlugs.Contains(tank.Slug))
          continue;

        checkedSlugs.Add(tank.Slug);

        foreach (var otherTank in tanksFull.Tanks)
        {
          if (otherTank.Slug.Equals(tank.Slug) && !otherTank.Id.Equals(tank.Id))
          {
            var thisDuplicates = duplicates.GetOrAdd(tank.Slug, () => [tank]);
            thisDuplicates.Add(otherTank);
          }
        }
      }

      if (duplicates.Count > 0)
      {
        PrettyLog.Warn($"{duplicates.Count} duplicate slugs found, attempting strategies...");
      }

      foreach (var duplicate in duplicates)
      {
        PrettyLog.Log($"{duplicate.Key}:");

        foreach (var tank in duplicate.Value)
        {
          PrettyLog.Log($"\t{tank.Id}");
        }

        if (duplicate.Value.Count == 2 && duplicate.Value.Any(tank => tank.Id.EndsWith("TU")))
        {
          PrettyLog.Success("\tTutorial bot discrimination...");

          var tutorialBot = duplicate.Value.First(tank => tank.Id.EndsWith("TU"));
          tutorialBot.Slug += "-tu";
        }
        // if (duplicate.Value.All((tank)=>duplicate.Value.All((otherTank)=>otherTank.Id == tank.Id || otherTank.Nation != tank.Nation)))
        else
        {
          PrettyLog.Success("\tNation discrimination...");

          foreach (var tank in duplicate.Value)
          {
            var match = Regex.Match(tank.Id, @"([a-zA-Z]+)\d+_");
            var rawNation = match.Groups[1].Value;
            var slugNation = rawNation.ToLowerInvariant();
            tank.Slug += $"-{slugNation}";
          }
        }
        // else
        // {
        //   throw new Exception("No applicable strategy found");
        // }

        foreach (var tank in duplicate.Value)
        {
          PrettyLog.Log($"\t\t{tank.Slug}");
        }

        PrettyLog.Line();
      }
    }

    async Task MangleArmor(UObject pda)
    {
      var id = pda.Get<FName>("TankId").Text;
      TankArmor tankArmor = new();
      var attributes = pda.Get<UObject>("DA_Attributes");

      if (attributes.TryGet<UScriptMap>("PenetrationGroups", out var penetrationGroups))
      {
        foreach (var group in penetrationGroups.Properties)
        {
          var rawName = ((FName)group.Key.GenericValue!).Text;
          var name = PenetrationGroupNameMap[rawName];
          var armors = group
            .Value!.GetValue<FStructFallback>()!
            .Get<UScriptMap>("PenetrationGroups");
          PenetrationGroup penetrationGroup = new();

          foreach (var armorProperty in armors.Properties)
          {
            var armorName = ((FName)armorProperty.Key.GenericValue!).Text;
            var armorProperties = armorProperty.Value!.GetValue<FStructFallback>()!;
            var thickness = armorProperties.Get<float>("Armor");
            var commonData = armorProperties.Get<FStructFallback>("CommonData");
            var rowName = commonData.Get<FName>("RowName");

            penetrationGroup.Armors[armorName] = new()
            {
              Thickness = thickness,
              Type = rowName.Text,
            };
          }

          tankArmor.Groups[name] = penetrationGroup;
        }
      }
      else
      {
        PrettyLog.Warn($"Penetration groups missing for {id}; creating empty list");
      }

      // await assetUploader.Add($"tanks/{id}/armor.pb", tankArmor.ToByteArray());
    }

    async Task MangleIcon(UObject pda)
    {
      var id = pda.Get<FName>("TankId").Text;

      if (pda.TryGet<UTexture2D>("SmallIcon", out var smallIconTexture))
      {
        var smallIcon = BlitzKitExporter.Texture2D(smallIconTexture);
        // await assetUploader.Add($"tanks/{id}/icons/small.png", smallIcon);
      }
      else
      {
        PrettyLog.Warn($"Small icon missing for {id}");
      }

      if (pda.TryGet<UTexture2D>("BigIcon", out var bigIconTexture))
      {
        var bigIcon = BlitzKitExporter.Texture2D(bigIconTexture);
        // await assetUploader.Add($"tanks/{id}/icons/big.png", bigIcon);
      }
      else
      {
        PrettyLog.Warn($"Big icon missing for {id}");
      }
    }

    async Task MangleModules(Tank tank, UObject pda)
    {
      TankModel tankModel = new();

      foreach (var moduleType in CollisionDTs)
      {
        var dt = pda.Get<UDataTable>(moduleType);

        foreach (var row in dt.RowMap)
        {
          var moduleName = row.Key.Text;
          ModuleModel moduleModel = new();
          var visualData = row.Value.Get<UObject>("VisualData");
          var meshSettings = visualData.Get<FStructFallback>("MeshSettings");
          var boneTransform = meshSettings.Get<FStructFallback>("BoneTransform");

          switch (moduleType)
          {
            case "DT_Turrets":
            {
              Turret turret = new() { Id = moduleName };
              tank.Turrets[moduleName] = turret;
              break;
            }

            case "DT_Guns":
            {
              Gun gun = new() { Id = moduleName };
              tank.Guns[moduleName] = gun;
              break;
            }
          }

          if (boneTransform.TryGet<FVector>("Translation", out var translation))
          {
            moduleModel.Translation = BlitzKitExporter.Vector3(translation);
          }

          tankModel.Modules[moduleName] = moduleModel;

          if (meshSettings.TryGet<UStaticMesh>("CollisionMesh", out var collision))
          {
            MonoGltf gltf = new(collision);

            // await assetUploader.Add(
            //   new($"tanks/{tank.Id}/collision/{moduleName}.glb", gltf.Write())
            // );
          }
          else
          {
            PrettyLog.Warn($"No collision mesh found for {tank.Id} {moduleName}; skipping...");
          }
        }
      }

      // await assetUploader.Add($"tanks/{tank.Id}/model.pb", tankModel.ToByteArray());
    }
  }
}
