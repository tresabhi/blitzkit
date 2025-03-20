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
using CUE4Parse.UE4.Assets.Objects.Properties;
using CUE4Parse.UE4.Objects.UObject;
using CUE4Parse.Utils;
using Google.Protobuf;
using Google.Protobuf.Collections;
using Org.BouncyCastle.Asn1.Misc;
using YamlDotNet.Serialization;

namespace BlitzKit.CLI.Functions
{
  public partial class Mangler(string[] args)
  {
    static readonly string PenetrationGroupNameMapPrefix =
      "EMintSDKProtoData_BlitzStaticTankUpgradeSingleStage_PenetrationGroupUpgrade_TankPart";
    static readonly Dictionary<string, string> PenetrationGroupNameMap = new Dictionary<
      string,
      string
    >
    {
      { $"{PenetrationGroupNameMapPrefix}::TANK_PART_CHASSIS", "chassis" },
      { $"{PenetrationGroupNameMapPrefix}::TANK_PART_HULL", "hull" },
      { $"{PenetrationGroupNameMapPrefix}::TANK_PART_TURRET", "turret" },
      { $"{PenetrationGroupNameMapPrefix}::TANK_PART_GUN", "gun" },
    };

    [GeneratedRegex("[^a-z0-9]")]
    private static partial Regex NonAlphanumericRegex();

    [GeneratedRegex("--+")]
    private static partial Regex MultipleDashesRegex();

    [GeneratedRegex("-$")]
    private static partial Regex TrailingDashRegex();

    readonly BlitzProvider provider = new(args.Contains("--depot"));
    Locales? locales;
    readonly Dictionary<string, Dictionary<string, string>> strings = [];
    readonly AssetUploader assetUploader = new("mangled ue assets");

    public async Task Mangle()
    {
      await FetchStrings();
      await MangleNations();
      await assetUploader.Flush();
    }

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

    async Task MangleNations()
    {
      var dirs = provider.RootDirectory.GetDirectory("Blitz/Content/Tanks").Directories;
      TanksFull tanksFull = new();

      foreach (var dir in dirs)
      {
        if (dir.Key == "TankStub")
          continue;

        foreach (var tankDir in dir.Value.Directories)
        {
          // if (tankDir.Value.Name != "R90_IS_4")
          //   continue;

          var tank = await MangleTank(tankDir.Value);
          tanksFull.Tanks.Add(tank);
        }
      }

      DeduplicateSlugs(tanksFull);
      Tanks tanks = new();

      foreach (var tank in tanksFull.Tanks)
      {
        tanks.Tanks_.Add(tank.Id);
        await assetUploader.Add(new($"tanks/{tank.Id}/meta.pb", tank.ToByteArray()));
      }

      await assetUploader.Add(new("definitions/tanks.pb", tanks.ToByteArray()));
      await assetUploader.Add(new("definitions/tanks-full.pb", tanksFull.ToByteArray()));
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
        Console.WriteLine($"{duplicate.Key}:");

        foreach (var tank in duplicate.Value)
        {
          Console.WriteLine($"\t{tank.Id}");
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
          Console.WriteLine($"\t\t{tank.Slug}");
        }

        Console.WriteLine();
      }
    }

    async Task<Tank> MangleTank(VFS tankDir)
    {
      var pdaName = $"PDA_{tankDir.Name}";
      var pda = provider.LoadObject($"{tankDir.Path}/{pdaName}.{pdaName}");

      var id = PropertyUtil.Get<FName>(pda, "TankId").Text;
      var name = GetString($"TankEntity__{id.ToLowerInvariant()}__Short_Name");
      var slug = Diacritics.Remove(name.Locales["en"]).ToLower();
      slug = NonAlphanumericRegex().Replace(slug, "-");
      slug = MultipleDashesRegex().Replace(slug, "-");
      slug = TrailingDashRegex().Replace(slug, "");

      // await MangleHull(pda);
      // await MangleIcon(pda);

      Tank tank = new()
      {
        Id = id,
        Name = name,
        Slug = slug,
      };

      tank.PenetrationGroups.MergeFrom(MangleArmor(pda));

      return tank;
    }

    MapField<string, PenetrationGroup> MangleArmor(UObject pda)
    {
      var id = PropertyUtil.Get<FName>(pda, "TankId").Text;
      MapField<string, PenetrationGroup> groups = [];
      var attributes = PropertyUtil.Get<UObject>(pda, "DA_Attributes");
      PropertyUtil.TryGet<UScriptMap>(attributes, "PenetrationGroups", out var penetrationGroups);

      if (penetrationGroups == null)
      {
        PrettyLog.Warn($"Penetration groups missing for {id}; returning empty list");
        return groups;
      }

      foreach (var group in penetrationGroups.Properties)
      {
        var rawName = ((FName)group.Key.GenericValue!).Text;
        var name = PenetrationGroupNameMap[rawName];
        var armors = PropertyUtil.Get<UScriptMap>(
          group.Value!.GetValue<FStructFallback>()!,
          "PenetrationGroups"
        );
        PenetrationGroup penetrationGroup = new();

        foreach (var armorProperty in armors.Properties)
        {
          var armorName = ((FName)armorProperty.Key.GenericValue!).Text;
          var armorThickness = PropertyUtil.Get<float>(
            armorProperty.Value!.GetValue<FStructFallback>()!,
            "Armor"
          );
          penetrationGroup.Armors[armorName] = armorThickness;
        }

        groups[name] = penetrationGroup;
      }

      return groups;
    }

    async Task MangleIcon(UObject pda)
    {
      var id = PropertyUtil.Get<FName>(pda, "TankId").Text;
      PropertyUtil.TryGet<UTexture2D>(pda, "SmallIcon", out var smallIconTexture);
      PropertyUtil.TryGet<UTexture2D>(pda, "BigIcon", out var bigIconTexture);

      if (smallIconTexture is null)
      {
        PrettyLog.Warn($"Small icon missing for {id}");
      }
      else
      {
        var smallIcon = BlitzKitExporter.Texture2D(smallIconTexture);
        await assetUploader.Add(new($"tanks/{id}/icons/small.png", smallIcon));
      }

      if (bigIconTexture is null)
      {
        PrettyLog.Warn($"Big icon missing for {id}");
      }
      else
      {
        var bigIcon = BlitzKitExporter.Texture2D(bigIconTexture);
        await assetUploader.Add(new($"tanks/{id}/icons/big.png", bigIcon));
      }
    }

    async Task MangleHull(UObject pda)
    {
      var id = PropertyUtil.Get<FName>(pda, "TankId").Text;
      var hulls = PropertyUtil.Get<UDataTable>(pda, "DT_Hulls");
      UDataTableUtility.TryGetDataTableRow(hulls, "hull", StringComparison.Ordinal, out var hull);
      var hullVisualData = PropertyUtil.Get<UObject>(hull, "VisualData");
      var hullMeshSettings = PropertyUtil.Get<FStructFallback>(hullVisualData, "MeshSettings");
      var hullCollision = PropertyUtil.Get<UStaticMesh>(hullMeshSettings, "CollisionMesh");
      MonoGltf hullCollisionGltf = new(hullCollision);

      await assetUploader.Add(new($"tanks/{id}/collision/hull.glb", hullCollisionGltf.Write()));
    }
  }
}
